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
            username TEXT UNIQUE,
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

    // Auto-seed if empty
    const questionCount = db.query('SELECT COUNT(*) as count FROM questions').get() as { count: number }
    if (questionCount.count === 0) {
        seedDatabase()
    }
}

export const seedDatabase = () => {
    console.log('Seeding database...')
    const seedQuestions = [
        {
            category: 'personality',
            text: 'How do you handle chaos?',
            choices: [
                { text: 'I embrace it and find the pattern.', metadata: 'high_openness, low_neuroticism' },
                { text: 'I seek order and structure immediately.', metadata: 'high_conscientiousness' },
                { text: 'I feel overwhelmed but keep moving.', metadata: 'moderate_neuroticism' },
                { text: 'I ignore it until it passes.', metadata: 'low_engagement' }
            ]
        },
        {
            category: 'personality',
            text: 'When faced with a difficult choice, what is your primary guide?',
            choices: [
                { text: 'Rational analysis and logic.', metadata: 'analytical' },
                { text: 'My gut feeling and intuition.', metadata: 'intuitive' },
                { text: 'The advice of those I trust.', metadata: 'social' },
                { text: 'A toss of the coin; chance defines my path.', metadata: 'spontaneous' }
            ]
        }
        /* Hidden for debugging efficiency
        {
            category: 'personality',
            text: 'In a group setting, what role do you naturally fall into?',
            choices: [
                { text: 'The Orchestrator: Keeping everyone aligned.', metadata: 'leader' },
                { text: 'The Sage: Providing depth and insight.', metadata: 'thinker' },
                { text: 'The Engine: Doing the heavy lifting.', metadata: 'doer' },
                { text: 'The Glue: Ensuring everyone feels heard.', metadata: 'empath' }
            ]
        },
        {
            category: 'personality',
            text: 'How do you view failure?',
            choices: [
                { text: 'A necessary lesson on the road to success.', metadata: 'growth_mindset' },
                { text: 'A sign that my strategy needs to change.', metadata: 'strategic' },
                { text: 'A disappointing but temporary setback.', metadata: 'resilient' },
                { text: 'Something to be avoided at all costs.', metadata: 'perfectionist' }
            ]
        },
        {
            category: 'personality',
            text: 'What brings you the most peace?',
            choices: [
                { text: 'Quiet reflection in solitude.', metadata: 'introvert' },
                { text: 'Meaningful connection with others.', metadata: 'extrovert' },
                { text: 'The satisfaction of a job well done.', metadata: 'achiever' },
                { text: 'Being surrounded by the beauty of nature.', metadata: 'nature_lover' }
            ]
        }
        */
    ]

    const insertQuestion = db.prepare('INSERT INTO questions (category, text) VALUES (?1, ?2) RETURNING id')
    const insertChoice = db.prepare('INSERT INTO choices (question_id, text, metadata) VALUES (?1, ?2, ?3)')

    const transaction = db.transaction(() => {
        for (const q of seedQuestions) {
            const result = insertQuestion.get(q.category, q.text) as { id: number }
            for (const c of q.choices) {
                insertChoice.run(result.id, c.text, c.metadata)
            }
        }
    })

    transaction()
    console.log('Seeding complete.')
}

export const findNextQuestionForUser = (userId: string) => {
    // Find first question not answered by this user
    const question = db.query(`
        SELECT q.id, q.category, q.text
        FROM questions q
        WHERE q.id NOT IN (
            SELECT question_id FROM answers WHERE user_id = ?
        )
        LIMIT 1
    `).get(userId) as { id: number, category: string, text: string } | null

    if (!question) return null

    // Get choices for this question
    const choices = db.query(`
        SELECT id, text, metadata
        FROM choices
        WHERE question_id = ?
    `).all(question.id) as { id: number, text: string, metadata: string }[]

    return {
        ...question,
        choices
    }
}

export const saveAnswer = (userId: string, questionId: number, choiceId: number) => {
    db.run(`
        INSERT INTO answers (user_id, question_id, choice_id, answered_at)
        VALUES (?1, ?2, ?3, ?4)
    `, [userId, questionId, choiceId, Date.now()])
}

export const findUserById = (userId: string) => {
    return db.query('SELECT * FROM users WHERE id = ?').get(userId) as any | null
}

export const findUserByUsername = (username: string) => {
    return db.query('SELECT * FROM users WHERE username = ?').get(username) as any | null
}

export const createUser = (userId: string, username?: string, email?: string) => {
    db.run(`
        INSERT INTO users (id, username, email, status, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5)
    `, [userId, username || null, email || null, 'anonymous', Date.now()])
}

export const findDailyGuidanceForUser = (userId: string) => {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)
    return db.query(`
        SELECT * FROM guidances
        WHERE user_id = ?
        AND is_daily = 1
        AND generated_at > ?
        ORDER BY generated_at DESC
        LIMIT 1
    `).get(userId, oneDayAgo) as any | null
}

export const saveGuidance = (userId: string, text: string, isDaily: boolean) => {
    db.run(`
        INSERT INTO guidances (user_id, text, generated_at, is_daily)
        VALUES (?1, ?2, ?3, ?4)
    `, [userId, text, Date.now(), isDaily ? 1 : 0])
}

export const clearUserProgress = (userId: string) => {
    db.transaction(() => {
        db.run('DELETE FROM answers WHERE user_id = ?', [userId])
        db.run('DELETE FROM guidances WHERE user_id = ?', [userId])
    })()
}
