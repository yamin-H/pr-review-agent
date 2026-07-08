import { Queue } from 'bullmq'
import { getConnectionOptions } from '../lib/redis'

const reviewQueue = new Queue('review-queue', {
    connection: getConnectionOptions(),
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 50
    }
});

export default reviewQueue