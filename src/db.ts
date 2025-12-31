import { Database } from "bun:sqlite";
import type { QuestionCategory } from "./types";

const db = new Database("guidances.sqlite", { create: true });

// Enable foreign keys
db.run("PRAGMA foreign_keys = ON;");

// Create Tables
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT,
    status TEXT CHECK(status IN ('anonymous', 'registered', 'premium')),
    createdAt TEXT NOT NULL,
    lastGuidanceAt TEXT
  );
`);

db.run(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    text TEXT NOT NULL
  );
`);

db.run(`
  CREATE TABLE IF NOT EXISTS choices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    questionId INTEGER NOT NULL,
    text TEXT NOT NULL,
    metadata TEXT,
    FOREIGN KEY(questionId) REFERENCES questions(id) ON DELETE CASCADE
  );
`);

db.run(`
  CREATE TABLE IF NOT EXISTS answers (
    userId TEXT NOT NULL,
    questionId INTEGER NOT NULL,
    choiceId INTEGER NOT NULL,
    answeredAt TEXT NOT NULL,
    PRIMARY KEY(userId, questionId),
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(questionId) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY(choiceId) REFERENCES choices(id) ON DELETE CASCADE
  );
`);

db.run(`
  CREATE TABLE IF NOT EXISTS guidances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    text TEXT NOT NULL,
    generatedAt TEXT NOT NULL,
    isDaily INTEGER NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Seed Questions if empty
const questionCount = db.query("SELECT COUNT(*) as count FROM questions").get() as { count: number };

if (questionCount.count === 0) {
  console.log("Seeding initial personality questions...");

  const seedQuestions: { category: QuestionCategory; text: string; options: { text: string; metadata?: string }[] }[] = [
    {
      category: 'personality',
      text: "How do you typically handle sudden chaos in your schedule?",
      options: [
        { text: "I embrace it and enjoy the spontaneity.", metadata: "high_openness" },
        { text: "I find it stressful and try to re-organize quickly.", metadata: "low_openness" },
        { text: "I ignore it and stick to my plan as much as possible.", metadata: "high_conscientiousness" },
        { text: "I delegate the chaos to someone else.", metadata: "high_extraversion" }
      ]
    },
    {
      category: 'personality',
      text: "In a group setting, do you find yourself leading or following?",
      options: [
        { text: "I naturally take charge.", metadata: "high_extraversion" },
        { text: "I prefer to support and follow.", metadata: "high_agreeableness" },
        { text: "I stay independent and do my own thing.", metadata: "low_extraversion" },
        { text: "It depends entirely on the group's competence.", metadata: "high_openness" }
      ]
    },
    {
      category: 'personality',
      text: "What is your primary focus when starting a new project?",
      options: [
        { text: "The big picture and vision.", metadata: "high_openness" },
        { text: "The fine details and logistics.", metadata: "high_conscientiousness" },
        { text: "The impact it will have on people.", metadata: "high_agreeableness" },
        { text: "How quickly it can be completed.", metadata: "low_neuroticism" }
      ]
    }
  ];

  const insertQuestion = db.prepare("INSERT INTO questions (category, text) VALUES ($category, $text) RETURNING id");
  const insertChoice = db.prepare("INSERT INTO choices (questionId, text, metadata) VALUES ($questionId, $text, $metadata)");

  const transaction = db.transaction(() => {
    for (const q of seedQuestions) {
      const result = insertQuestion.get({ $category: q.category, $text: q.text }) as { id: number };
      for (const opt of q.options) {
        insertChoice.run({ $questionId: result.id, $text: opt.text, $metadata: opt.metadata ?? null });
      }
    }
  });

  transaction();
  console.log("Seeding complete.");
}

// Helpers
export const getQuestion = (id: number) => {
  const question = db.query("SELECT * FROM questions WHERE id = ?").get(id) as any;
  if (!question) return null;
  const choices = db.query("SELECT * FROM choices WHERE questionId = ?").all(id) as any[];
  return { ...question, options: choices };
};

export const getNextQuestionId = (currentId: number | null) => {
  if (currentId === null) {
    const first = db.query("SELECT id FROM questions ORDER BY id ASC LIMIT 1").get() as { id: number };
    return first?.id || null;
  }
  const next = db.query("SELECT id FROM questions WHERE id > ? ORDER BY id ASC LIMIT 1").get(currentId) as { id: number };
  return next?.id || null;
};

export const saveAnswer = (userId: string, questionId: number, choiceId: number) => {
  db.run(
    `INSERT INTO answers (userId, questionId, choiceId, answeredAt)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(userId, questionId) DO UPDATE SET choiceId = excluded.choiceId, answeredAt = excluded.answeredAt`,
    [userId, questionId, choiceId, new Date().toISOString()]
  );
};

export const getOrCreateUser = (id: string) => {
  const existing = db.query("SELECT * FROM users WHERE id = ?").get(id);
  if (existing) return existing;

  db.run(
    "INSERT INTO users (id, status, createdAt) VALUES (?, ?, ?)",
    [id, 'anonymous', new Date().toISOString()]
  );
  return { id, status: 'anonymous' };
};

export default db;
export { db };
