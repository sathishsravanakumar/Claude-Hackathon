import { create } from 'zustand'
import { Persona, Slide } from '@/lib/api'

type DebateResult = {
  debate_round: any
  collaborative_debate: any
  synthesis: any
  cache_stats: any
}

type State = {
  personas: Persona[]
  byCategory: Record<string, string[]>
  selectedPersonas: string[]
  slides: Slide[]
  deckType: string
  currentSlide: number
  debates: Record<number, DebateResult>
}

type Actions = {
  setPersonas: (p: Persona[], by: Record<string, string[]>) => void
  togglePersona: (id: string) => void
  setSlides: (slides: Slide[], deckType: string) => void
  setCurrentSlide: (idx: number) => void
  setDebate: (idx: number, res: DebateResult) => void
  reset: () => void
}

export const useAppStore = create<State & Actions>((set, get) => ({
  personas: [],
  byCategory: {},
  selectedPersonas: [],
  slides: [],
  deckType: '',
  currentSlide: 0,
  debates: {},

  setPersonas: (p, by) => set({ personas: p, byCategory: by, selectedPersonas: p.map(x => x.id) }),
  togglePersona: (id) => set(({ selectedPersonas }) => ({
    selectedPersonas: selectedPersonas.includes(id)
      ? selectedPersonas.filter(x => x !== id)
      : [...selectedPersonas, id],
  })),
  setSlides: (slides, deckType) => set({ slides, deckType, currentSlide: 0, debates: {} }),
  setCurrentSlide: (idx) => set({ currentSlide: idx }),
  setDebate: (idx, res) => set(({ debates }) => ({ debates: { ...debates, [idx]: res } })),
  reset: () => set({ slides: [], deckType: '', currentSlide: 0, debates: {} }),
}))

