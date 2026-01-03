import { Context, Next } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { findUserById, createUser } from './db'

export const authMiddleware = async (c: Context, next: Next) => {
    const userId = getCookie(c, 'user_session')

    if (userId) {
        // Verify user exists in DB
        const user = findUserById(userId)
        if (user) {
            c.set('userId', userId)
        } else {
            // Cookie exists but user doesn't (maybe DB reset)
            // We should probably clear the dead cookie or just let the app handle it
        }
    }

    await next()
}
