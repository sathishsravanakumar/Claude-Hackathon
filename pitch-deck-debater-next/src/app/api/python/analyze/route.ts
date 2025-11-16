import { NextRequest, NextResponse } from 'next/server'

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { slide_index, personas, slides, deck_type } = body

    if (slide_index === undefined || !personas || !slides) {
      return NextResponse.json(
        { error: 'Missing required fields: slide_index, personas, or slides' },
        { status: 400 }
      )
    }

    // Forward to Python backend
    const response = await fetch(`${PYTHON_API_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slide_index,
        personas,
        slides,
        deck_type,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Python API error:', errorText)
      throw new Error(`Python API returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error analyzing slide:', error)
    return NextResponse.json(
      { error: 'Failed to analyze slide', details: error.message },
      { status: 500 }
    )
  }
}
