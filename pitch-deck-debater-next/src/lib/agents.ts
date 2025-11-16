import { AgentPersona } from '@/types';

export const AGENT_PERSONAS: AgentPersona[] = [
  {
    id: 'ai_architect',
    name: 'Dr. Priya Sharma',
    role: 'Chief AI Architect',
    emoji: '🤖',
    category: 'technical',
    expertise: ['Model Architecture', 'Scalability', 'Technical Feasibility', 'Infrastructure'],
  },
  {
    id: 'data_science_lead',
    name: 'Marcus Chen',
    role: 'VP of Data Science',
    emoji: '📊',
    category: 'technical',
    expertise: ['Data Strategy', 'Model Performance', 'Experimentation', 'Data Quality'],
  },
  {
    id: 'mlops_engineer',
    name: 'Sarah Rodriguez',
    role: 'Head of MLOps',
    emoji: '⚙️',
    category: 'technical',
    expertise: ['Deployment', 'ML Pipelines', 'Monitoring', 'Cost Optimization'],
  },
  {
    id: 'ai_product_manager',
    name: 'Alex Kim',
    role: 'AI Product Lead',
    emoji: '🎯',
    category: 'business',
    expertise: ['Product-Market Fit', 'User Experience', 'Go-to-Market', 'Competitive Moat'],
  },
  {
    id: 'ai_ethics_expert',
    name: 'Dr. James Patterson',
    role: 'AI Ethics & Governance Lead',
    emoji: '⚖️',
    category: 'ethics',
    expertise: ['Bias Detection', 'Fairness', 'Privacy', 'Responsible AI'],
  },
  {
    id: 'ai_investor',
    name: 'Jennifer Wu',
    role: 'AI-Focused VC Partner',
    emoji: '💼',
    category: 'business',
    expertise: ['Investment Analysis', 'Market Sizing', 'Competitive Landscape', 'ROI'],
  },
];

export const getAgentsByCategory = (category: 'technical' | 'business' | 'ethics') => {
  return AGENT_PERSONAS.filter((agent) => agent.category === category);
};

export const getAgentById = (id: string) => {
  return AGENT_PERSONAS.find((agent) => agent.id === id);
};
