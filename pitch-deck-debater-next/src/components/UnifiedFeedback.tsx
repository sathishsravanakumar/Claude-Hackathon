"use client"

import { useState } from 'react'
import axios from 'axios'
import { useDebateStore } from '@/store/useDebateStore'
import type { AnalyzeResponse } from '@/types'

export default function UnifiedFeedback() {
  const { slides, selectedPersonas, debates, setDebateResult, deckType } = useDebateStore()
  const [selectedSlideIdx, setSelectedSlideIdx] = useState(0)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  if (!slides || slides.length === 0) {
    return (
      <div className="info-box text-center py-8">
        <p className="text-lg font-semibold text-primary-600">
          👆 Upload a pitch deck first
        </p>
      </div>
    )
  }

  const handleAnalyze = async () => {
    if (selectedPersonas.length === 0) {
      setError('⚠️ Select at least one agent from the configuration panel above')
      return
    }

    setAnalyzing(true)
    setError(null)
    setProgress(0)

    try {
      setProgress(20)
      const { data } = await axios.post<AnalyzeResponse>('/api/python/analyze', {
        slide_index: selectedSlideIdx,
        personas: selectedPersonas,
        slides: slides,
        deck_type: deckType || 'AI/ML Platform'
      })

      setProgress(100)
      setDebateResult(selectedSlideIdx, {
        debate_round: data.debate_round,
        collaborative_debate: data.collaborative_debate,
        synthesis: data.synthesis
      })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Analysis failed')
    } finally {
      setAnalyzing(false)
      setProgress(0)
    }
  }

  const currentDebate = debates[selectedSlideIdx]
  const unified = currentDebate?.collaborative_debate?.collaborative_debate?.unified_feedback

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🎯 Unified Expert Consensus
        </h2>
        <p className="text-gray-700 mb-6 italic">
          Synthesized feedback from all AI experts working together
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              📊 Select slide to analyze
            </label>
            <select
              value={selectedSlideIdx}
              onChange={(e) => setSelectedSlideIdx(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-all font-medium text-gray-900"
            >
              {slides.map((slide, idx) => (
                <option key={idx} value={idx}>
                  Slide {idx + 1}: {slide.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="btn-primary w-full"
            >
              {analyzing ? '🔄 Analyzing...' : '🎬 Analyze This Slide'}
            </button>
          </div>
        </div>

        {/* Slide Preview */}
        <details className="glass-card p-4 mb-6">
          <summary className="cursor-pointer font-semibold text-gray-900 hover:text-primary-600 transition-colors">
            📄 View Slide Content
          </summary>
          <div className="mt-4 space-y-2">
            <div className="font-bold text-gray-900">
              {slides[selectedSlideIdx]?.title}
            </div>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-900 overflow-auto max-h-64">
              {slides[selectedSlideIdx]?.content}
            </pre>
          </div>
        </details>

        {/* Progress Bar */}
        {analyzing && (
          <div className="mb-6">
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-400 rounded-xl mb-6">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}
      </div>

      {/* Unified Feedback Display */}
      {unified ? (
        <div className="space-y-6">
          {/* Consensus Score Card */}
          <div className="glass-card p-8 text-center bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-white/20">
            <div className="text-7xl font-bold text-white mb-2">
              {unified.overall_consensus_score >= 7 && '✅'}
              {unified.overall_consensus_score >= 5 && unified.overall_consensus_score < 7 && '⚠️'}
              {unified.overall_consensus_score < 5 && '🚨'}
              {' '}
              {unified.overall_consensus_score}/10
            </div>
            <div className="text-xl text-white font-medium">
              {unified.overall_consensus_score >= 7 && 'Strong consensus - proceed with confidence'}
              {unified.overall_consensus_score >= 5 && unified.overall_consensus_score < 7 && 'Mixed feedback - address concerns'}
              {unified.overall_consensus_score < 5 && 'Significant concerns - major revisions needed'}
            </div>
          </div>

          {/* Debate Summary */}
          {currentDebate?.collaborative_debate?.collaborative_debate?.debate_summary && (
            <div className="glass-card p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">💬 Debate Summary</h3>
              <p className="text-lg text-gray-800 leading-relaxed">
                {currentDebate.collaborative_debate.collaborative_debate.debate_summary}
              </p>
            </div>
          )}

          {/* Debate Transcript */}
          {(() => {
            const transcript = (currentDebate?.collaborative_debate?.collaborative_debate as any)?.debate_transcript
            return transcript && Array.isArray(transcript) && transcript.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">🗣️ Debate Transcript</h3>
                <p className="text-gray-700 italic mb-4">
                  Full conversation between the AI experts during their collaborative analysis:
                </p>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transcript.map((exchange: any, i: number) => (
                    <div key={i} className="bg-white/90 p-4 rounded-lg border-l-4 border-primary-400">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{exchange.emoji || '💭'}</div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 mb-1">
                            {exchange.speaker || exchange.persona_name}
                          </div>
                          <p className="text-gray-800">{exchange.message || exchange.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Questions for Client */}
          {unified.questions_for_client && unified.questions_for_client.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">❓ Questions for the Client</h3>
              <p className="text-gray-700 italic mb-4">
                These questions need to be answered to properly evaluate this slide:
              </p>
              <div className="space-y-4">
                {unified.questions_for_client.map((q: any, i: number) => (
                  <div key={i} className="bg-white/95 p-5 rounded-xl border-l-4 border-primary-600 shadow">
                    <h4 className="font-bold text-primary-700 mb-2">Question {i + 1}</h4>
                    <p className="text-lg font-semibold text-gray-900 mb-2">{q.question}</p>
                    <p className="text-gray-700 mb-2">
                      <strong>Why Important:</strong> {q.why_important}
                    </p>
                    {q.asked_by && q.asked_by.length > 0 && (
                      <p className="text-sm text-gray-600">
                        <strong>Asked by:</strong> {q.asked_by.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Areas of Agreement */}
          {unified.areas_of_agreement && unified.areas_of_agreement.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">✅ Areas of Expert Agreement</h3>
              <div className="space-y-3">
                {unified.areas_of_agreement.map((agree: any, i: number) => {
                  const icon = agree.severity === 'Critical' ? '🔴' : agree.severity === 'Major' ? '🟡' : '🟢'
                  return (
                    <div key={i} className="bg-white/90 p-4 rounded-lg">
                      <p className="font-semibold text-gray-900">
                        {icon} {agree.point}
                      </p>
                      {agree.supporting_experts && agree.supporting_experts.length > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                          Supported by: {agree.supporting_experts.join(', ')}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Priority Actions */}
          {unified.priority_actions && unified.priority_actions.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🎯 Priority Actions</h3>
              <div className="space-y-3">
                {['High', 'Medium', 'Low'].map(priority => {
                  const items = unified.priority_actions.filter((a: any) => a.priority === priority)
                  if (items.length === 0) return null
                  const emoji = priority === 'High' ? '🔴' : priority === 'Medium' ? '🟡' : '🟢'
                  const colorClass = priority === 'High' ? 'border-red-500 bg-red-50' : priority === 'Medium' ? 'border-amber-500 bg-amber-50' : 'border-emerald-500 bg-emerald-50'
                  return (
                    <div key={priority}>
                      <h4 className="font-bold text-gray-900 mb-2">{emoji} {priority} Priority Actions:</h4>
                      {items.map((action: any, i: number) => (
                        <div key={i} className={`p-4 rounded-lg border-l-4 ${colorClass} mb-2`}>
                          <h5 className="font-semibold text-gray-900 mb-1">{action.action}</h5>
                          <p className="text-gray-700 text-sm mb-1">
                            <strong>Rationale:</strong> {action.rationale}
                          </p>
                          <p className="text-gray-600 text-xs">
                            <strong>Estimated effort:</strong> {action.estimated_effort || 'Unknown'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Deal Breakers */}
          {unified.deal_breakers && unified.deal_breakers.length > 0 && (
            <div className="glass-card p-6 border-2 border-red-500">
              <h3 className="text-2xl font-bold text-red-700 mb-4">🚨 Deal Breakers</h3>
              <p className="text-red-600 font-semibold mb-3">
                Critical issues that could prevent investment/approval:
              </p>
              <ul className="space-y-2">
                {unified.deal_breakers.map((breaker: string, i: number) => (
                  <li key={i} className="text-gray-900">• {breaker}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Strengths to Maintain */}
          {unified.strengths_to_maintain && unified.strengths_to_maintain.length > 0 && (
            <div className="glass-card p-6 border-2 border-emerald-500">
              <h3 className="text-2xl font-bold text-emerald-700 mb-4">💪 Strengths to Maintain</h3>
              <div className="space-y-2">
                {unified.strengths_to_maintain.map((strength: string, i: number) => (
                  <div key={i} className="bg-emerald-50 p-3 rounded-lg text-emerald-800">
                    ✓ {strength}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          {unified.recommended_next_steps && unified.recommended_next_steps.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">📋 Recommended Next Steps</h3>
              <ol className="space-y-2 list-decimal list-inside">
                {unified.recommended_next_steps.map((step: string, i: number) => (
                  <li key={i} className="text-gray-900">{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      ) : (
        !analyzing && !error && currentDebate === undefined && (
          <div className="info-box text-center py-8">
            <p className="text-lg font-semibold text-primary-600">
              👆 Click 'Analyze This Slide' to start the AI debate
            </p>
          </div>
        )
      )}
    </div>
  )
}
