import { Router, Request, Response } from 'express'
import { getInstallationToken } from '../lib/octokit'

const router = Router()

router.post('/installation-token', async (req: Request, res: Response) => {
    const { installation_id } = req.body

    if (!installation_id) {
        res.status(400).json({ error: 'installation_id required' })
        return
    }

    try {
        const token = await getInstallationToken(installation_id)
        res.json({ token })
    } catch (err) {
        console.error('Failed to get installation token:', err)
        res.status(500).json({ error: 'Failed to get installation token' })
    }
});

export default router