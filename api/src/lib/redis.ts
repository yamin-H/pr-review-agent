export function getConnectionOptions() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379'
  const isUpstash = url.startsWith('rediss://')

  if (isUpstash) {
    const parsed = new URL(url)
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port),
      password: parsed.password,
      username: parsed.username,
      tls: {},
      maxRetriesPerRequest: null as null
    }
  }

  return {
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: null as null
  }
}
