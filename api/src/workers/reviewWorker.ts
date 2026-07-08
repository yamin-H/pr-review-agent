import { Worker } from 'bullmq'
import connection from '../lib/redis'
import { triggerReview } from '../services/agent'
import { ReviewJobData } from '../queues/reviewQueue'
import {prisma} from '../lib/prisma'

const worker = new Worker<ReviewJobData>(
    'review-queue',
    async (job) => {
        console.log(`Processing review job ${job.id} for PR #${job.data.pr_number}`)

        const result = await triggerReview({
            job_id: job.data.job_id,
            repo: job.data.repo,
            pr_number: job.data.pr_number,
            installation_id: job.data.installation_id
        })

        await prisma.pRReview.update({
            where: { id: job.data.job_id },
            data: {
                status: 'completed',
                commentUrl: result.comment_url,
                commentsCount: result.comments_posted || 0,
                completedAt: new Date()
            }
        })

        console.log(`✓ Review completed for PR #${job.data.pr_number}`)
        return result
    },
    { connection, concurrency: 3 }
);

worker.on('failed', async (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message)

    if (job?.data.job_id) {
        await prisma.pRReview.update({
            where: { id: job.data.job_id },
            data: { status: 'failed' }
        }).catch(console.error)
    }
});

export default worker