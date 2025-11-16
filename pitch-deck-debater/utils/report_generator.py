"""
Report generator for debate results
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib import colors
from typing import Dict, Any
import io
from datetime import datetime
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from agents.coordinator import DebateCoordinator


class ReportGenerator:
    """Generate PDF reports of debate results"""

    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
        self.coordinator = DebateCoordinator()

    def _setup_custom_styles(self):
        """Setup custom paragraph styles"""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a1a1a'),
            spaceAfter=30
        ))

        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#2c3e50'),
            spaceAfter=12,
            spaceBefore=12
        ))

        self.styles.add(ParagraphStyle(
            name='CriticalIssue',
            parent=self.styles['Normal'],
            textColor=colors.HexColor('#c0392b'),
            leftIndent=20
        ))

        self.styles.add(ParagraphStyle(
            name='ModerateIssue',
            parent=self.styles['Normal'],
            textColor=colors.HexColor('#e67e22'),
            leftIndent=20
        ))

        self.styles.add(ParagraphStyle(
            name='MinorIssue',
            parent=self.styles['Normal'],
            textColor=colors.HexColor('#f39c12'),
            leftIndent=20
        ))

    def generate(self, debate_results: Dict[str, Any]) -> bytes:
        """
        Generate PDF report from debate results

        Args:
            debate_results: Complete debate results

        Returns:
            PDF file as bytes
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )

        # Build document content
        story = []

        # Title page
        story.extend(self._create_title_page(debate_results))

        # Executive summary
        story.extend(self._create_executive_summary(debate_results))

        # CRITICAL: Dedicated Weaknesses Summary Section
        story.extend(self._create_weaknesses_summary(debate_results))

        # Detailed analysis
        story.extend(self._create_detailed_analysis(debate_results))

        # Recommendations
        story.extend(self._create_recommendations(debate_results))

        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()

    def _create_title_page(self, debate_results: Dict[str, Any]) -> list:
        """Create title page elements"""
        elements = []

        title = Paragraph(
            "Pitch Deck Analysis Report",
            self.styles['CustomTitle']
        )
        elements.append(title)
        elements.append(Spacer(1, 0.2 * inch))

        date_text = Paragraph(
            f"Generated: {datetime.now().strftime('%B %d, %Y')}",
            self.styles['Normal']
        )
        elements.append(date_text)
        elements.append(Spacer(1, 0.3 * inch))

        # Summary stats
        total_rounds = debate_results.get('total_rounds', 0)
        deck_title = debate_results.get('deck_content', {}).get('metadata', {}).get('title', 'Untitled')

        info = f"""
        <b>Deck:</b> {deck_title}<br/>
        <b>Analysis Rounds:</b> {total_rounds}<br/>
        <b>Expert Personas:</b> 6 (VC, Product, Marketing, Finance, Technical, Founder)
        """

        info_paragraph = Paragraph(info, self.styles['Normal'])
        elements.append(info_paragraph)
        elements.append(PageBreak())

        return elements

    def _create_weaknesses_summary(self, debate_results: Dict[str, Any]) -> list:
        """Create dedicated weaknesses summary section - CORE REQUIREMENT"""
        elements = []

        header = Paragraph("Summary of Potential Weaknesses", self.styles['SectionHeader'])
        elements.append(header)
        elements.append(Spacer(1, 0.2 * inch))

        intro = Paragraph(
            "The multi-agent debate identified the following weaknesses, categorized by severity:",
            self.styles['Normal']
        )
        elements.append(intro)
        elements.append(Spacer(1, 0.2 * inch))

        # Extract weaknesses using coordinator
        recommendations = self.coordinator.get_recommendations(debate_results)
        issues = recommendations.get('critical_issues', [])

        # Group by severity
        critical = [i for i in issues if i.get('severity') == 'critical']
        moderate = [i for i in issues if i.get('severity') == 'moderate']
        minor = [i for i in issues if i.get('severity') == 'minor']

        # Critical Issues
        if critical:
            crit_header = Paragraph("<b>CRITICAL WEAKNESSES</b>", self.styles['Heading3'])
            elements.append(crit_header)
            elements.append(Spacer(1, 0.1 * inch))

            for issue in critical:
                issue_text = f"• {issue.get('issue', '')}"
                issue_para = Paragraph(issue_text, self.styles['CriticalIssue'])
                elements.append(issue_para)
                elements.append(Spacer(1, 0.05 * inch))

            elements.append(Spacer(1, 0.2 * inch))

        # Moderate Issues
        if moderate:
            mod_header = Paragraph("<b>MODERATE WEAKNESSES</b>", self.styles['Heading3'])
            elements.append(mod_header)
            elements.append(Spacer(1, 0.1 * inch))

            for issue in moderate:
                issue_text = f"• {issue.get('issue', '')}"
                issue_para = Paragraph(issue_text, self.styles['ModerateIssue'])
                elements.append(issue_para)
                elements.append(Spacer(1, 0.05 * inch))

            elements.append(Spacer(1, 0.2 * inch))

        # Minor Issues
        if minor:
            min_header = Paragraph("<b>MINOR WEAKNESSES</b>", self.styles['Heading3'])
            elements.append(min_header)
            elements.append(Spacer(1, 0.1 * inch))

            for issue in minor:
                issue_text = f"• {issue.get('issue', '')}"
                issue_para = Paragraph(issue_text, self.styles['MinorIssue'])
                elements.append(issue_para)
                elements.append(Spacer(1, 0.05 * inch))

            elements.append(Spacer(1, 0.2 * inch))

        # Consensus Points
        consensus = recommendations.get('consensus_points', [])
        if consensus:
            cons_header = Paragraph("<b>CONSENSUS CONCERNS</b>", self.styles['Heading3'])
            elements.append(cons_header)
            elements.append(Spacer(1, 0.1 * inch))

            cons_intro = Paragraph(
                "Multiple expert personas agreed on these concerns:",
                self.styles['Normal']
            )
            elements.append(cons_intro)
            elements.append(Spacer(1, 0.1 * inch))

            for point in consensus:
                point_text = f"• {point}"
                point_para = Paragraph(point_text, self.styles['Normal'])
                elements.append(point_para)
                elements.append(Spacer(1, 0.05 * inch))

        elements.append(PageBreak())
        return elements

    def _create_executive_summary(self, debate_results: Dict[str, Any]) -> list:
        """Create executive summary section"""
        elements = []

        header = Paragraph("Executive Summary", self.styles['SectionHeader'])
        elements.append(header)
        elements.append(Spacer(1, 0.2 * inch))

        synthesis = debate_results.get('synthesis', 'No synthesis available')
        # Take first 1000 chars for executive summary
        summary_text = synthesis[:1000] + "..." if len(synthesis) > 1000 else synthesis

        summary_paragraph = Paragraph(summary_text, self.styles['Normal'])
        elements.append(summary_paragraph)
        elements.append(Spacer(1, 0.3 * inch))

        return elements

    def _create_detailed_analysis(self, debate_results: Dict[str, Any]) -> list:
        """Create detailed analysis section"""
        elements = []

        header = Paragraph("Detailed Analysis by Round", self.styles['SectionHeader'])
        elements.append(header)
        elements.append(Spacer(1, 0.2 * inch))

        rounds = debate_results.get('rounds', [])

        for round_num, round_data in enumerate(rounds, 1):
            round_header = Paragraph(
                f"Round {round_num}",
                self.styles['Heading3']
            )
            elements.append(round_header)
            elements.append(Spacer(1, 0.1 * inch))

            for analysis in round_data:
                persona_name = analysis.get('persona', 'Unknown')
                persona_role = analysis.get('role', '')
                analysis_text = analysis.get('analysis', '')

                # Truncate long analyses
                if len(analysis_text) > 500:
                    analysis_text = analysis_text[:500] + "..."

                persona_text = f"<b>{persona_name}</b> ({persona_role})"
                persona_para = Paragraph(persona_text, self.styles['Normal'])
                elements.append(persona_para)
                elements.append(Spacer(1, 0.05 * inch))

                analysis_para = Paragraph(analysis_text, self.styles['Normal'])
                elements.append(analysis_para)
                elements.append(Spacer(1, 0.2 * inch))

            if round_num < len(rounds):
                elements.append(Spacer(1, 0.3 * inch))

        elements.append(PageBreak())
        return elements

    def _create_recommendations(self, debate_results: Dict[str, Any]) -> list:
        """Create recommendations section using actual debate data"""
        elements = []

        header = Paragraph("Key Recommendations", self.styles['SectionHeader'])
        elements.append(header)
        elements.append(Spacer(1, 0.2 * inch))

        intro = Paragraph(
            "Based on the multi-agent debate, here are prioritized, actionable recommendations:",
            self.styles['Normal']
        )
        elements.append(intro)
        elements.append(Spacer(1, 0.2 * inch))

        # Extract actual recommendations using coordinator
        recommendations = self.coordinator.get_recommendations(debate_results)
        actions = recommendations.get('improvement_actions', [])

        # Group by priority
        high_priority = [a for a in actions if a.get('priority') == 'high']
        medium_priority = [a for a in actions if a.get('priority') == 'medium']
        low_priority = [a for a in actions if a.get('priority') == 'low']

        # High Priority
        if high_priority:
            high_header = Paragraph("<b>HIGH PRIORITY:</b>", self.styles['Heading3'])
            elements.append(high_header)
            elements.append(Spacer(1, 0.1 * inch))

            for action in high_priority:
                slide_info = f" (Slide {action.get('slide')})" if action.get('slide') else ""
                action_text = f"• {action.get('action', '')}{slide_info}"
                action_para = Paragraph(action_text, self.styles['Normal'])
                elements.append(action_para)
                elements.append(Spacer(1, 0.05 * inch))

            elements.append(Spacer(1, 0.2 * inch))

        # Medium Priority
        if medium_priority:
            med_header = Paragraph("<b>MEDIUM PRIORITY:</b>", self.styles['Heading3'])
            elements.append(med_header)
            elements.append(Spacer(1, 0.1 * inch))

            for action in medium_priority:
                slide_info = f" (Slide {action.get('slide')})" if action.get('slide') else ""
                action_text = f"• {action.get('action', '')}{slide_info}"
                action_para = Paragraph(action_text, self.styles['Normal'])
                elements.append(action_para)
                elements.append(Spacer(1, 0.05 * inch))

            elements.append(Spacer(1, 0.2 * inch))

        # Low Priority
        if low_priority:
            low_header = Paragraph("<b>LOW PRIORITY:</b>", self.styles['Heading3'])
            elements.append(low_header)
            elements.append(Spacer(1, 0.1 * inch))

            for action in low_priority:
                slide_info = f" (Slide {action.get('slide')})" if action.get('slide') else ""
                action_text = f"• {action.get('action', '')}{slide_info}"
                action_para = Paragraph(action_text, self.styles['Normal'])
                elements.append(action_para)
                elements.append(Spacer(1, 0.05 * inch))

        # Key Strengths
        strengths = recommendations.get('key_strengths', [])
        if strengths:
            elements.append(Spacer(1, 0.3 * inch))
            strength_header = Paragraph("<b>KEY STRENGTHS TO MAINTAIN:</b>", self.styles['Heading3'])
            elements.append(strength_header)
            elements.append(Spacer(1, 0.1 * inch))

            for strength in strengths:
                strength_text = f"• {strength}"
                strength_para = Paragraph(strength_text, self.styles['Normal'])
                elements.append(strength_para)
                elements.append(Spacer(1, 0.05 * inch))

        return elements
