"use client"
import { uploadDeck } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'
import { useState } from 'react'

export default function FileUploader() {
  const setSlides = useAppStore(s => s.setSlides)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<any | null>(null)

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const res = await uploadDeck(file)
      setSlides(res.slides, res.deck_type)
      setSummary(res.summary)
    } catch (e: any) {
      setError(e?.response?.data?.detail || e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-6">
      <h2 className="section-title">📤 Upload Your Pitch Deck</h2>
      <div className="subtle-sep" />
      <div className="card p-6 mt-4">
        <input type="file" accept=".pptx" onChange={onChange} disabled={loading} />
        {loading && <p className="mt-3">🔍 Parsing your deck...</p>}
        {error && <p className="mt-3 text-red-600">❌ {error}</p>}
        {summary && (
          <div className="mt-4 text-sm grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="metric-container p-3 rounded-lg border">
              <div className="font-semibold">Total Slides</div>
              <div className="text-2xl font-extrabold">{summary.total_slides}</div>
            </div>
            <div className="metric-container p-3 rounded-lg border">
              <div className="font-semibold">Avg Length</div>
              <div className="text-2xl font-extrabold">{summary.avg_content_length}</div>
            </div>
            <div className="metric-container p-3 rounded-lg border">
              <div className="font-semibold">With Notes</div>
              <div className="text-2xl font-extrabold">{summary.slides_with_notes}</div>
            </div>
            <div className="metric-container p-3 rounded-lg border">
              <div className="font-semibold">Total Words</div>
              <div className="text-2xl font-extrabold">{summary.total_words}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

