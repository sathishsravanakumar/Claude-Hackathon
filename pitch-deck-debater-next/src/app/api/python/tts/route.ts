import { NextRequest, NextResponse } from 'next/server'

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, persona_id } = body

    if (!text || !persona_id) {
      return NextResponse.json(
        { error: 'Missing text or persona_id' },
        { status: 400 }
      )
    }

    const response = await fetch(`${PYTHON_API_URL}/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, persona_id }),
    })

    if (!response.ok) {
      throw new Error(`Python API returned ${response.status}`)
    }

    const audioBuffer = await response.arrayBuffer()

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename=audio.mp3',
      },
    })
  } catch (error: any) {
    console.error('Error generating audio:', error)
    return NextResponse.json(
      { error: 'Failed to generate audio', details: error.message },
      { status: 500 }
    )
  }
}
