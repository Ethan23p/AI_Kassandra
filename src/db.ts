import { Database } from 'bun:sqlite';
import { User, PersonalityProfile, Guidance } from './types';

const db = new Database('guidances.sqlite', { create: true });

// Initialize tables
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    playtest_cookie TEXT,
    status TEXT,
    created_at INTEGER,
    last_interacted_at INTEGER
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS personality_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    updated_at INTEGER,
    traits TEXT, -- JSON string
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS guidances (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    text TEXT,
    input_data TEXT,
    created_at INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`);

export default db;

// Helper functions (minimal for prototype)
export const saveUser = (user: User) => {
    const stmt = db.prepare(`
    INSERT OR REPLACE INTO users (id, email, playtest_cookie, status, created_at, last_interacted_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
    stmt.run(user.id, user.email, user.playtest_cookie, user.status, user.created_at, user.last_interacted_at);
};

export const getUserAt = (cookie: string): User | null => {
    const stmt = db.prepare('SELECT * FROM users WHERE playtest_cookie = ?');
    return stmt.get(cookie) as User | null;
};

export const saveProfile = (profile: PersonalityProfile) => {
    const stmt = db.prepare(`
    INSERT OR REPLACE INTO personality_profiles (id, user_id, updated_at, traits)
    VALUES (?, ?, ?, ?)
  `);
    stmt.run(profile.id, profile.user_id, profile.updated_at, JSON.stringify(profile.traits));
};

export const getProfileAt = (userId: string): PersonalityProfile | null => {
    const stmt = db.prepare('SELECT * FROM personality_profiles WHERE user_id = ?');
    const result = stmt.get(userId) as any;
    if (!result) return null;
    return {
        ...result,
        traits: JSON.parse(result.traits)
    };
};

export const saveGuidance = (guidance: Guidance) => {
    const stmt = db.prepare(`
    INSERT OR REPLACE INTO guidances (id, user_id, text, input_data, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
    stmt.run(guidance.id, guidance.user_id, guidance.text, guidance.input_data, guidance.created_at);
};

export const getGuidancesAt = (userId: string): Guidance[] => {
    const stmt = db.prepare('SELECT * FROM guidances WHERE user_id = ? ORDER BY created_at DESC');
    return stmt.all(userId) as Guidance[];
};
