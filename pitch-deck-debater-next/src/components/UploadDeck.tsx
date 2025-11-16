"use client"
import { useState } from 'react'
import axios from 'axios'
import { useDebateStore } from '@/store/useDebateStore'
import type { UploadResponse } from '@/types'

export default function UploadDeck() {
  const { setUpload } = useDebateStore()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onUpload = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const { data } = await axios.post<UploadResponse>('/api/python/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUpload(data.deck_name, data.deck_type, data.summary, data.slides)
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold mb-2">Upload Your Pitch Deck</h2>
      <p className="text-sm text-gray-600 mb-4">Choose a PowerPoint file (.pptx)</p>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <input type="file" accept=".pptx" onChange={e => setFile(e.target.files?.[0] || null)} />
        <button className="btn-primary" onClick={onUpload} disabled={!file || loading}>
          {loading ? 'Parsing deck…' : 'Parse Deck'}
        </button>
      </div>
      {error && <div className="mt-3 text-red-700">{error}</div>}
    </div>
  )
}

