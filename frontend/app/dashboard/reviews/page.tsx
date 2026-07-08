'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { API_URL } from '@/lib/config'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/api/reviews`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        const list = d.reviews || []
        setReviews(list)
        if (list.length > 0) setSelected(list[0])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const severityIcon = (s: string) => s === 'error' ? '🔴' : s === 'warning' ? '⚠️' : '💡'
  const severityColor = (s: string) =>
    s === 'error' ? 'text-red-400' : s === 'warning' ? 'text-yellow-400' : 'text-blue-400'

    return (
        <div className="max-w-6xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-1">Reviews</h1>
                <p className="text-white/40 text-sm">Every PR your agent has reviewed</p>
            </div>

            <div className="grid grid-cols-5 gap-5 h-[calc(100vh-160px)]">

                {/* Left — review list */}
                <div className="col-span-2 flex flex-col gap-2 overflow-y-auto pr-1">
                    {loading ? (
                        [1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full bg-white/5 rounded-xl" />)
                    ) : reviews.length === 0 ? (
                        <div className="border border-white/10 rounded-xl p-6 text-center">
                            <div className="text-3xl mb-2">🔍</div>
                            <p className="text-white/40 text-sm">No reviews yet</p>
                        </div>
                    ) : (
                        reviews.map((review: any) => (
                            <div
                                key={review.id}
                                onClick={() => setSelected(review)}
                                className={`border rounded-xl p-4 cursor-pointer transition-all ${selected?.id === review.id
                                        ? 'border-blue-500/40 bg-blue-500/5'
                                        : 'border-white/10 hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded">
                                            #{review.prNumber}
                                        </span>
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
                                    <span className="text-white/20 text-xs">
                                        {review.commentsCount} flags
                                    </span>
                                </div>
                                <div className="text-sm text-white font-medium truncate">
                                    {review.prTitle || 'Untitled PR'}
                                </div>
                                <div className="text-white/30 text-xs mt-1 truncate">
                                    {review.repo?.fullName} · {new Date(review.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Right — review detail */}
                <div className="col-span-3 overflow-y-auto">
                    {!selected ? (
                        <div className="border border-white/10 rounded-xl h-full flex items-center justify-center">
                            <p className="text-white/30 text-sm">Select a review</p>
                        </div>
                    ) : (
                        <div className="border border-white/10 rounded-xl p-6">
                            {/* Header */}
                            <div className="mb-5 pb-5 border-b border-white/10">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded">
                                                PR #{selected.prNumber}
                                            </span>
                                            <Badge
                                                className={
                                                    selected.status === 'completed'
                                                        ? 'bg-green-500/10 text-green-400 border-green-500/20 text-xs'
                                                        : 'bg-red-500/10 text-red-400 border-red-500/20 text-xs'
                                                }
                                            >
                                                {selected.status}
                                            </Badge>
                                        </div>
                                        <h2 className="text-lg font-semibold text-white">
                                            {selected.prTitle || 'Untitled PR'}
                                        </h2>
                                        <p className="text-white/30 text-sm mt-0.5">{selected.repo?.fullName}</p>
                                    </div>
                                    {selected.commentUrl && (
                                        <a
                                            href={selected.commentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 text-xs hover:underline whitespace-nowrap mt-1"
                                        >
                                            View on GitHub →
                                        </a>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 mt-3 text-xs text-white/30">
                                    <span>📅 {new Date(selected.createdAt).toLocaleString()}</span>
                                    <span>💬 {selected.commentsCount} comments</span>
                                    <span>📄 {selected.filesReviewed} files</span>
                                </div>
                            </div>

                            {/* Comments */}
                            <div>
                                <h3 className="text-sm font-medium text-white/60 mb-3">
                                    Flags ({selected.comments?.length || 0})
                                </h3>

                                {!selected.comments || selected.comments.length === 0 ? (
                                    <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 text-center">
                                        <div className="text-2xl mb-1">✅</div>
                                        <p className="text-green-400 text-sm">No issues found</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selected.comments.map((comment: any) => (
                                            <div key={comment.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span>{severityIcon(comment.severity)}</span>
                                                    <span className={`text-xs font-semibold uppercase ${severityColor(comment.severity)}`}>
                                                        {comment.severity}
                                                    </span>
                                                    <span className="text-white/30 text-xs font-mono">
                                                        {comment.filename}:{comment.line}
                                                    </span>
                                                    <span className="ml-auto text-white/20 text-xs">
                                                        {Math.round(comment.confidence * 100)}% confidence
                                                    </span>
                                                </div>
                                                <p className="text-sm text-white/80 leading-relaxed">{comment.comment}</p>
                                                {comment.pastPrNumber && (
                                                    <div className="mt-2 flex items-center gap-1">
                                                        <span className="text-white/20 text-xs">Referenced from</span>
                                                        <span className="text-blue-400/60 text-xs font-mono">PR #{comment.pastPrNumber}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}