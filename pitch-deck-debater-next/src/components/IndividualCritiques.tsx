"use client"

import { useState } from 'react'
import { useDebateStore } from '@/store/useDebateStore'
import Image from 'next/image'
import axios from 'axios'

export default function IndividualCritiques() {
  const { slides, debates, personas } = useDebateStore()
  const [selectedSlideIdx, setSelectedSlideIdx] = useState(0)
  const [loadingAudio, setLoadingAudio] = useState<Record<number, boolean>>({})
  const [audioUrls, setAudioUrls] = useState<Record<number, string>>({})

  const generateAudio = async (idx: number, text: string, personaId: string) => {
    setLoadingAudio(prev => ({ ...prev, [idx]: true }))
    try {
      const response = await axios.post('/api/python/tts',
        { text, persona_id: personaId },
        { responseType: 'blob' }
      )
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      setAudioUrls(prev => ({ ...prev, [idx]: audioUrl }))
    } catch (error) {
      console.error('Error generating audio:', error)
      alert('Failed to generate audio. Please try again.')
    } finally {
      setLoadingAudio(prev => ({ ...prev, [idx]: false }))
    }
  }

  if (!slides || slides.length === 0) {
    return (
      <div className="info-box text-center py-8">
        <p className="text-lg font-semibold text-primary-600">
          👆 Upload a pitch deck first
        </p>
      </div>
    )
  }

  const currentDebate = debates[selectedSlideIdx]

  if (!currentDebate) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            👥 Individual Expert Critiques
          </h2>
          <p className="text-gray-700 mb-6 italic">
            Detailed feedback from each AI expert persona
          </p>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              📊 Select slide
            </label>
            <select
              value={selectedSlideIdx}
              onChange={(e) => setSelectedSlideIdx(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-all font-medium text-gray-900"
            >
              {slides.map((slide, idx) => (
                <option key={idx} value={idx}>
                  Slide {slide.number}: {slide.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="info-box text-center py-8">
          <p className="text-lg font-semibold text-primary-600">
            👈 Go to 'Unified Feedback' tab and analyze a slide first
          </p>
        </div>
      </div>
    )
  }

  const debates_array = currentDebate.debate_round?.debates || []

  // Calculate metrics
  const validDebates = debates_array.filter(
    (d: any) => !d.error && d.critique && typeof d.critique.overall_score === 'number'
  )
  const avgScore = validDebates.length > 0
    ? validDebates.reduce((sum: number, d: any) => sum + d.critique.overall_score, 0) / validDebates.length
    : 0

  const getScoreBadgeClass = (score: number) => {
    if (score >= 7) return 'badge-high bg-emerald-700'
    if (score >= 5) return 'badge-medium bg-amber-600'
    return 'badge-low bg-red-600'
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          👥 Individual Expert Critiques
        </h2>
        <p className="text-gray-700 mb-6 italic">
          Detailed feedback from each AI expert persona
        </p>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            📊 Select slide
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

        {/* Analysis Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Average Score
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {validDebates.length > 0 ? `${avgScore.toFixed(1)}/10` : 'N/A'}
            </div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Expert Agents
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {debates_array.length}
            </div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Analysis Time
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {currentDebate.debate_round?.elapsed_time
                ? `${currentDebate.debate_round.elapsed_time.toFixed(1)}s`
                : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Individual Agent Critiques */}
      <div className="space-y-6">
        {debates_array.map((agentDebate: any, idx: number) => {
          if (agentDebate.error) {
            return (
              <div key={idx} className="glass-card p-6 border-2 border-red-400">
                <p className="text-red-700 font-semibold">
                  ❌ {agentDebate.persona_name}: {agentDebate.error}
                </p>
              </div>
            )
          }

          const persona = personas.find(p => p.id === agentDebate.persona_id)
          const critique = agentDebate.critique || {}
          const score = critique.overall_score

          return (
            <div
              key={idx}
              className="glass-card p-6 hover:shadow-xl transition-all duration-300"
              style={{ borderLeft: `5px solid ${persona?.color || '#666'}` }}
            >
              {/* Agent Header */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {persona?.image ? (
                    <Image
                      src={persona.image}
                      alt={agentDebate.persona_name}
                      width={100}
                      height={100}
                      className="rounded-lg"
                    />
                  ) : (
                    <div
                      className="w-24 h-24 rounded-lg flex items-center justify-center text-4xl"
                      style={{ backgroundColor: `${persona?.color}20` }}
                    >
                      {agentDebate.emoji}
                    </div>
                  )}
                </div>

                {/* Name and Role */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {agentDebate.emoji} {agentDebate.persona_name}
                  </h3>
                  <p className="text-gray-600 text-sm">{agentDebate.role}</p>
                </div>

                {/* Score Badge */}
                {typeof score === 'number' && (
                  <div className="flex items-center">
                    <div className={`badge ${getScoreBadgeClass(score)} text-lg px-4 py-2`}>
                      {score}/10
                    </div>
                  </div>
                )}
              </div>

              {/* Audio Summary */}
              <div className="glass-card p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-primary-600">🔊 Listen to Audio Summary</h4>
                  {!audioUrls[idx] && !loadingAudio[idx] && (
                    <button
                      onClick={() => {
                        const summaryText = `${agentDebate.persona_name} feedback.
                          Overall score: ${score} out of 10.
                          Key strengths: ${critique.key_strengths?.join(', ') || 'None listed'}.
                          Critical issues: ${critique.critical_issues?.map((i: any) => typeof i === 'object' ? i.issue : i).join(', ') || 'None listed'}.
                          Recommendations: ${critique.recommendations?.map((r: any) => typeof r === 'object' ? r.action : r).join(', ') || 'None listed'}.`
                        generateAudio(idx, summaryText, agentDebate.persona_id)
                      }}
                      className="btn-primary text-sm"
                    >
                      Generate Audio
                    </button>
                  )}
                </div>
                {loadingAudio[idx] && (
                  <div className="text-sm text-gray-600 italic">
                    ⏳ Generating audio...
                  </div>
                )}
                {audioUrls[idx] && (
                  <audio controls className="w-full mt-2">
                    <source src={audioUrls[idx]} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                )}
              </div>

              {/* Critique Content */}
              <div className="space-y-4">
                {/* Key Strengths */}
                {critique.key_strengths && critique.key_strengths.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2">✅ Key Strengths:</h4>
                    <ul className="space-y-1">
                      {critique.key_strengths.map((strength: string, i: number) => (
                        <li key={i} className="text-gray-800">• {strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Critical Issues */}
                {critique.critical_issues && critique.critical_issues.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2">🚨 Critical Issues:</h4>
                    <ul className="space-y-2">
                      {critique.critical_issues.map((issue: any, i: number) => {
                        if (typeof issue === 'object') {
                          return (
                            <li key={i}>
                              <span className="font-semibold text-red-700">
                                [{issue.severity || 'Minor'}]
                              </span>{' '}
                              <span className="text-gray-900">{issue.issue || 'Unknown issue'}</span>
                              {issue.reasoning && (
                                <div className="ml-4 mt-1 text-gray-700 italic text-sm">
                                  {issue.reasoning}
                                </div>
                              )}
                            </li>
                          )
                        }
                        return <li key={i} className="text-gray-800">• {issue}</li>
                      })}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {critique.recommendations && critique.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2">💡 Recommendations:</h4>
                    <ul className="space-y-2">
                      {critique.recommendations.map((rec: any, i: number) => {
                        if (typeof rec === 'object') {
                          return (
                            <li key={i}>
                              <span className="font-semibold text-primary-600">
                                [{rec.priority || 'Medium'}]
                              </span>{' '}
                              <span className="text-gray-900">{rec.action || 'Unknown'}</span>
                              {rec.rationale && (
                                <div className="ml-4 mt-1 text-gray-700 italic text-sm">
                                  {rec.rationale}
                                </div>
                              )}
                            </li>
                          )
                        }
                        return <li key={i} className="text-gray-800">• {rec}</li>
                      })}
                    </ul>
                  </div>
                )}

                {/* Questions */}
                {critique.questions_to_answer && critique.questions_to_answer.length > 0 && (
                  <details className="glass-card p-4">
                    <summary className="cursor-pointer font-semibold text-gray-900 hover:text-primary-600">
                      ❓ Questions This Expert Wants Answered
                    </summary>
                    <ul className="mt-3 space-y-1">
                      {critique.questions_to_answer.map((q: string, i: number) => (
                        <li key={i} className="text-gray-800">• {q}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>

              {/* Raw Response Fallback */}
              {!critique.key_strengths && !critique.critical_issues && agentDebate.raw_response && (
                <div>
                  <p className="text-amber-700 font-semibold mb-2">
                    ⚠️ Response format unexpected - showing raw output:
                  </p>
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-900 overflow-auto max-h-96">
                    {agentDebate.raw_response}
                  </pre>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
