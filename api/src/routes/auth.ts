import { Router, Request, Response } from 'express'
import { OAuthApp } from '@octokit/oauth-app'
import { getIronSession } from 'iron-session'
import { sessionOptions, sessionData } from '../lib/session'
import {prisma} from '../lib/prisma'

const router = Router()

const oauthApp = new OAuthApp({
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!
});

router.get('/github', (req: Request, res: Response) => {
    const { url } = oauthApp.getWebFlowAuthorizationUrl({
        scopes: ['read:user', 'read:org']
    })
    res.redirect(url)
});

router.get('/github/callback', async (req: Request, res: Response) => {
    const { code } = req.query

    if (!code) {
        res.status(400).json({ error: 'No code provided' })
        return
    }

    try {
        const { authentication } = await oauthApp.createToken({
            code: code as string
        })

        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${authentication.token}`,
                Accept: 'application/vnd.github.v3+json'
            }
        })
        const githubUser = await userResponse.json() as {
            id: number
            login: string
            avatar_url: string
        }

        const org = await prisma.organization.findFirst({
            where: { login: githubUser.login }
        })

        if (!org) {
            res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=not_installed`)
            return
        }

        const user = await prisma.user.upsert({
            where: { githubId: String(githubUser.id) },
            update: { login: githubUser.login, avatarUrl: githubUser.avatar_url },
            create: {
                githubId: String(githubUser.id),
                login: githubUser.login,
                avatarUrl: githubUser.avatar_url,
                orgId: org.id
            }
        })

        const session = await getIronSession<sessionData>(req, res, sessionOptions)
        session.user = {
            id: user.id,
            githubId: user.githubId,
            login: user.login,
            avatarUrl: user.avatarUrl || ''
        }
        await session.save()

        res.redirect(`${process.env.FRONTEND_URL}/dashboard`)
    } catch (err) {
        console.error('OAuth error:', err)
        res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`)
    }
});

router.get('/me', async (req: Request, res: Response) => {
    const session = await getIronSession<sessionData>(req, res, sessionOptions)

    if (!session.user) {
        res.status(401).json({ error: 'Not authenticated' })
        return
    }

    res.json({ user: session.user })
});

router.post('/logout', async (req: Request, res: Response) => {
    const session = await getIronSession<sessionData>(req, res, sessionOptions)
    session.destroy()
    res.json({ success: true })
});

export default router