"use client"

import { Presentation, Brain, Users, MessageSquare, TrendingUp, Sparkles, ArrowRight } from 'lucide-react'

interface HomePageProps {
  onGetStarted: () => void
}

export default function HomePage({ onGetStarted }: HomePageProps) {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-4 mb-6">
          <Presentation className="w-20 h-20 text-primary-600" />
          <h1 className="text-6xl font-bold text-gray-900">
            AI Pitch Deck Debater
          </h1>
        </div>
        <p className="text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
          Get expert-level feedback on your pitch deck from multiple AI personas working together
        </p>
        <button
          onClick={onGetStarted}
          className="btn-primary text-xl px-8 py-4 inline-flex items-center gap-3 hover:scale-105 transition-transform"
        >
          Get Started <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* How It Works */}
      <div className="glass-card p-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center gap-3">
          <Sparkles className="w-10 h-10 text-primary-600" />
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="glass-card p-6 text-center hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Upload Your Deck</h3>
            <p className="text-gray-700">
              Upload your pitch deck in PDF or PowerPoint format. Our system extracts slides and content automatically.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-card p-6 text-center hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Select AI Experts</h3>
            <p className="text-gray-700">
              Choose from specialized AI personas like VCs, CTOs, Data Scientists, and more to review your deck.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-card p-6 text-center hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Get Expert Feedback</h3>
            <p className="text-gray-700">
              Receive detailed critiques, unified consensus, and actionable recommendations for each slide.
            </p>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="glass-card p-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feature 1 */}
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0">
              <Brain className="w-12 h-12 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Multi-Agent AI Analysis</h3>
              <p className="text-gray-700">
                Multiple specialized AI personas analyze your deck from different expert perspectives - VCs, technical leaders, data scientists, and more.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0">
              <MessageSquare className="w-12 h-12 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Collaborative Debate</h3>
              <p className="text-gray-700">
                AI experts engage in structured debates, challenging each other's perspectives to provide comprehensive feedback.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0">
              <Users className="w-12 h-12 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Individual Expert Critiques</h3>
              <p className="text-gray-700">
                View detailed feedback from each AI expert, including strengths, critical issues, and specific recommendations with audio summaries.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0">
              <TrendingUp className="w-12 h-12 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Unified Consensus</h3>
              <p className="text-gray-700">
                Get a synthesized view showing consensus scores, priority actions, deal breakers, and strengths to maintain across all experts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Personas Section */}
      <div className="glass-card p-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Meet Our AI Expert Personas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="text-4xl mb-2">💼</div>
            <div className="font-semibold text-gray-900">VC Partner</div>
            <div className="text-sm text-gray-600">Investment focus</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-4xl mb-2">🔬</div>
            <div className="font-semibold text-gray-900">AI Architect</div>
            <div className="text-sm text-gray-600">Technical depth</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-4xl mb-2">📊</div>
            <div className="font-semibold text-gray-900">Data Scientist</div>
            <div className="text-sm text-gray-600">ML validation</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-4xl mb-2">💰</div>
            <div className="font-semibold text-gray-900">CFO</div>
            <div className="text-sm text-gray-600">Financial analysis</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-4xl mb-2">🎨</div>
            <div className="font-semibold text-gray-900">Product Manager</div>
            <div className="text-sm text-gray-600">UX & market fit</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-4xl mb-2">🔒</div>
            <div className="font-semibold text-gray-900">Security Expert</div>
            <div className="text-sm text-gray-600">Risk assessment</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-4xl mb-2">📈</div>
            <div className="font-semibold text-gray-900">Growth Lead</div>
            <div className="text-sm text-gray-600">Scalability focus</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-4xl mb-2">⚖️</div>
            <div className="font-semibold text-gray-900">Legal Advisor</div>
            <div className="text-sm text-gray-600">Compliance review</div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="glass-card p-8 bg-gradient-to-br from-primary-50 to-blue-50">
        <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">Why Use AI Pitch Deck Debater?</h2>
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm mt-1">✓</div>
            <p className="text-lg text-gray-800"><strong>Save time:</strong> Get instant expert-level feedback instead of scheduling multiple meetings</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm mt-1">✓</div>
            <p className="text-lg text-gray-800"><strong>Multiple perspectives:</strong> See your deck through the eyes of diverse stakeholders</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm mt-1">✓</div>
            <p className="text-lg text-gray-800"><strong>Actionable insights:</strong> Receive prioritized recommendations you can implement immediately</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm mt-1">✓</div>
            <p className="text-lg text-gray-800"><strong>Improve quality:</strong> Identify and fix critical issues before presenting to real investors</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Ready to Get Expert Feedback?</h2>
        <p className="text-xl text-gray-700">Upload your pitch deck and start receiving insights in minutes</p>
        <button
          onClick={onGetStarted}
          className="btn-primary text-xl px-8 py-4 inline-flex items-center gap-3 hover:scale-105 transition-transform"
        >
          Start Analyzing Now <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Footer Info */}
      <div className="glass-card p-6 text-center">
        <p className="text-gray-700 mb-2">
          <strong>Powered by Claude Haiku</strong> - Anthropic's advanced AI model
        </p>
        <p className="text-sm text-gray-600">
          Multi-agent collaborative AI system for comprehensive pitch deck analysis
        </p>
      </div>
    </div>
  )
}
