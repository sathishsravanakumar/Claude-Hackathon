'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import ConfigPanel from '@/components/ConfigPanel';
import UploadSection from '@/components/UploadSection';
import UnifiedFeedback from '@/components/UnifiedFeedback';
import IndividualCritiques from '@/components/IndividualCritiques';
import Results from '@/components/Results';
import HomePage from '@/components/HomePage';
import { Presentation, Home as HomeIcon } from 'lucide-react';

export default function Home() {
  const [showHomePage, setShowHomePage] = useState(true);
  const [activeTab, setActiveTab] = useState<'upload' | 'feedback' | 'critiques' | 'results'>('upload');
  const { setApiKeyLoaded } = useStore();

  useEffect(() => {
    // Check if API key is loaded from environment
    fetch('/api/check-api-key')
      .then((res) => res.json())
      .then((data) => setApiKeyLoaded(data.loaded))
      .catch(() => setApiKeyLoaded(false));
  }, [setApiKeyLoaded]);

  // Show HomePage or Main App
  if (showHomePage) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <HomePage onGetStarted={() => setShowHomePage(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Home Button */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4 relative">
            {/* Home Button - Top Left */}
            <button
              onClick={() => setShowHomePage(true)}
              className="absolute left-0 top-0 flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white rounded-xl border-2 border-gray-300 hover:border-primary-400 transition-all text-gray-700 hover:text-primary-600 font-semibold shadow-md hover:shadow-lg"
            >
              <HomeIcon className="w-5 h-5" />
              Home
            </button>

            <Presentation className="w-12 h-12 text-primary-600" />
            <h1 className="text-5xl font-bold text-gray-900">
              AI Pitch Deck Debater
            </h1>
          </div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Multi-agent AI system for evaluating AI/ML company pitch decks
          </p>
        </div>

        {/* Configuration Panel */}
        <ConfigPanel />

        {/* Tabs */}
        <div className="mb-6 flex gap-3 flex-wrap justify-center">
          <button
            onClick={() => setActiveTab('upload')}
            className={`tab-button ${activeTab === 'upload' ? 'active' : 'inactive'}`}
          >
            📤 Upload
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`tab-button ${activeTab === 'feedback' ? 'active' : 'inactive'}`}
          >
            🎯 Unified Feedback
          </button>
          <button
            onClick={() => setActiveTab('critiques')}
            className={`tab-button ${activeTab === 'critiques' ? 'active' : 'inactive'}`}
          >
            👥 Individual Critiques
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`tab-button ${activeTab === 'results' ? 'active' : 'inactive'}`}
          >
            📊 Results
          </button>
        </div>

        {/* Tab Content */}
        <div className="glass-card p-6">
          {activeTab === 'upload' && <UploadSection />}
          {activeTab === 'feedback' && <UnifiedFeedback />}
          {activeTab === 'critiques' && <IndividualCritiques />}
          {activeTab === 'results' && <Results />}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Powered by Claude Haiku • Multi-Agent AI Analysis</p>
        </div>
      </div>
    </div>
  );
}

