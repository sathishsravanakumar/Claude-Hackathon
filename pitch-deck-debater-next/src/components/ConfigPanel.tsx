"use client"

import { useEffect } from 'react'
import { useDebateStore } from '@/store/useDebateStore'
import { AGENT_PERSONAS } from '@/lib/agents'
import type { Persona } from '@/types'

export default function ConfigPanel() {
  const { personas, categories, selectedPersonas, setPersonas, togglePersona } = useDebateStore()

  useEffect(() => {
    // Load personas from static data
    const convertedPersonas: Persona[] = AGENT_PERSONAS.map(agent => ({
      id: agent.id,
      name: agent.name,
      emoji: agent.emoji,
      role: agent.role,
      category: agent.category,
    }))

    const categoriesMap: Record<string, string[]> = {
      '🔧 Technical Experts': AGENT_PERSONAS.filter(a => a.category === 'technical').map(a => a.id),
      '💼 Product & Business': AGENT_PERSONAS.filter(a => a.category === 'business').map(a => a.id),
      '⚖️ Governance': AGENT_PERSONAS.filter(a => a.category === 'ethics').map(a => a.id),
    }

    setPersonas(convertedPersonas, categoriesMap)
  }, [setPersonas])

  return (
    <div className="glass-card-blue p-8 mb-6">
      <h3 className="text-2xl font-bold text-primary-600 mb-6">
        ⚙️ Configuration & AI Agent Selection
      </h3>

      <div className="mb-6">
        <h4 className="text-lg font-semibold text-primary-600 mb-4">
          🎭 Select AI Expert Agents
        </h4>

        {Object.entries(categories).map(([cat, ids]) => (
          <div key={cat} className="mb-6">
            <h5 className="text-primary-600 font-bold text-sm uppercase tracking-widest mb-3 pb-2 border-b-2 border-primary-400/50">
              {cat}
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ids.map(id => {
                const p = personas.find(pp => pp.id === id)
                if (!p) return null
                const checked = selectedPersonas.includes(id)
                return (
                  <label
                    key={id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      checked
                        ? 'bg-primary-100 border-primary-400 shadow-md'
                        : 'bg-white/90 border-gray-200 hover:border-primary-300 hover:shadow'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-primary-600 cursor-pointer"
                      checked={checked}
                      onChange={() => togglePersona(id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {p.emoji} {p.name}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {p.role}
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t-2 border-primary-400/30">
        <div className="text-lg font-bold text-primary-600">
          Selected Agents: <span className="text-primary-700">{selectedPersonas.length}/{personas.length}</span>
        </div>
      </div>
    </div>
  )
}
