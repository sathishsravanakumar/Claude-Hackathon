@echo off
echo ========================================
echo Starting AI Pitch Deck Debater Backend
echo ========================================
echo.
echo Checking if .env file exists...
if not exist .env (
    echo Creating .env file...
    echo ANTHROPIC_API_KEY=your_api_key_here > .env
    echo.
    echo IMPORTANT: Please edit .env file and add your Anthropic API key!
    echo Get your key from: https://console.anthropic.com/
    echo.
    pause
)
echo.
echo Starting FastAPI server on port 8000...
python -m uvicorn api_server:app --reload --port 8000
