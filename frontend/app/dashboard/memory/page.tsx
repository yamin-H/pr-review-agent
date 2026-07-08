'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function MemoryPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:3000/api/memory/stats', { credentials: 'include' })
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const outcomeStyle = (outcome: string) => {
    if (outcome === 'approved') return 'bg-green-500/10 text-green-400 border-green-500/20'
    if (outcome === 'rejected') return 'bg-red-500/10 text-red-400 border-red-500/20'
    return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
  }

  const typeIcon = (type: string) => {
    const map: Record<string, string> = {
      performance: '⚡',
      security: '🔒',
      style: '🎨',
      architecture: '🏗️',
      testing: '🧪',
      documentation: '📝'
    }
    return map[type] || '💡'
  }

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-1">Memory</h1>
                <p className="text-white/40 text-sm">
                    Everything your agent has learned from your team's PR history
                </p>
            </div>

            {/* Total count hero */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-xl p-6 mb-6 flex items-center gap-6">
                <div>
                    {loading ? (
                        <Skeleton className="h-14 w-24 bg-white/10" />
                    ) : (
                        <div className="text-6xl font-bold text-white">{stats?.totalEntries || 0}</div>
                    )}
                    <div className="text-white/40 text-sm mt-1">decisions stored</div>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div className="text-white/40 text-sm leading-relaxed">
                    Every approve and dismiss your team makes trains the agent.
                    The more history, the smarter the reviews.
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                {/* By type */}
                <div className="border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-white/60 mb-4">By Decision Type</h3>
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-5 w-full bg-white/5" />)}
                        </div>
                    ) : stats?.byDecisionType?.length === 0 ? (
                        <p className="text-white/20 text-sm">No data yet</p>
                    ) : (
                        <div className="space-y-3">
                            {stats?.byDecisionType?.map((item: any) => (
                                <div key={item.decisionType} className="flex items-center gap-2">
                                    <span>{typeIcon(item.decisionType)}</span>
                                    <span className="text-sm text-white/70 capitalize flex-1">{item.decisionType}</span>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-1.5 bg-blue-500/40 rounded-full"
                                            style={{
                                                width: `${Math.max(20, (item._count.decisionType / (stats?.totalEntries || 1)) * 80)}px`
                                            }}
                                        />
                                        <span className="text-sm text-white font-medium w-6 text-right">
                                            {item._count.decisionType}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* By outcome */}
                <div className="border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-white/60 mb-4">By Outcome</h3>
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-5 w-full bg-white/5" />)}
                        </div>
                    ) : stats?.byOutcome?.length === 0 ? (
                        <p className="text-white/20 text-sm">No data yet</p>
                    ) : (
                        <div className="space-y-3">
                            {stats?.byOutcome?.map((item: any) => (
                                <div key={item.outcome} className="flex items-center justify-between">
                                    <Badge className={`text-xs ${outcomeStyle(item.outcome)}`}>
                                        {item.outcome}
                                    </Badge>
                                    <span className="text-sm text-white font-medium">
                                        {item._count.outcome}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent decisions */}
            <div>
                <h2 className="text-base font-semibold text-white mb-4">Recent Decisions</h2>
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full bg-white/5 rounded-xl" />)}
                    </div>
                ) : !stats?.recentEntries?.length ? (
                    <div className="border border-white/10 rounded-xl p-8 text-center">
                        <div className="text-3xl mb-3">🧠</div>
                        <p className="text-white/40 text-sm">No memory entries yet.</p>
                        <p className="text-white/20 text-xs mt-1">
                            Run onboarding in Settings to build memory from your repo history.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {stats.recentEntries.map((entry: any) => (
                            <div key={entry.id} className="border border-white/10 rounded-xl p-4 hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-2 mb-2">
                                    <span>{typeIcon(entry.decisionType)}</span>
                                    <Badge className={`text-xs ${outcomeStyle(entry.outcome)}`}>
                                        {entry.outcome}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs border-white/10 text-white/30">
                                        {entry.decisionType}
                                    </Badge>
                                    <span className="ml-auto text-white/20 text-xs">
                                        PR #{entry.prNumber} · {entry.repo?.fullName}
                                    </span>
                                </div>
                                <p className="text-sm text-white/80 leading-relaxed">{entry.content}</p>
                                {entry.filePath && (
                                    <p className="text-white/20 text-xs mt-2 font-mono">{entry.filePath}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}