import axios from 'axios'

export type Persona = { id: string; name: string; role: string; emoji: string; color: string }
export type Slide = { number: number; title: string; content: string; notes?: string }

export async function fetchPersonas() {
  const { data } = await axios.get('/api/python/personas')
  return data as { personas: Persona[]; by_category: Record<string, string[]> }
}

export async function uploadDeck(file: File) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await axios.post('/api/python/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data as { slides: Slide[]; summary: any; deck_type: string }
}

export async function analyzeSlide(params: {
  slide_index: number
  personas: string[]
  slides: Slide[]
  deck_type: string
}) {
  // FastAPI handler accepts two bodies; axios merges into one JSON object
  const { data } = await axios.post('/api/python/analyze', params)
  return data as {
    debate_round: any
    collaborative_debate: any
    synthesis: any
    cache_stats: any
  }
}

