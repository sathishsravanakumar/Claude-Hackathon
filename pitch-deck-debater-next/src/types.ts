export type Persona = {
  id: string
  name: string
  role: string
  emoji: string
  color: string
  image?: string
  voice?: string
}

export type PersonasPayload = {
  personas: Persona[]
  categories: Record<string, string[]>
}

export type Slide = {
  number: number
  title: string
  content: string
  notes?: string
  shape_count?: number
  layout_name?: string
}

export type DebateItem = {
  persona_id?: string
  persona_name?: string
  emoji?: string
  role?: string
  color?: string
  critique?: any
  raw_response?: string
  tokens_used?: number
  error?: string
}

export type DebateRound = {
  round: number
  slide_number: number
  slide_title: string
  debates: DebateItem[]
  elapsed_time?: number
  cache_stats?: { hits: number; misses: number }
}

export type CollaborativeDebate = {
  collaborative_debate?: {
    unified_feedback?: any
    debate_summary?: string
  }
  raw_debate?: string
  participating_experts?: number
  timestamp?: number
  error?: string
}

export type Synthesis = Record<string, any>

export type UploadResponse = {
  deck_name: string
  slides: Slide[]
  summary: Record<string, any>
  deck_type: string
}

export type AnalyzeResponse = {
  debate_round: DebateRound
  collaborative_debate: CollaborativeDebate
  synthesis: Synthesis
  cache_stats: Record<string, any>
}

