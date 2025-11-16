import { create } from 'zustand';
import { AppState, DebateResults } from '@/types';

interface StoreState extends AppState {
  setSelectedAgents: (agents: string[]) => void;
  toggleAgent: (agentId: string) => void;
  setUploadedFile: (file: File | null) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setCurrentStep: (step: string) => void;
  setResults: (results: DebateResults | null) => void;
  setApiKeyLoaded: (loaded: boolean) => void;
  reset: () => void;
}

export const useStore = create<StoreState>((set) => ({
  selectedAgents: [],
  uploadedFile: null,
  isAnalyzing: false,
  currentStep: '',
  results: null,
  apiKeyLoaded: false,

  setSelectedAgents: (agents) => set({ selectedAgents: agents }),

  toggleAgent: (agentId) =>
    set((state) => ({
      selectedAgents: state.selectedAgents.includes(agentId)
        ? state.selectedAgents.filter((id) => id !== agentId)
        : [...state.selectedAgents, agentId],
    })),

  setUploadedFile: (file) => set({ uploadedFile: file }),

  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),

  setCurrentStep: (step) => set({ currentStep: step }),

  setResults: (results) => set({ results: results }),

  setApiKeyLoaded: (loaded) => set({ apiKeyLoaded: loaded }),

  reset: () =>
    set({
      selectedAgents: [],
      uploadedFile: null,
      isAnalyzing: false,
      currentStep: '',
      results: null,
    }),
}));
