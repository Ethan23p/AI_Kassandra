import { db } from "./db";

// User Operations
export interface User {
    id: number;
    username?: string;
    email?: string;
    auth_provider: string;
    subscribed_to_weekly: number;
    is_anonymous: number;
    last_active_at: string;
    created_at: string;
}

export interface Question {
    id: number;
    text: string;
    type: string;
    options: string[]; // Array of strings
}

export interface Answer {
    id: number;
    user_id: number;
    question_id: number;
    value: string;
    created_at: string;
}

export interface Guidance {
    id: number;
    user_id: number;
    content: string;
    created_at: string;
}

export function createUser(username: string, email?: string): User {
    const normalizedEmail = email?.toLowerCase().trim();
    if (normalizedEmail) {
        db.query("INSERT INTO users (username, email, auth_provider, is_anonymous) VALUES ($username, $email, 'email', 0)").run({ $username: username, $email: normalizedEmail });
        return db.query("SELECT * FROM users WHERE email = $email").get({ $email: normalizedEmail }) as User;
    } else {
        db.query("INSERT INTO users (username, auth_provider, is_anonymous) VALUES ($username, 'dev', 0)").run({ $username: username });
        return db.query("SELECT * FROM users WHERE username = $username").get({ $username: username }) as User;
    }
}

export function createAnonymousUser(): User {
    const res = db.query("INSERT INTO users (auth_provider, is_anonymous) VALUES ('anonymous', 1) RETURNING id").get({}) as { id: number };
    return getUser(res.id)!;
}

export function updateUserToPermanent(id: number, email: string, username: string, subscribedToWeekly: boolean = false): User {
    const normalizedEmail = email.toLowerCase().trim();
    db.query(`
        UPDATE users
        SET email = $email, username = $username, auth_provider = 'email', subscribed_to_weekly = $subscribed, is_anonymous = 0
        WHERE id = $id
    `).run({ $email: normalizedEmail, $username: username, $id: id, $subscribed: subscribedToWeekly ? 1 : 0 });

    return getUser(id)!;
}

export function updateUserActivity(id: number) {
    db.query("UPDATE users SET last_active_at = CURRENT_TIMESTAMP WHERE id = $id").run({ $id: id });
}

/**
 * Deletes anonymous users who have been inactive and have no answers/guidance.
 * @param hours Inactivity threshold in hours
 */
export function purgeAbandonedUsers(hours: number = 24) {
    db.run(`
        DELETE FROM users
        WHERE is_anonymous = 1
        AND datetime(last_active_at) <= datetime('now', '-${hours} hours')
        AND id NOT IN (SELECT DISTINCT user_id FROM answers)
        AND id NOT IN (SELECT DISTINCT user_id FROM guidance)
    `);
}


export function getUserByUsername(username: string): User | null {
    const query = db.query("SELECT * FROM users WHERE username = $username");
    return query.get({ $username: username }) as User | null;
}

export function getUserByEmail(email: string): User | null {
    const normalizedEmail = email.toLowerCase().trim();
    const query = db.query("SELECT * FROM users WHERE email = $email");
    return query.get({ $email: normalizedEmail }) as User | null;
}

export function getUser(id: number): User | null {
    const query = db.query("SELECT * FROM users WHERE id = $id");
    return query.get({ $id: id }) as User | null;
}

// Question Operations
export function createQuestion(text: string, type: string = 'radio', options: string[] = []): Question {
    const optionsJson = JSON.stringify(options);
    const query = db.query("INSERT INTO questions (text, type, options) VALUES ($text, $type, $options) RETURNING *");
    const res = query.get({ $text: text, $type: type, $options: optionsJson }) as any;
    return { ...res, options: JSON.parse(res.options || '[]') };
}

export function getQuestions(): Question[] {
    const questions = db.query("SELECT * FROM questions").all() as any[];
    return questions.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : []
    }));
}

// Answer Operations
export function saveAnswer(userId: number, questionId: number, value: string) {
    // Check if exists, update if so, or insert
    const existing = db.query("SELECT id FROM answers WHERE user_id = $userId AND question_id = $questionId").get({ $userId: userId, $questionId: questionId }) as any;

    if (existing) {
        db.query("UPDATE answers SET value = $value, created_at = CURRENT_TIMESTAMP WHERE id = $id").run({ $value: value, $id: existing.id });
    } else {
        db.query("INSERT INTO answers (user_id, question_id, value) VALUES ($userId, $questionId, $value)").run({
            $userId: userId,
            $questionId: questionId,
            $value: value
        });
    }
}

export function getAnswers(userId: number): (Answer & { question_text: string })[] {
    const query = db.query(`
        SELECT a.*, q.text as question_text
        FROM answers a
        JOIN questions q ON a.question_id = q.id
        WHERE a.user_id = $userId
        ORDER BY q.id ASC
    `);
    return query.all({ $userId: userId }) as (Answer & { question_text: string })[];
}

// Guidance Operations
export function createGuidance(userId: number, content: string): Guidance {
    const query = db.query("INSERT INTO guidance (user_id, content) VALUES ($userId, $content) RETURNING *");
    return query.get({ $userId: userId, $content: content }) as Guidance;
}

export function getLatestGuidance(userId: number): Guidance | null {
    return db.query("SELECT * FROM guidance WHERE user_id = $userId ORDER BY created_at DESC LIMIT 1").get({ $userId: userId }) as Guidance | null;
}
