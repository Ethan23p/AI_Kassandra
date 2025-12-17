import { Context, Next } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import * as models from './models';

const AUTH_COOKIE_NAME = "divination_auth";

// --- STRATEGIES ---

interface AuthStrategy {
    login(identifier: string, secret?: string): Promise<{ success: boolean; user?: models.User; error?: string }>;
}

class DevAuthStrategy implements AuthStrategy {
    async login(identifier: string, secret?: string) {
        // Simple "If you say who you are, you are who you are" for dev speed
        // Or if a secret is provided, check it.
        // For now, let's just auto-create/get by email for testing the flow "Enter Email -> Success"

        let user = models.getUserByEmail(identifier);
        if (!user) {
            // Auto-signup in dev mode
            user = models.createUser(identifier.split('@')[0], identifier);
        }
        return { success: true, user };
    }
}

// Future: EmailMagicLinkStrategy relying on communication_interface

// --- SERVICE ---

const currentStrategy: AuthStrategy = new DevAuthStrategy();

export class AuthService {
    static async login(identifier: string, secret?: string) {
        return currentStrategy.login(identifier, secret);
    }

    static async logout(c: Context) {
        deleteCookie(c, AUTH_COOKIE_NAME);
    }

    static setSession(c: Context, user: models.User) {
        // In real app, sign a JWT. For now, store ID.
        setCookie(c, AUTH_COOKIE_NAME, user.id.toString(), {
            path: '/',
            secure: true,
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7,
        });
    }

    static getSessionUser(c: Context): models.User | null {
        const cookie = getCookie(c, AUTH_COOKIE_NAME);
        if (!cookie) return null;
        const id = parseInt(cookie);
        if (isNaN(id)) return null;
        return models.getUser(id);
    }
}

// --- MIDDLEWARE ---

export async function authMiddleware(c: Context, next: Next) {
    // Public Routes
    const publicPaths = ['/login', '/auth', '/about', '/public'];
    if (publicPaths.some(p => c.req.path.startsWith(p))) {
        await next();
        return;
    }

    const user = AuthService.getSessionUser(c);
    if (!user) {
        return c.redirect('/login');
    }

    // Attach user to context if needed, or just rely on getSessionUser in routes
    await next();
}
