export interface AgentPersona {
  id: string;
  name: string;
  role: string;
  emoji: string;
  category: 'technical' | 'business' | 'ethics';
  expertise: string[];
}

export interface DebateRound {
  round: number;
  topic: string;
  exchanges: DebateExchange[];
  consensus?: string;
}

export interface DebateExchange {
  agent: string;
  message: string;
  timestamp: string;
}

export interface IndividualCritique {
  agent: string;
  role: string;
  emoji: string;
  critique: string;
  rating: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  audioUrl?: string;
}

export interface UnifiedFeedback {
  overallRating: number;
  summary: string;
  keyStrengths: string[];
  criticalWeaknesses: string[];
  topRecommendations: string[];
  consensusAreas: string[];
  debateHighlights: string[];
}

export interface DebateResults {
  deckName: string;
  analysisDate: string;
  selectedAgents: string[];
  debateRounds: DebateRound[];
  individualCritiques: IndividualCritique[];
  unifiedFeedback: UnifiedFeedback;
  reportUrl?: string;
  improvedDeckUrl?: string;
}

export interface AppState {
  selectedAgents: string[];
  uploadedFile: File | null;
  isAnalyzing: boolean;
  currentStep: string;
  results: DebateResults | null;
  apiKeyLoaded: boolean;
}

export interface Persona {
  id: string;
  name: string;
  emoji: string;
  role: string;
  category: string;
}

export interface Slide {
  index: number;
  title: string;
  content: string;
  notes?: string;
}

export interface CollaborativeDebate {
  summary: string;
  participants: string[];
}

export interface Synthesis {
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface PersonasPayload {
  personas: Persona[];
  categories: Record<string, string[]>;
}

export interface UploadResponse {
  deck_name: string;
  deck_type: string;
  summary: Record<string, any>;
  slides: Slide[];
}

export interface AnalyzeResponse {
  debate_round: any;
  collaborative_debate: any;
  synthesis: any;
  cache_stats?: any;
}
