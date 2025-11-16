"""
Orchestration layer for the debate process
"""
from typing import Dict, Any, List
from .debate_engine import DebateEngine
from anthropic import Anthropic
import os
import json


class DebateCoordinator:
    """Coordinates the overall debate process"""

    def __init__(self, num_rounds: int = 3):
        """
        Initialize coordinator

        Args:
            num_rounds: Number of debate rounds to run (default: 3)
        """
        self.num_rounds = num_rounds
        self.debate_engine = DebateEngine()
        self.client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    def run_debate(self, deck_content: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run the complete debate process

        Args:
            deck_content: Parsed pitch deck content

        Returns:
            Complete debate results with synthesis
        """
        print(f"Starting debate process with {self.num_rounds} rounds...")

        # Run debate rounds
        for round_num in range(1, self.num_rounds + 1):
            print(f"Running round {round_num}/{self.num_rounds}...")
            self.debate_engine.run_debate_round(deck_content, round_num)

        # Synthesize results
        print("Synthesizing debate results...")
        synthesis = self.debate_engine.synthesize_debate(deck_content)

        return {
            "deck_content": deck_content,
            "rounds": synthesis["debate_history"],
            "synthesis": synthesis["synthesis"],
            "total_rounds": synthesis["total_rounds"],
            "status": "completed"
        }

    def get_recommendations(self, debate_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract structured recommendations from debate results

        Args:
            debate_results: Complete debate results

        Returns:
            Structured recommendations
        """
        return {
            "overall_score": self._extract_score(debate_results["synthesis"]),
            "key_strengths": self._extract_strengths(debate_results),
            "critical_issues": self._extract_issues(debate_results),
            "improvement_actions": self._extract_actions(debate_results),
            "consensus_points": self._extract_consensus(debate_results)
        }

    def _extract_score(self, synthesis: str) -> float:
        """Extract overall score from synthesis"""
        # Basic extraction - could be improved with structured output
        import re
        match = re.search(r'(\d+(?:\.\d+)?)\s*/\s*10', synthesis)
        return float(match.group(1)) if match else 5.0

    def _extract_strengths(self, debate_results: Dict[str, Any]) -> List[str]:
        """Extract key strengths mentioned across rounds"""
        prompt = f"""Analyze the following debate about a pitch deck and extract the KEY STRENGTHS that were identified.

Debate Synthesis:
{debate_results.get('synthesis', '')}

Extract 3-5 key strengths that were mentioned positively across the debate. Be specific and concise.
Return ONLY a JSON array of strings, e.g., ["strength 1", "strength 2", "strength 3"]"""

        response = self.client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}]
        )

        try:
            return json.loads(response.content[0].text)
        except:
            # Fallback if JSON parsing fails
            return [response.content[0].text]

    def _extract_issues(self, debate_results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract critical issues mentioned across rounds"""
        prompt = f"""Analyze the following debate about a pitch deck and extract CRITICAL ISSUES and WEAKNESSES.

Debate Synthesis:
{debate_results.get('synthesis', '')}

Extract 5-8 critical issues, categorized by severity. Return ONLY valid JSON in this exact format:
[
  {{"issue": "description of issue", "severity": "critical"}},
  {{"issue": "description of issue", "severity": "moderate"}},
  {{"issue": "description of issue", "severity": "minor"}}
]

Severity levels: critical, moderate, minor"""

        response = self.client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=1536,
            messages=[{"role": "user", "content": prompt}]
        )

        try:
            return json.loads(response.content[0].text)
        except:
            # Fallback if JSON parsing fails
            return [{"issue": response.content[0].text, "severity": "moderate"}]

    def _extract_actions(self, debate_results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract actionable recommendations"""
        prompt = f"""Analyze the following debate about a pitch deck and extract ACTIONABLE RECOMMENDATIONS.

Debate Synthesis:
{debate_results.get('synthesis', '')}

Extract 5-10 specific, actionable recommendations prioritized by impact. Return ONLY valid JSON in this exact format:
[
  {{"action": "specific action to take", "priority": "high", "slide": 1}},
  {{"action": "specific action to take", "priority": "medium", "slide": 3}},
  {{"action": "specific action to take", "priority": "low", "slide": null}}
]

Priority levels: high, medium, low
Include slide number if action is specific to a slide, otherwise use null"""

        response = self.client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=2048,
            messages=[{"role": "user", "content": prompt}]
        )

        try:
            return json.loads(response.content[0].text)
        except:
            # Fallback if JSON parsing fails
            return [{"action": response.content[0].text, "priority": "medium", "slide": None}]

    def _extract_consensus(self, debate_results: Dict[str, Any]) -> List[str]:
        """Extract points where multiple personas agree"""
        rounds = debate_results.get('rounds', [])

        prompt = f"""Analyze the following multi-round debate and identify CONSENSUS POINTS where multiple expert personas AGREE.

Debate Rounds:
{self._format_rounds_for_extraction(rounds)}

Extract 3-5 key points where at least 2-3 different experts expressed agreement or similar concerns.
Return ONLY a JSON array of strings, e.g., ["consensus point 1", "consensus point 2"]"""

        response = self.client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}]
        )

        try:
            return json.loads(response.content[0].text)
        except:
            # Fallback if JSON parsing fails
            return [response.content[0].text]

    def _format_rounds_for_extraction(self, rounds: List) -> str:
        """Format debate rounds for extraction prompts"""
        formatted = ""
        for i, round_data in enumerate(rounds, 1):
            formatted += f"\n=== Round {i} ===\n"
            for analysis in round_data:
                persona = analysis.get('persona', 'Unknown')
                analysis_text = analysis.get('analysis', '')[:500]  # Limit length
                formatted += f"{persona}: {analysis_text}...\n\n"
        return formatted
