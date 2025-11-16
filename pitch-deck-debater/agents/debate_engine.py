"""
Core debate engine for multi-agent pitch deck analysis
"""
import os
import re
import json
import time
from typing import List, Dict, Optional

import anthropic


# ---- optional lenient parser (json5) ----
try:
    import json5  # type: ignore
    _HAS_JSON5 = True
except Exception:
    _HAS_JSON5 = False


def _parse_jsonish(text: str) -> Optional[Dict]:
    """
    Extract JSON from model text. Handles ```json fences, extra prose, and trailing commas.
    Returns dict or None.
    """
    if not isinstance(text, str) or not text.strip():
        return None

    s = text.strip()
    # strip fences
    s = re.sub(r"^```(?:json|JSON)?\s*|\s*```$", "", s, flags=re.DOTALL)
    # pull first {...}
    m = re.search(r"\{.*\}", s, flags=re.DOTALL)
    if not m:
        return None
    candidate = m.group(0)

    # strict json
    try:
        return json.loads(candidate)
    except Exception:
        pass

    # remove trailing commas
    candidate2 = re.sub(r",\s*([\]}])", r"\1", candidate)

    try:
        return json.loads(candidate2)
    except Exception:
        pass

    if _HAS_JSON5:
        try:
            return json5.loads(candidate2)
        except Exception:
            return None

    return None


