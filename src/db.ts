import { Database } from 'bun:sqlite';
import { User, PersonalityProfile, Guidance, UserSchema, GuidanceSchema, PersonalityProfileSchema, UserInteraction, UserInteractionSchema } from './types';

const db = new Database(
  process.env.NODE_ENV === 'test' ? ':memory:' : 'guidances.sqlite',
  { create: true }
);

// Initialize tables
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    playtest_cookie TEXT,
    status TEXT,
    created_at INTEGER,
    last_interacted_at INTEGER,
    last_generated_at INTEGER,
    tags TEXT -- JSON array of tag strings
  )
`);

// Migration: Add last_generated_at if it's an old DB
try {
  db.run(`ALTER TABLE users ADD COLUMN last_generated_at INTEGER`);
} catch (e) {
  // Column likely already exists
}

// Migration: Add tags column for older DBs
try {
  db.run(`ALTER TABLE users ADD COLUMN tags TEXT`);
} catch (e) {
  // Column likely already exists
}

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
    INSERT OR REPLACE INTO users (id, email, playtest_cookie, status, created_at, last_interacted_at, last_generated_at, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    user.id,
    user.email,
    user.playtest_cookie,
    user.status,
    user.created_at,
    user.last_interacted_at,
    user.last_generated_at || null,
    JSON.stringify(user.tags ?? []),
  );
};

const hydrateUserRow = (row: any): User | null => {
  // Deserialize tags JSON (stored as TEXT) before zod validation.
  // NULL tags (pre-migration rows) become an empty array.
  const tags = typeof row.tags === 'string'
    ? (() => {
        try { return JSON.parse(row.tags); }
        catch { return []; }
      })()
    : [];
  const parse = UserSchema.safeParse({ ...row, tags });
  return parse.success ? parse.data : null;
};

export const getUserAt = (cookie: string): User | null => {
  const stmt = db.prepare('SELECT * FROM users WHERE playtest_cookie = ?');
  const result = stmt.get(cookie);
  if (!result) return null;
  return hydrateUserRow(result);
};

export const getUserByEmail = (email: string): User | null => {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const result = stmt.get(email);
  if (!result) return null;
  return hydrateUserRow(result);
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

  try {
    const profileData = {
      ...result,
      traits: JSON.parse(result.traits)
    };
    return PersonalityProfileSchema.parse(profileData);
  } catch (e) {
    console.error(`Failed to parse profile for user ${userId}:`, e);
    return null;
  }
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
  const results = stmt.all(userId);
  return results.map(r => GuidanceSchema.parse(r));
};

export const getTotalGuidanceCountSince = (startTime: number): number => {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM guidances WHERE created_at > ?');
  const result = stmt.get(startTime) as { count: number };
  return result.count;
};

// --- Interactions ---

db.run(`
  CREATE TABLE IF NOT EXISTS user_interactions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    question_id TEXT,
    choice_id TEXT,
    impulses TEXT, -- JSON string
    created_at INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`);

export const saveInteraction = (interaction: UserInteraction) => {
  const stmt = db.prepare(`
      INSERT OR REPLACE INTO user_interactions (id, user_id, question_id, choice_id, impulses, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
  stmt.run(interaction.id, interaction.user_id, interaction.question_id, interaction.choice_id, JSON.stringify(interaction.impulses), interaction.created_at);
};


export const getInteractionsAt = (userId: string): UserInteraction[] => {
  const stmt = db.prepare('SELECT * FROM user_interactions WHERE user_id = ? ORDER BY created_at DESC');
  const results = stmt.all(userId) as any[];

  return results.map(r => {
    try {
      return UserInteractionSchema.parse({
        ...r,
        impulses: JSON.parse(r.impulses)
      });
    } catch (e) {
      console.error('Failed to parse interaction', e);
      return null;
    }
  }).filter(i => i !== null) as UserInteraction[];
};
