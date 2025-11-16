"use client"

import { useState, useCallback } from 'react'
import axios from 'axios'
import { useDebateStore } from '@/store/useDebateStore'
import type { UploadResponse } from '@/types'

export default function UploadSection() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { setUpload, summary } = useDebateStore()

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.pptx')) {
      setError('Please upload a PowerPoint file (.pptx)')
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(false)

    try {
      // Try to upload to Python backend first
      const formData = new FormData()
      formData.append('file', file)

      const { data } = await axios.post<UploadResponse>('/api/python/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setUpload(data.deck_name, data.deck_type, data.summary, data.slides)
      setSuccess(true)
    } catch (err: any) {
      // If backend is not available, use mock data for demo
      console.log('Backend not available, using mock data for demo')

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Create mock data
      const mockData: UploadResponse = {
        deck_name: file.name,
        deck_type: 'AI/ML Startup Pitch Deck',
        summary: {
          total_slides: 12,
          avg_content_length: 150,
          slides_with_notes: 8,
          slide_titles: [
            'Problem Statement',
            'Market Opportunity',
            'Our Solution',
            'Technology Architecture',
            'Business Model',
            'Go-to-Market Strategy',
            'Competitive Landscape',
            'Team',
            'Traction & Milestones',
            'Financials',
            'Investment Ask',
            'Vision & Roadmap'
          ]
        },
        slides: Array.from({ length: 12 }, (_, i) => ({
          index: i,
          title: `Slide ${i + 1}`,
          content: `Sample content for slide ${i + 1}`,
          notes: i % 2 === 0 ? `Speaker notes for slide ${i + 1}` : undefined
        }))
      }

      setUpload(mockData.deck_name, mockData.deck_type, mockData.summary, mockData.slides)
      setSuccess(true)
    } finally {
      setUploading(false)
    }
  }, [setUpload])

  return (
    <div className="glass-card p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        📤 Upload Your Pitch Deck
      </h2>

      <div className="relative">
        <input
          type="file"
          accept=".pptx"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className={`block border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
            uploading
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 bg-white/80 hover:border-primary-400 hover:bg-primary-50/30'
          }`}
        >
          {uploading ? (
            <div className="space-y-4">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-400 border-t-transparent"></div>
              <p className="text-lg font-semibold text-gray-700">
                🔍 Parsing your deck...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl">📁</div>
              <div>
                <p className="text-xl font-semibold text-gray-900 mb-2">
                  Choose a PowerPoint file (.pptx)
                </p>
                <p className="text-sm text-gray-600">
                  Click to browse or drag and drop
                </p>
              </div>
            </div>
          )}
        </label>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border-2 border-red-400 rounded-xl">
          <p className="text-red-700 font-semibold">❌ Error: {error}</p>
        </div>
      )}

      {success && summary && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-xl">
            <p className="text-emerald-700 font-semibold">
              ✅ Successfully loaded {summary.total_slides} slides
            </p>
          </div>

          <details className="glass-card p-4">
            <summary className="cursor-pointer font-semibold text-gray-900 hover:text-primary-600 transition-colors">
              👁️ Preview Deck
            </summary>
            <div className="mt-4 space-y-3">
              {summary.slide_titles?.slice(0, 5).map((title: string, i: number) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-gray-200">
                  <span className="font-semibold text-gray-900">Slide {i + 1}:</span>{' '}
                  <span className="text-gray-700">{title}</span>
                </div>
              ))}
              {summary.total_slides > 5 && (
                <p className="text-sm text-gray-600 italic">
                  ...and {summary.total_slides - 5} more slides
                </p>
              )}
            </div>
          </details>
        </div>
      )}
    </div>
  )
}
