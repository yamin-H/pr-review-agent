interface User {
  id: string
  githubId: string
  login: string
  avatarUrl: string
}

interface Repo {
  id: string
  name: string
  fullName: string
  private: boolean
  org: { login: string }
  _count: {
    reviews: number
    memoryEntries: number
  }
}

interface ReviewComment {
  id: string
  filename: string
  line: number
  severity: string
  comment: string
  confidence: number
  pastPrNumber: number | null
}

interface Review {
  id: string
  prNumber: number
  prTitle: string | null
  status: string
  commentUrl: string | null
  filesReviewed: number
  commentsCount: number
  createdAt: string
  completedAt: string | null
  repo: Repo
  comments: ReviewComment[]
}

interface MemoryStats {
  totalEntries: number
  byDecisionType: { decisionType: string; _count: { decisionType: number } }[]
  byOutcome: { outcome: string; _count: { outcome: number } }[]
  recentEntries: any[]
}

interface Digest {
  id: string
  weekOf: string
  prsReviewed: number
  flagsRaised: number
  flagsApproved: number
  flagsDismissed: number
  topIssue: string | null
  topDismissed: string | null
  patternsLearned: number
  org: { login: string }
}