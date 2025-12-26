// src/db.ts
import { Database } from 'bun:sqlite';

// Initialize the file
export const db = new Database('proto.sqlite');

// Create tables
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    email TEXT UNIQUE,
    password TEXT,
    auth_provider TEXT DEFAULT 'dev',
    magic_token TEXT,
    token_expires_at TEXT,
    subscribed_to_weekly INTEGER DEFAULT 0,
    is_anonymous INTEGER DEFAULT 1, -- 1 = Yes, 0 = No
    last_active_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT,
    type TEXT, -- e.g. 'radio', 'text'
    options TEXT -- JSON string of options e.g. ["Yes", "No"]
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    question_id INTEGER,
    value TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(question_id) REFERENCES questions(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS guidance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);