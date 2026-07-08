import { Queue } from 'bullmq'
import { getConnectionOptions } from '../lib/redis'

const digestQueue = new Queue('digest-queue', {
    connection: getConnectionOptions(),
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 10,
        removeOnFail: 10
    }
});

export default digestQueue