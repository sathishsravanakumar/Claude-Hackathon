"use client"

import { useState } from 'react'
import { useDebateStore } from '@/store/useDebateStore'

export default function DebateRounds() {
  const { slides, debates } = useDebateStore()
  const [selectedSlideIdx, setSelectedSlideIdx] = useState(0)

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

  if (!currentDebate || !currentDebate.collaborative_debate) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🗣️ Debate Rounds & Exchanges
          </h2>
          <p className="text-gray-700 mb-6 italic">
            View the collaborative debate between AI experts
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

  const collabDebate = currentDebate.collaborative_debate
  const debateSummary = collabDebate?.collaborative_debate?.debate_summary
  const rawDebate = collabDebate?.raw_debate
  const participatingExperts = collabDebate?.participating_experts || 0

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🗣️ Debate Rounds & Exchanges
        </h2>
        <p className="text-gray-700 mb-6 italic">
          View the collaborative debate between AI experts
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

        {/* Debate Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Participating Experts
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {participatingExperts}
            </div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Debate Status
            </div>
            <div className="text-2xl font-bold text-emerald-600">
              ✓ Completed
            </div>
          </div>
        </div>
      </div>

      {/* Debate Summary */}
      {debateSummary && (
        <div className="glass-card p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            💬 Debate Summary
          </h3>
          <p className="text-lg text-gray-800 leading-relaxed">
            {debateSummary}
          </p>
        </div>
      )}

      {/* Raw Debate Transcript */}
      {rawDebate && (
        <div className="glass-card p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            📜 Full Debate Transcript
          </h3>
          <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200 overflow-auto max-h-96">
            <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono leading-relaxed">
              {rawDebate}
            </pre>
          </div>
        </div>
      )}

      {/* Areas of Disagreement */}
      {collabDebate?.collaborative_debate?.unified_feedback?.areas_of_disagreement &&
        collabDebate.collaborative_debate.unified_feedback.areas_of_disagreement.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            ⚔️ Areas of Expert Disagreement
          </h3>
          <div className="space-y-4">
            {collabDebate.collaborative_debate.unified_feedback.areas_of_disagreement.map(
              (disagree: any, i: number) => (
                <div key={i} className="bg-white/90 p-5 rounded-xl border-2 border-gray-200">
                  <h4 className="font-bold text-primary-700 mb-3">
                    📌 {disagree.topic || 'Unknown topic'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="font-semibold text-blue-900 mb-2">
                        {disagree.viewpoint_a?.expert || 'Expert A'}:
                      </div>
                      <p className="text-gray-800">
                        {disagree.viewpoint_a?.position || 'No position'}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="font-semibold text-purple-900 mb-2">
                        {disagree.viewpoint_b?.expert || 'Expert B'}:
                      </div>
                      <p className="text-gray-800">
                        {disagree.viewpoint_b?.position || 'No position'}
                      </p>
                    </div>
                  </div>
                  {disagree.resolution && (
                    <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-500">
                      <div className="font-semibold text-emerald-900 mb-1">
                        💡 Resolution:
                      </div>
                      <p className="text-gray-800">{disagree.resolution}</p>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Debate Metadata */}
      <div className="glass-card p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          📊 Debate Metadata
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/90 p-4 rounded-lg">
            <div className="text-sm font-semibold text-gray-600 mb-1">
              Timestamp
            </div>
            <div className="text-gray-900">
              {collabDebate.timestamp
                ? new Date(collabDebate.timestamp * 1000).toLocaleString()
                : 'N/A'}
            </div>
          </div>
          <div className="bg-white/90 p-4 rounded-lg">
            <div className="text-sm font-semibold text-gray-600 mb-1">
              Debate Type
            </div>
            <div className="text-gray-900">
              Collaborative Multi-Agent
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
