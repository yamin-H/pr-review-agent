'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function DigestPage() {
  const [digests, setDigests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:3000/api/digest/preview', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setDigests(d.digests || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

    return (
        <div className="max-w-3xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-1">Weekly Digest</h1>
                <p className="text-white/40 text-sm">
                    Sent every Monday. Full visibility into your team's code review patterns.
                </p>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => <Skeleton key={i} className="h-52 w-full bg-white/5 rounded-xl" />)}
                </div>
            ) : digests.length === 0 ? (
                <div className="border border-white/10 rounded-xl p-16 text-center">
                    <div className="text-5xl mb-4">📊</div>
                    <p className="text-white/50 text-base font-medium mb-1">No digests yet</p>
                    <p className="text-white/30 text-sm">
                        Your first digest will be generated and sent next Monday at 9am.
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                        Scheduled — every Monday 9:00 AM
                    </div>
                </div>
            ) : (
                <div className="space-y-5">
                    {digests.map((digest: any) => (
                        <div key={digest.id} className="border border-white/10 rounded-xl overflow-hidden">
                            {/* Digest header */}
                            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                                <div>
                                    <h2 className="font-semibold text-white">
                                        Week of {new Date(digest.weekOf).toLocaleDateString('en-US', {
                                            month: 'long', day: 'numeric', year: 'numeric'
                                        })}
                                    </h2>
                                    <p className="text-white/30 text-xs mt-0.5">{digest.org?.login}</p>
                                </div>
                                <div className="text-white/20 text-xs">
                                    {new Date(digest.weekOf).toLocaleDateString()}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-4 divide-x divide-white/10 border-b border-white/10">
                                {[
                                    { label: 'PRs Reviewed', value: digest.prsReviewed, color: 'text-white' },
                                    { label: 'Flags Raised', value: digest.flagsRaised, color: 'text-white' },
                                    { label: 'Approved', value: digest.flagsApproved, color: 'text-green-400' },
                                    { label: 'Dismissed', value: digest.flagsDismissed, color: 'text-white/50' },
                                ].map(stat => (
                                    <div key={stat.label} className="px-5 py-4 text-center">
                                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                                        <div className="text-white/30 text-xs mt-0.5">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Insights */}
                            <div className="p-5 space-y-3">
                                {digest.topIssue && (
                                    <div className="flex gap-3 bg-red-500/5 border border-red-500/15 rounded-lg p-3">
                                        <span className="text-lg">🔴</span>
                                        <div>
                                            <div className="text-xs font-medium text-red-400 mb-0.5">Most Common Issue</div>
                                            <p className="text-sm text-white/70">{digest.topIssue}</p>
                                        </div>
                                    </div>
                                )}

                                {digest.topDismissed && (
                                    <div className="flex gap-3 bg-green-500/5 border border-green-500/15 rounded-lg p-3">
                                        <span className="text-lg">🟢</span>
                                        <div>
                                            <div className="text-xs font-medium text-green-400 mb-0.5">Most Dismissed</div>
                                            <p className="text-sm text-white/70">{digest.topDismissed}</p>
                                        </div>
                                    </div>
                                )}

                                {digest.patternsLearned > 0 && (
                                    <div className="flex gap-3 bg-blue-500/5 border border-blue-500/15 rounded-lg p-3">
                                        <span className="text-lg">🧠</span>
                                        <div>
                                            <div className="text-xs font-medium text-blue-400 mb-0.5">Patterns Learned</div>
                                            <p className="text-sm text-white/70">
                                                {digest.patternsLearned} new patterns added to memory this week
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}