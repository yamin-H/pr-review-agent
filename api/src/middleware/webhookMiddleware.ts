import { Webhooks } from "@octokit/webhooks";
import { Request, Response, NextFunction } from "express";

const webhooks = new Webhooks({
    secret: process.env.GITHUB_WEBHOOK_SECRET!
});

export async function verifyWebhookSignature(req: Request, res: Response, next: NextFunction) {
    const signature = req.headers['x-hub-signature-256'] as string
    const body = req.body.toString()

    if (!signature) {
        console.error('No signature found on webhook request')
        res.status(401).json({ error: 'No signature' })
        return
    }

    const isValid = await webhooks.verify(body, signature)
    if (!isValid) {
        console.error('Invalid webhook signature')
        res.status(401).json({ error: 'Invalid signature' })
        return
    }

    next()
}