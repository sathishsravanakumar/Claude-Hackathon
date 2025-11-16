"use client"
import { useAppStore } from '@/store/useAppStore'

export default function PersonaSelector() {
  const personas = useAppStore(s => s.personas)
  const byCategory = useAppStore(s => s.byCategory)
  const selected = useAppStore(s => s.selectedPersonas)
  const toggle = useAppStore(s => s.togglePersona)

  if (!personas.length) return null

  return (
    <div className="card p-5 mb-6">
      <h3 className="text-lg font-bold text-primary-600 mb-3">Configuration</h3>
      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(byCategory).map(([category, ids]) => (
          <div key={category} className="agent-category">
            <h4 className="uppercase tracking-wide text-xs font-bold text-primary-600 border-b border-primary-400/50 pb-1 mb-2">{category}</h4>
            <div className="space-y-2">
              {ids.map(id => {
                const p = personas.find(x => x.id === id)
                if (!p) return null
                const active = selected.includes(id)
                return (
                  <label key={id} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-primary-600" checked={active} onChange={() => toggle(id)} />
                    <span>{p.emoji} {p.name}</span>
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-sm text-primary-600 font-semibold">
        Selected Agents: {selected.length}/{personas.length}
      </div>
    </div>
  )
}

