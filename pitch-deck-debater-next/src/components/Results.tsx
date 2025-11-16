"use client"

import { useDebateStore } from '@/store/useDebateStore'

export default function Results() {
  const { slides, debates, deckName, deckType } = useDebateStore()

  const hasResults = Object.keys(debates).length > 0

  if (!hasResults) {
    return (
      <div className="info-box text-center py-8">
        <p className="text-lg font-semibold text-primary-600">
          Complete the debate first
        </p>
      </div>
    )
  }

  // Calculate overall statistics
  const allScores: number[] = []
  const synthesisData: any[] = []

  Object.entries(debates).forEach(([slideIdx, debate]) => {
    if (debate.debate_round?.debates) {
      debate.debate_round.debates.forEach((d: any) => {
        if (d.critique?.overall_score) {
          allScores.push(d.critique.overall_score)
        }
      })
    }
    if (debate.synthesis) {
      synthesisData.push({
        slideIdx: Number(slideIdx),
        synthesis: debate.synthesis
      })
    }
  })

  const avgScore = allScores.length > 0
    ? allScores.reduce((a, b) => a + b, 0) / allScores.length
    : 0

  const analyzedSlides = Object.keys(debates).length

  // Generate downloadable report
  const generateReport = () => {
    const report = {
      deck_name: deckName || 'unknown',
      deck_type: deckType || 'Unknown',
      analysis_date: new Date().toISOString(),
      overall_score: avgScore.toFixed(1),
      slides_analyzed: analyzedSlides,
      total_slides: slides?.length || 0,
      debates: debates,
      synthesis: synthesisData
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pitch-deck-analysis-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          📊 Analysis Report
        </h2>
        <p className="text-gray-700 mb-6 italic">
          Comprehensive analysis results and downloadable reports
        </p>

        {/* Overall Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-card p-6 text-center">
            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Overall Score
            </div>
            <div className="text-4xl font-bold text-gray-900">
              {avgScore.toFixed(1)}/10
            </div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Slides Analyzed
            </div>
            <div className="text-4xl font-bold text-gray-900">
              {analyzedSlides}
            </div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Deck Type
            </div>
            <div className="text-2xl font-bold text-primary-600 mt-2">
              {deckType || 'Unknown'}
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="flex justify-center">
          <button
            onClick={generateReport}
            className="btn-primary flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download Report (JSON)
          </button>
        </div>
      </div>

      {/* Detailed Results by Slide */}
      <div className="glass-card p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          📋 Detailed Results by Slide
        </h3>
        <div className="space-y-4">
          {Object.entries(debates).map(([slideIdx, debate]) => {
            const slide = slides?.[Number(slideIdx)]
            if (!slide) return null

            const synthesis = debate.synthesis
            const unified = debate.collaborative_debate?.collaborative_debate?.unified_feedback

            return (
              <details
                key={slideIdx}
                className="bg-white/90 p-5 rounded-xl border-2 border-gray-200"
              >
                <summary className="cursor-pointer font-bold text-lg text-gray-900 hover:text-primary-600 transition-colors">
                  Slide {slide.number}: {slide.title}
                  {unified?.overall_consensus_score && (
                    <span className="ml-3 text-sm font-semibold text-primary-600">
                      ({unified.overall_consensus_score}/10)
                    </span>
                  )}
                </summary>
                <div className="mt-4 space-y-4">
                  {/* Priority Fixes */}
                  {synthesis?.priority_fixes && synthesis.priority_fixes.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">🔧 Priority Fixes:</h4>
                      <div className="space-y-2">
                        {synthesis.priority_fixes.map((fix: any, i: number) => (
                          <div key={i} className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500">
                            <div className="font-semibold text-amber-900">
                              [{fix.severity || 'Minor'}] {fix.issue || 'Unknown'}
                            </div>
                            <div className="text-gray-800 text-sm mt-1">
                              <strong>Fix:</strong> {fix.fix || 'Unknown'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Improved Slide Content */}
                  {synthesis?.improved_slide_content && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">✨ Improved Content:</h4>
                      <div className="bg-emerald-50 p-4 rounded-lg border-2 border-emerald-200">
                        {synthesis.improved_slide_content.title && (
                          <div className="font-bold text-emerald-900 mb-2">
                            {synthesis.improved_slide_content.title}
                          </div>
                        )}
                        {synthesis.improved_slide_content.key_points && (
                          <ul className="space-y-1">
                            {synthesis.improved_slide_content.key_points.map((point: string, i: number) => (
                              <li key={i} className="text-gray-800">• {point}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Key Actions from Unified Feedback */}
                  {unified?.priority_actions && unified.priority_actions.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">🎯 Key Actions:</h4>
                      <div className="space-y-2">
                        {unified.priority_actions.slice(0, 3).map((action: any, i: number) => {
                          const priorityColor = action.priority === 'High' ? 'red' : action.priority === 'Medium' ? 'amber' : 'emerald'
                          return (
                            <div key={i} className={`bg-${priorityColor}-50 p-3 rounded-lg border-l-4 border-${priorityColor}-500`}>
                              <div className="font-semibold text-gray-900">
                                [{action.priority}] {action.action}
                              </div>
                              <div className="text-gray-700 text-sm mt-1">
                                {action.rationale}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Deal Breakers */}
                  {unified?.deal_breakers && unified.deal_breakers.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg border-2 border-red-400">
                      <h4 className="font-bold text-red-900 mb-2">🚨 Deal Breakers:</h4>
                      <ul className="space-y-1">
                        {unified.deal_breakers.map((breaker: string, i: number) => (
                          <li key={i} className="text-red-800">• {breaker}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Strengths */}
                  {unified?.strengths_to_maintain && unified.strengths_to_maintain.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">💪 Strengths to Maintain:</h4>
                      <div className="space-y-1">
                        {unified.strengths_to_maintain.map((strength: string, i: number) => (
                          <div key={i} className="bg-emerald-50 p-2 rounded text-emerald-800">
                            ✓ {strength}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </details>
            )
          })}
        </div>
      </div>

      {/* Export Options */}
      <div className="glass-card p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          📥 Export Options
        </h3>
        <div className="space-y-3">
          <button
            onClick={generateReport}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Download Full Analysis Report (JSON)
          </button>

          <div className="bg-primary-50 p-4 rounded-lg border-2 border-primary-200">
            <p className="text-primary-800 text-sm">
              <strong>Note:</strong> Additional export formats (PDF, PPTX with comments) coming soon!
            </p>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="glass-card p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          📈 Summary Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/90 p-4 rounded-lg">
            <div className="text-sm font-semibold text-gray-600 mb-2">
              Total Expert Reviews
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {Object.values(debates).reduce((sum, debate) => {
                return sum + (debate.debate_round?.debates?.length || 0)
              }, 0)}
            </div>
          </div>
          <div className="bg-white/90 p-4 rounded-lg">
            <div className="text-sm font-semibold text-gray-600 mb-2">
              Score Distribution
            </div>
            <div className="text-sm text-gray-800">
              <div>High (7-10): {allScores.filter(s => s >= 7).length}</div>
              <div>Medium (5-6): {allScores.filter(s => s >= 5 && s < 7).length}</div>
              <div>Low (0-4): {allScores.filter(s => s < 5).length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
