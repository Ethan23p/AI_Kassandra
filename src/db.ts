import { Database } from 'bun:sqlite'

// Initialize the database
export const db = new Database('guidances.sqlite')

// Enable WAL mode for better concurrency
db.run('PRAGMA journal_mode = WAL')

export const initDB = () => {
    // Users Table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT,
            status TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            last_guidance_at INTEGER
        )
    `)

    // Questions Table
    db.run(`
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            text TEXT NOT NULL
        )
    `)

    // Choices Table
    db.run(`
        CREATE TABLE IF NOT EXISTS choices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER NOT NULL,
            text TEXT NOT NULL,
            metadata TEXT,
            FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
        )
    `)

    // Answers Table
    db.run(`
        CREATE TABLE IF NOT EXISTS answers (
            user_id TEXT NOT NULL,
            question_id INTEGER NOT NULL,
            choice_id INTEGER NOT NULL,
            answered_at INTEGER NOT NULL,
            PRIMARY KEY (user_id, question_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
            FOREIGN KEY (choice_id) REFERENCES choices(id) ON DELETE CASCADE
        )
    `)

    // Guidances Table
    db.run(`
        CREATE TABLE IF NOT EXISTS guidances (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            text TEXT NOT NULL,
            generated_at INTEGER NOT NULL,
            is_daily BOOLEAN NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `)

    console.log('Database initialized successfully.')
}
