<<<<<<< HEAD
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
};
=======
import { Redis } from "ioredis"

const isUpstash = process.env.REDIS_URL?.startsWith('rediss://')

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    ...(isUpstash && {
        tls: {}
    })
});

connection.on('connect', () => console.log('Redis connected'))
connection.on('error', (err) => console.error('Redis error:', err))

export default connection
>>>>>>> cc70aa38c5526f13c39650c6712ce214a5f6e48a
