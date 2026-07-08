'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const [repos, setRepos] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [memoryStats, setMemoryStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [reposRes, reviewsRes, memoryRes] = await Promise.all([
          fetch('http://localhost:3000/api/repos', { credentials: 'include' }),
          fetch('http://localhost:3000/api/reviews', { credentials: 'include' }),
          fetch('http://localhost:3000/api/memory/stats', { credentials: 'include' })
        ])
        const reposData = await reposRes.json()
        const reviewsData = await reviewsRes.json()
        const memoryData = await memoryRes.json()
        setRepos(reposData.repos || [])
        setReviews(reviewsData.reviews || [])
        setMemoryStats(memoryData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const completedReviews = reviews.filter(r => r.status === 'completed')
  const totalComments = reviews.reduce((sum: number, r: any) => sum + r.commentsCount, 0)

  const stats = [
    { label: 'Connected Repos', value: repos.length, icon: '📁' },
    { label: 'PRs Reviewed', value: completedReviews.length, icon: '🔍' },
    { label: 'Comments Posted', value: totalComments, icon: '💬' },
    { label: 'Memory Entries', value: memoryStats?.totalEntries || 0, icon: '🧠' }
  ]

    return (
        <div className="max-w-5xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-1">Overview</h1>
                <p className="text-white/40 text-sm">Your PR review agent at a glance</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-5">
                        {loading ? (
                            <>
                                <Skeleton className="h-8 w-16 mb-2 bg-white/10" />
                                <Skeleton className="h-3 w-24 bg-white/10" />
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl">{stat.icon}</span>
                                </div>
                                <div className="text-3xl font-bold text-white mt-2">{stat.value}</div>
                                <div className="text-white/40 text-xs mt-1">{stat.label}</div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Connected Repos */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-white">Connected Repos</h2>
                    <span className="text-white/30 text-xs">{repos.length} repos</span>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2].map(i => <Skeleton key={i} className="h-16 w-full bg-white/5" />)}
                    </div>
                ) : repos.length === 0 ? (
                    <div className="border border-white/10 rounded-xl p-8 text-center">
                        <div className="text-3xl mb-3">📭</div>
                        <p className="text-white/40 text-sm">No repos connected yet.</p>
                        <p className="text-white/20 text-xs mt-1">Install the GitHub App to get started.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {repos.map((repo: any) => (
                            <div
                                key={repo.id}
                                className="border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">
                                        📁
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm text-white">{repo.fullName}</div>
                                        <div className="text-white/30 text-xs mt-0.5">
                                            {repo._count.reviews} reviews · {repo._count.memoryEntries} memory entries
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {repo.private && (
                                        <Badge variant="outline" className="text-xs border-white/20 text-white/40">
                                            Private
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Reviews */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-white">Recent Reviews</h2>
                    <span className="text-white/30 text-xs">{reviews.length} total</span>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full bg-white/5" />)}
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="border border-white/10 rounded-xl p-8 text-center">
                        <div className="text-3xl mb-3">🔍</div>
                        <p className="text-white/40 text-sm">No reviews yet.</p>
                        <p className="text-white/20 text-xs mt-1">Open a PR on a connected repo.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {reviews.slice(0, 10).map((review: any) => (
                            <div
                                key={review.id}
                                className="border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-mono text-white/50">
                                        #{review.prNumber}
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm text-white">
                                            {review.prTitle || 'Untitled PR'}
                                        </div>
                                        <div className="text-white/30 text-xs mt-0.5">
                                            {review.repo?.fullName} · {review.commentsCount} comments · {new Date(review.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <Badge
                                    className={
                                        review.status === 'completed'
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20 text-xs'
                                            : review.status === 'failed'
                                                ? 'bg-red-500/10 text-red-400 border-red-500/20 text-xs'
                                                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs'
                                    }
                                >
                                    {review.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}