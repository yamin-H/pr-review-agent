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