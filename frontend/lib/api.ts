const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include', // send session cookie
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  })

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }

  return res.json()
}

export const api = {
  // auth
  me: () => fetchAPI<{ user: User }>('/auth/me'),
  logout: () => fetchAPI('/auth/logout', { method: 'POST' }),

  // repos
  repos: () => fetchAPI<{ repos: Repo[] }>('/api/repos'),

  // reviews
  reviews: () => fetchAPI<{ reviews: Review[] }>('/api/reviews'),
  review: (id: string) => fetchAPI<{ review: Review }>(`/api/reviews/${id}`),

  // memory
  memoryStats: () => fetchAPI<MemoryStats>('/api/memory/stats'),

  // digest
  digests: () => fetchAPI<{ digests: Digest[] }>('/api/digest/preview'),

  // onboard
  onboard: (repo: string, orgId: string) =>
    fetchAPI('/onboard', {
      method: 'POST',
      body: JSON.stringify({ repo, org_id: orgId, months_back: 6 })
    })
}