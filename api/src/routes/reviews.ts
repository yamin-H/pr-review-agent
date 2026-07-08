import { Router, Request, Response } from 'express'
import {prisma} from '../lib/prisma'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
    try {
        const reviews = await prisma.pRReview.findMany({
            include: {
                repo: true,
                comments: true
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        })

        res.json({ reviews })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch reviews' })
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const review = await prisma.pRReview.findUnique({
            where: { id: req.params.id as string },
            include: {
                repo: true,
                comments: true,
                feedbackActions: true
            }
        })

        if (!review) {
            res.status(404).json({ error: 'Review not found' })
            return
        }

        res.json({ review })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch review' })
    }
});

export default router