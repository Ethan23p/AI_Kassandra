import { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { v4 as uuidv4 } from 'uuid';
import { User } from './types';
import { getUserAt, saveUser } from './db';

const COOKIE_NAME = 'kassandra_session';

export const getSessionUser = (c: Context): User | null => {
    const cookie = getCookie(c, COOKIE_NAME);
    if (!cookie) return null;
    return getUserAt(cookie);
};

export const createSession = (c: Context, email: string | null = null): User => {
    const sessionToken = uuidv4();
    const newUser: User = {
        id: uuidv4(),
        email: email,
        playtest_cookie: sessionToken,
        status: email ? 'registeredOnly' : 'ephemeral',
        created_at: Date.now(),
        last_interacted_at: Date.now(),
    };

    saveUser(newUser);
    setCookie(c, COOKIE_NAME, sessionToken, {
        path: '/',
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return newUser;
};

export const clearSession = (c: Context) => {
    setCookie(c, COOKIE_NAME, '', {
        path: '/',
        maxAge: 0,
    });
};
