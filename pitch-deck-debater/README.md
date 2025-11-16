# Pitch Deck Debater

A multi-agent AI system that analyzes and improves pitch decks through simulated expert debates.

## Overview

Pitch Deck Debater uses multiple AI agents with different professional personas to analyze your pitch deck from various perspectives. The agents engage in multiple rounds of debate to provide comprehensive feedback and actionable recommendations. The system creates a **polished deck AND a detailed summary of potential weaknesses**, meeting the core project requirements.

## Features

- **Multi-Agent Analysis**: Six expert AI personas with balanced viewpoints
  - Skeptical perspectives (VC, Product, Marketing, Finance, Technical)
  - Enthusiastic perspective (Founder) for constructive debate dynamics
- **Iterative Debate**: 3 rounds of discussion with context-aware inter-agent responses
- **Comprehensive Reports**: Detailed PDF reports with:
  - **Dedicated Weaknesses Summary** (categorized by severity: critical/moderate/minor)
  - Prioritized recommendations with slide-specific actions
  - Consensus points where multiple experts agree
  - Key strengths to maintain
- **Improved Deck Generation**: Automated creation of improved presentation using actual debate insights
- **Easy-to-Use Interface**: Streamlit web application with real-time progress tracking

## Project Structure

```
pitch-deck-debater/
├── app.py                      # Main Streamlit application
├── agents/
│   ├── __init__.py
│   ├── personas.py            # AI agent persona definitions
│   ├── debate_engine.py       # Core debate logic
│   └── coordinator.py         # Orchestration layer
├── utils/
│   ├── __init__.py
│   ├── deck_parser.py         # PowerPoint extraction
│   ├── deck_generator.py      # PowerPoint generation
│   └── report_generator.py    # PDF report generation
├── requirements.txt
├── .env                       # API configuration
└── README.md
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pitch-deck-debater
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure your API key:
   - Copy `.env` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=your_api_key_here
```

## Usage

1. Start the Streamlit app:
```bash
streamlit run app.py
```

2. Open your browser to the provided URL (typically `http://localhost:8501`)

3. Upload your pitch deck (PPTX format)

4. Click "Start Debate" to begin the analysis

5. Download the improved deck and detailed report

## Agent Personas

The system includes six expert personas that create balanced debate dynamics:

### Skeptical/Critical Perspectives:

1. **Victoria Chen** - Venture Capitalist (Sequoia Capital)
   - Focus: Market size, scalability, team strength, competitive moat, ROI potential
   - Role: Skeptical investor evaluating investment worthiness

2. **Marcus Rodriguez** - Senior Product Manager (Google)
   - Focus: Product-market fit, user experience, feature prioritization, execution roadmap
   - Role: Critical of vague product descriptions

3. **Sarah Thompson** - CMO & Growth Marketing Expert
   - Focus: Target audience clarity, positioning, GTM strategy, brand differentiation
   - Role: Skeptical of unclear value propositions

4. **David Kim** - Financial Analyst (Goldman Sachs)
   - Focus: Financial projections, unit economics, burn rate, path to profitability, valuation
   - Role: Critical of unrealistic financial models

5. **Alex Patel** - Principal Engineer (Amazon)
   - Focus: Technical feasibility, scalability, security, technical debt
   - Role: Skeptical of overly ambitious technical claims

### Optimistic/Defensive Perspective:

6. **Jamie Rivers** - Serial Entrepreneur & Startup Founder
   - Focus: Innovation potential, market opportunities, disruption, long-term vision
   - Role: **Enthusiastic founder** who defends bold ideas and pushes back on overly conservative thinking
   - Creates constructive tension and balanced debate

## How It Works

1. **Parsing**: The system extracts all content from your PowerPoint deck (text, tables, notes)

2. **Round 1**: Each of the 6 agents provides initial analysis from their unique perspective

3. **Rounds 2-3**: Agents respond to each other's feedback with context-aware responses
   - Agents can agree, disagree, or build upon points raised by others
   - Full context from previous rounds (up to 800 chars per analysis)
   - Encourages inter-agent dialogue and trade-off discussions

4. **Synthesis**: A coordinator synthesizes all feedback using Claude API
   - Identifies consensus points where multiple personas agree
   - Extracts categorized weaknesses (critical/moderate/minor)
   - Generates prioritized, actionable recommendations
   - Highlights key strengths to maintain

5. **Generation**: Creates two outputs using actual debate insights
   - **Polished Deck**: PowerPoint with slide-by-slide improvements extracted from debate
   - **Detailed Report**: PDF with dedicated weaknesses summary section

## Configuration

Modify debate settings in `.env`:
```
NUM_DEBATE_ROUNDS=3  # Number of debate rounds (default: 3)
```

## Requirements

- Python 3.8+
- Anthropic API key
- PowerPoint files (.pptx format)

## Dependencies

- `streamlit`: Web application framework
- `anthropic`: Anthropic Claude API client
- `python-pptx`: PowerPoint file handling
- `reportlab`: PDF generation
- `python-dotenv`: Environment variable management

## Development

To extend the system:

- Add new personas in `agents/personas.py`
- Modify debate logic in `agents/debate_engine.py`
- Customize output in `utils/deck_generator.py` and `utils/report_generator.py`

## License

MIT License

## Contributing

Contributions welcome! Please open an issue or submit a pull request.

## Support

For issues or questions, please open a GitHub issue.
