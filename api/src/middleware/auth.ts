import { Request, Response, NextFunction } from 'express'
import { getIronSession } from 'iron-session'
import { sessionOptions, sessionData } from '../lib/session'

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    const session = await getIronSession<sessionData>(req, res, sessionOptions)
    if (!session.user) {
        res.status(401).json({ error: 'Authentication required' })
        return
    }

    ;(req as any).user = session.user;
    next()
}