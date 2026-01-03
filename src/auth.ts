import { Context, Next } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { findUserById, createUser } from './db'

export const authMiddleware = async (c: Context, next: Next) => {
    let userId = getCookie(c, 'user_session')

    if (!userId) {
        const newId = crypto.randomUUID()
        createUser(newId)
        setCookie(c, 'user_session', newId, {
            path: '/',
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 365, // 1 year
        })
        userId = newId
    } else {
        // Verify user exists in DB
        const user = findUserById(userId)
        if (!user) {
            createUser(userId)
        }
    }

    c.set('userId', userId)
    await next()
}
