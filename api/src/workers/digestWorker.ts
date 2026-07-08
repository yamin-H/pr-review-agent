import { Worker } from 'bullmq'
import { getConnectionOptions } from '../lib/redis'
import {prisma} from '../lib/prisma'
import axios from 'axios'
import { sendDigestEmail, sendDigestSlack } from '../services/notifications'

const worker = new Worker(
    'digest-queue',
    async (job) => {
        console.log('Processing weekly digest job')

        const orgs = await prisma.organization.findMany()

        for (const org of orgs) {
            const weekAgo = new Date()
            weekAgo.setDate(weekAgo.getDate() - 7)

            const reviews = await prisma.pRReview.findMany({
                where: {
                    orgId: org.id,
                    createdAt: { gte: weekAgo },
                    status: 'completed'
                },
                include: { comments: true }
            })

            if (reviews.length === 0) continue

            const flagsRaised = reviews.reduce((sum, r) => sum + r.commentsCount, 0)

            const feedbackActions = await prisma.feedbackAction.findMany({
                where: {
                    review: { orgId: org.id },
                    createdAt: { gte: weekAgo }
                }
            })

            const approved = feedbackActions.filter(f => f.action === 'approved').length
            const dismissed = feedbackActions.filter(f => f.action === 'dismissed').length

            const agentResponse = await axios.post(
                `${process.env.AGENT_URL}/digest`,
                {
                    org_id: org.id,
                    prs_reviewed: reviews.length,
                    flags_raised: flagsRaised,
                    flags_approved: approved,
                    flags_dismissed: dismissed,
                    reviews: reviews.map(r => ({
                        pr_number: r.prNumber,
                        comments: r.comments.map(c => c.comment)
                    }))
                }
            )

            const { top_issue, top_dismissed, patterns_learned } = agentResponse.data

            await prisma.weeklyDigest.create({
                data: {
                    weekOf: weekAgo,
                    prsReviewed: reviews.length,
                    flagsRaised,
                    flagsApproved: approved,
                    flagsDismissed: dismissed,
                    topIssue: top_issue,
                    topDismissed: top_dismissed,
                    patternsLearned: patterns_learned || 0,
                    orgId: org.id
                }
            })

            const digestData = {
                weekOf: weekAgo,
                prsReviewed: reviews.length,
                flagsRaised,
                flagsApproved: approved,
                flagsDismissed: dismissed,
                topIssue: top_issue,
                topDismissed: top_dismissed,
                patternsLearned: patterns_learned || 0,
                orgLogin: org.login
            }

            await sendDigestSlack(digestData).catch(console.error)
        }
    },
    { connection: getConnectionOptions() }
);

worker.on('failed', (job, err) => {
    console.error(`Digest job failed:`, err.message)
});

export default worker