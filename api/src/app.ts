import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import webhookRoutes from './routes/webhooks'
import repoRoutes from './routes/repos'
import reviewRoutes from './routes/reviews'
import memoryRoutes from './routes/memory'
import digestRoutes from './routes/digest'
import './workers/reviewWorker'
import internalRoutes from './routes/internal'
import authRoutes from './routes/auth'
import { startCronJobs } from './lib/cron'
import './workers/digestWorker'

const app = express()
const PORT = process.env.PORT || 3000

app.use('/webhooks', express.raw({ type: 'application/json' }));
app.use(express.json())
app.use(cors({
    origin: [
        'http://localhost:4000',
        'https://pr-review-agent-qt4w55lg5-yamin-hs-projects.vercel.app',
        'https://pr-review-agent-steel.vercel.app'
    ],
    credentials: true
}));

app.use('/webhooks', webhookRoutes)
app.use('/api/repos', repoRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/memory', memoryRoutes)
app.use('/api/digest', digestRoutes)
app.use('/internal', internalRoutes)
app.use('/auth', authRoutes)

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'pr-review-agent-api' })
});

app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`)
});

startCronJobs()

export default app