import { create } from 'zustand'
import type { Slide, DebateRound, CollaborativeDebate, Synthesis, Persona } from '@/types'

type DebateResult = {
  debate_round: DebateRound
  collaborative_debate?: CollaborativeDebate
  synthesis?: Synthesis
}

type State = {
  personas: Persona[]
  categories: Record<string, string[]>
  selectedPersonas: string[]
  deckName?: string
  deckType?: string
  summary?: Record<string, any>
  slides: Slide[]
  debates: Record<number, DebateResult>
  setPersonas: (p: Persona[], c: Record<string, string[]>) => void
  togglePersona: (id: string) => void
  setSelectedPersonas: (ids: string[]) => void
  setUpload: (name: string, type: string, summary: Record<string, any>, slides: Slide[]) => void
  setDebateResult: (slideIndex: number, r: DebateResult) => void
}

export const useDebateStore = create<State>((set, get) => ({
  personas: [],
  categories: {},
  selectedPersonas: [],
  deckName: undefined,
  deckType: undefined,
  summary: undefined,
  slides: [],
  debates: {},
  setPersonas: (p, c) => set({ personas: p, categories: c }),
  togglePersona: (id) => {
    const { selectedPersonas } = get()
    set({
      selectedPersonas: selectedPersonas.includes(id)
        ? selectedPersonas.filter(x => x !== id)
        : [...selectedPersonas, id],
    })
  },
  setSelectedPersonas: (ids) => set({ selectedPersonas: ids }),
  setUpload: (name, type, summary, slides) => set({ deckName: name, deckType: type, summary, slides }),
  setDebateResult: (idx, r) => set(state => ({ debates: { ...state.debates, [idx]: r } })),
}))

