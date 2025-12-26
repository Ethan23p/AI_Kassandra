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
        setCookie(c, AUTH_COOKIE_NAME, user.id.toString(), {
            path: '/',
            secure: false, // Set to true if on HTTPS, false for local dev/wsltunnel
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7,
        });
    }

    static getSessionUser(c: Context): models.User | null {
        const cookie = getCookie(c, AUTH_COOKIE_NAME);
        if (!cookie) return null;
        const id = parseInt(cookie);
        if (isNaN(id)) return null;
        const user = models.getUser(id);
        if (user) {
            models.updateUserActivity(user.id);
        }
        return user;
    }

    /**
     * Ensures the visitor has a user record (anonymous if needed).
     * Used for the onboarding flow.
     */
    static async ensureSession(c: Context): Promise<models.User> {
        let user = this.getSessionUser(c);
        if (!user) {
            user = models.createAnonymousUser();
            this.setSession(c, user);
        }
        return user;
    }
}

// --- MIDDLEWARE ---

export async function authMiddleware(c: Context, next: Next) {
    // Public Routes
    const publicPaths = ['/login', '/auth', '/about', '/public', '/start', '/'];

    // Exact match for '/' should be public (Landing)
    if (c.req.path === '/' || publicPaths.some(p => p !== '/' && c.req.path.startsWith(p))) {
        await next();
        return;
    }

    const user = AuthService.getSessionUser(c);
    if (!user || user.auth_provider === 'anonymous') {
        // If they are anonymous and trying to access /profile or /dashboard,
        // we might want a different redirect or just login
        return c.redirect('/login');
    }

    await next();
}
