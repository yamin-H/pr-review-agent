'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { API_URL } from '@/lib/config'

const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL || 'https://pr-review-agent-1-3dhs.onrender.com'

export default function SettingsPage() {
  const [onboarding, setOnboarding] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<any>(null)

  async function runOnboarding() {
    const repo = prompt('Enter repo full name (e.g. yamin-H/my-repo):')
    if (!repo) return

    setOnboarding('loading')
    setResult(null)

    try {
      const res = await fetch(`${AGENT_URL}/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo,
          org_id: repo.split('/')[0],
          months_back: 6
        })
      })
      const data = await res.json()
      setResult(data)
      setOnboarding('done')
    } catch (err) {
      console.error(err)
      setOnboarding('error')
    }
  }

    return (
        <div className="max-w-2xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
                <p className="text-white/40 text-sm">Manage your repos and agent configuration</p>
            </div>

            {/* Onboarding */}
            <div className="border border-white/10 rounded-xl p-6 mb-4">
                <div className="flex items-start gap-4 mb-5">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl flex-shrink-0">
                        🧠
                    </div>
                    <div>
                        <h2 className="font-semibold text-white mb-1">Build Memory from Repo History</h2>
                        <p className="text-white/40 text-sm leading-relaxed">
                            Analyze the last 6 months of merged PRs to extract your team's past decisions.
                            Run this once per repo after installing the app.
                        </p>
                    </div>
                </div>

                {onboarding === 'done' && result && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4 flex items-center gap-2">
                        <span>✅</span>
                        <p className="text-green-400 text-sm">{result.message}</p>
                    </div>
                )}

                {onboarding === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 flex items-center gap-2">
                        <span>❌</span>
                        <p className="text-red-400 text-sm">Failed to analyze repo. Check the agent terminal.</p>
                    </div>
                )}

                <Button
                    onClick={runOnboarding}
                    disabled={onboarding === 'loading'}
                    className="bg-white text-black hover:bg-white/90 font-medium"
                >
                    {onboarding === 'loading' ? (
                        <span className="flex items-center gap-2">
                            <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            Analyzing repo history...
                        </span>
                    ) : 'Analyze Repo History'}
                </Button>
            </div>

            {/* GitHub App */}
            <div className="border border-white/10 rounded-xl p-6 mb-4">
                <div className="flex items-start gap-4 mb-5">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xl flex-shrink-0">
                        🐙
                    </div>
                    <div>
                        <h2 className="font-semibold text-white mb-1">GitHub App</h2>
                        <p className="text-white/40 text-sm">
                            Add more repos or manage which repos the agent has access to.
                        </p>
                    </div>
                </div>
                <a  
                    href="https://github.com/apps/pr-review-agent/installations/new"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Button variant="outline" className="border-white/20 text-black hover:bg-white/10 hover:text-gray-200 cursor-pointer">
                        Manage on GitHub →
                    </Button>
                </a>
            </div>

            {/* Account */}
            <div className="border border-white/10 rounded-xl p-6">
                <div className="flex items-start gap-4 mb-5">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-xl flex-shrink-0">
                        👤
                    </div>
                    <div>
                        <h2 className="font-semibold text-white mb-1">Account</h2>
                        <p className="text-white/40 text-sm">Sign out of the dashboard.</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 hover:text-white"
                    onClick={async () => {
                        await fetch(`${API_URL}/auth/logout`, {
                            method: 'POST',
                            credentials: 'include'
                        })
                        window.location.href = '/'
                    }}
                >
                    Sign out
                </Button>
            </div>
        </div>
    );
}