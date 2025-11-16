import { NextRequest, NextResponse } from 'next/server'

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Forward the file to Python backend
    const pythonFormData = new FormData()
    pythonFormData.append('file', file)

    const response = await fetch(`${PYTHON_API_URL}/upload`, {
      method: 'POST',
      body: pythonFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Python API error:', errorText)
      throw new Error(`Python API returned ${response.status}`)
    }

    const data = await response.json()

    // Transform response to match frontend expectations
    return NextResponse.json({
      deck_name: file.name,
      deck_type: data.deck_type,
      summary: data.summary,
      slides: data.slides,
    })
  } catch (error: any) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file to Python backend', details: error.message },
      { status: 500 }
    )
  }
}