class DebateEngine:
    def __init__(self, api_key: Optional[str] = None):
        self.client = anthropic.Anthropic(
            api_key=api_key or os.getenv("ANTHROPIC_API_KEY")
        )
        self.cache_stats = {"hits": 0, "misses": 0}

    def create_debate_round(
        self,
        slide_data: Dict,
        personas: List[str],
        round_number: int = 1,
        previous_debates: Optional[List] = None
    ) -> Dict:
        """Run one round of debate on a slide with selected personas"""
        from agents.personas import get_persona

        debates = []
        start_time = time.time()

        for persona_id in personas:
            persona = get_persona(persona_id)
            if not persona:
                continue

            context = self._build_context(slide_data, previous_debates, persona_id)

            try:
                response = self.client.messages.create(
                    model="claude-3-5-haiku-20241022",
                    max_tokens=2500,
                    temperature=0.7,
                    system=[
                        {
                            "type": "text",
                            "text": persona["system_prompt"],
                            "cache_control": {"type": "ephemeral"}
                        },
                        {
                            "type": "text",
                            "text": context,
                            "cache_control": {"type": "ephemeral"}
                        }
                    ],
                    messages=[{
                        "role": "user",
                        "content": self._create_analysis_prompt(slide_data, round_number)
                    }]
                )

                usage = response.usage
                if getattr(usage, "cache_read_input_tokens", 0) > 0:
                    self.cache_stats["hits"] += 1
                else:
                    self.cache_stats["misses"] += 1

                critique_text = response.content[0].text
                critique = self._parse_critique(critique_text)

                # ensure parsed flag so UI knows
                if isinstance(critique, dict) and "parsed" not in critique:
                    critique["parsed"] = True

                debates.append({
                    "persona_id": persona_id,
                    "persona_name": persona["name"],
                    "emoji": persona["emoji"],
                    "role": persona["role"],
                    "color": persona["color"],
                    "critique": critique,
                    "raw_response": critique_text,
                    "tokens_used": getattr(usage, "input_tokens", 0) + getattr(usage, "output_tokens", 0)
                })

            except Exception as e:
                debates.append({
                    "persona_id": persona_id,
                    "persona_name": persona["name"],
                    "emoji": persona["emoji"],
                    "error": str(e)
                })

        elapsed_time = time.time() - start_time

        return {
            "round": round_number,
            "slide_number": slide_data['number'],
            "slide_title": slide_data['title'],
            "debates": debates,
            "elapsed_time": elapsed_time,
            "cache_stats": self.cache_stats.copy()
        }

    def synthesize_feedback(self, debate_round: Dict, deck_context: Optional[str] = None) -> Dict:
        """Synthesize feedback from all agents into actionable recommendations"""
        all_feedback = []
        for d in debate_round['debates']:
            if 'error' not in d:
                all_feedback.append(
                    f"{d['emoji']} {d['persona_name']} ({d['role']}):\n{d['raw_response']}\n"
                )

        combined_feedback = "\n".join(all_feedback)

        coordinator_prompt = f"""You are an expert AI/ML pitch deck consultant synthesizing feedback from multiple technical and business experts.

Deck Context: {deck_context if deck_context else "AI/ML company pitch deck"}

Expert Feedback:
{combined_feedback}

Provide a comprehensive synthesis in JSON format:
{{
    "overall_score": 1-10,
    "consensus_issues": ["Issue all experts agree on"],
    "technical_concerns": ["Technical feasibility issues"],
    "business_concerns": ["Market/business model issues"],
    "ethical_concerns": ["AI ethics, bias, compliance issues"],
    "priority_fixes": [
        {{
            "severity": "Critical|Major|Minor",
            "category": "Technical|Business|Ethics|Product",
            "issue": "Specific problem",
            "fix": "Concrete actionable solution",
            "impact": "Why this matters"
        }}
    ],
    "improved_slide_content": {{
        "title": "Improved title",
        "key_points": ["Bullet 1", "Bullet 2", "Bullet 3"],
        "speaker_notes": "What to say when presenting"
    }},
    "questions_investors_will_ask": ["Question 1", "Question 2"],
    "strengths_to_emphasize": ["What's working well"]
}}

Be specific and actionable."""

        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-5-20250929",
                max_tokens=4000,
                temperature=0.5,
                system="You are an expert AI/ML pitch deck consultant providing structured, actionable feedback.",
                messages=[{
                    "role": "user",
                    "content": coordinator_prompt
                }]
            )

            synthesis_text = response.content[0].text
            synthesis = self._parse_json_response(synthesis_text) or {}
            synthesis["synthesis_timestamp"] = time.time()
            synthesis["raw_synthesis"] = synthesis_text

            return synthesis

        except Exception as e:
            return {
                "error": str(e),
                "raw_feedback": combined_feedback
            }

    def _create_analysis_prompt(self, slide_data: Dict, round_number: int) -> str:
        """Create the analysis prompt for agents"""
        return f"""Analyze slide #{slide_data['number']} from an AI/ML company pitch deck.

**Slide Title:** {slide_data['title']}

**Slide Content:**
{slide_data['content']}

**Speaker Notes:**
{slide_data.get('notes', 'None provided')}

Provide your expert critique in JSON format:
{{
    "overall_score": 1-10,
    "key_strengths": ["Specific strength 1"],
    "critical_issues": [
        {{
            "issue": "Specific problem",
            "severity": "Critical|Major|Minor",
            "reasoning": "Why this is a problem"
        }}
    ],
    "recommendations": [
        {{
            "action": "Specific fix",
            "rationale": "Why this helps",
            "priority": "High|Medium|Low"
        }}
    ],
    "questions_to_answer": ["Question 1"]
}}

Be specific, technical, and actionable."""

    def _build_context(self, slide_data: Dict, previous_debates: Optional[List], current_persona_id: str) -> str:
        """Build context from previous debate rounds"""
        if not previous_debates:
            return f"""This is the first analysis of slide {slide_data['number']}: "{slide_data['title']}"

Approach this with fresh eyes and deep technical expertise."""

        context_parts = [
            f"Previous analysis context for slide {slide_data['number']}:",
            "\nConsider these perspectives but provide your independent expert analysis."
        ]

        return "\n".join(context_parts)

    def _parse_critique(self, critique_text: str) -> Dict:
        """Parse critique text into structured format"""
        parsed = self._parse_json_response(critique_text)
        if parsed:
            if "parsed" not in parsed:
                parsed["parsed"] = True
            return parsed

        return {
            "overall_score": 5,
            "critique_text": critique_text,
            "parsed": False
        }

    def _parse_json_response(self, text: str) -> Optional[Dict]:
        """Extract and parse JSON from text response (robust)"""
        if not isinstance(text, str) or not text.strip():
            return None

        # 1) strict json
        try:
            return json.loads(text)
        except Exception:
            pass

        # 2) try jsonish (fences, trailing commas)
        js = _parse_jsonish(text)
        if isinstance(js, dict):
            return js

        return None

    def collaborative_debate_round(self, debate_round: Dict, deck_context: Optional[str] = None) -> Dict:
        """
        Run a collaborative debate where agents discuss together and produce unified feedback

        Args:
            debate_round: Initial individual critiques from agents
            deck_context: Context about the deck type

        Returns:
            Unified feedback with consensus and questions for the client
        """
        from agents.personas import get_persona

        # Gather all individual critiques
        all_critiques = []
        participating_personas = []

        for d in debate_round['debates']:
            if 'error' not in d and 'critique' in d:
                persona = get_persona(d['persona_id'])
                all_critiques.append({
                    "name": d['persona_name'],
                    "role": d['role'],
                    "emoji": d['emoji'],
                    "critique": d['raw_response']
                })
                participating_personas.append(f"{d['emoji']} {d['persona_name']} ({d['role']})")

        # Create collaborative debate prompt
        critiques_text = "\n\n".join([
            f"{c['emoji']} {c['name']} ({c['role']}):\n{c['critique']}"
            for c in all_critiques
        ])

        debate_prompt = f"""You are moderating a collaborative debate session for an AI/ML pitch deck review.

**Slide Context:**
Title: {debate_round['slide_title']}
Deck Type: {deck_context or 'AI/ML company'}

**Participating Experts:**
{chr(10).join(participating_personas)}

**Individual Critiques:**
{critiques_text}

**Your Task:**
Facilitate a collaborative discussion where these experts debate and reach consensus. Synthesize their viewpoints into a unified feedback report.

Output format (JSON):
{{
    "unified_feedback": {{
        "overall_consensus_score": 1-10,
        "areas_of_agreement": [
            {{
                "point": "What all/most experts agree on",
                "supporting_experts": ["Dr. Priya Sharma", "Marcus Chen"],
                "severity": "Critical|Major|Minor"
            }}
        ],
        "areas_of_disagreement": [
            {{
                "topic": "What experts disagree about",
                "viewpoint_a": {{"expert": "Name", "position": "Their stance"}},
                "viewpoint_b": {{"expert": "Name", "position": "Their stance"}},
                "resolution": "How to balance these perspectives"
            }}
        ],
        "priority_actions": [
            {{
                "action": "Specific actionable item",
                "rationale": "Why this is important (consensus from experts)",
                "priority": "High|Medium|Low",
                "estimated_effort": "Hours/Days/Weeks"
            }}
        ],
        "questions_for_client": [
            {{
                "question": "Specific question we need answered",
                "why_important": "Why this matters for evaluation",
                "asked_by": ["Expert name(s)"]
            }}
        ],
        "strengths_to_maintain": ["Strength 1", "Strength 2"],
        "deal_breakers": ["Critical issues that would prevent investment/approval"],
        "recommended_next_steps": ["Step 1", "Step 2", "Step 3"]
    }},
    "debate_summary": "2-3 sentence summary of the collaborative discussion"
}}

Be specific and actionable. Highlight where experts converged vs diverged."""

        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-5-20250929",
                max_tokens=5000,
                temperature=0.6,
                system="You are an expert moderator facilitating collaborative AI/ML pitch deck reviews.",
                messages=[{
                    "role": "user",
                    "content": debate_prompt
                }]
            )

            debate_text = response.content[0].text
            debate_result = self._parse_json_response(debate_text) or {}

            return {
                "collaborative_debate": debate_result,
                "raw_debate": debate_text,
                "participating_experts": len(all_critiques),
                "timestamp": time.time()
            }

        except Exception as e:
            return {
                "error": str(e),
                "participating_experts": len(all_critiques)
            }

    def get_cache_efficiency(self) -> Dict:
        """Get cache performance statistics - FIXED FOR DIVISION BY ZERO"""
        total = self.cache_stats["hits"] + self.cache_stats["misses"]

        if total > 0:
            hit_rate = (self.cache_stats["hits"] / total) * 100
            cost_savings = round(hit_rate * 0.9, 0)
        else:
            hit_rate = 0
            cost_savings = 0

        return {
            "cache_hits": self.cache_stats["hits"],
            "cache_misses": self.cache_stats["misses"],
            "hit_rate_percent": round(hit_rate, 1),
            "estimated_cost_savings": f"{int(cost_savings)}%"
        }
