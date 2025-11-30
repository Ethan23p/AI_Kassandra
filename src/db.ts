// src/db.ts
import { Database } from 'bun:sqlite';

// Initialize the file
export const db = new Database('proto.sqlite');

// Create the table immediately when this file is loaded
db.run("CREATE TABLE IF NOT EXISTS clicks (id INTEGER PRIMARY KEY, timestamp TEXT)");

// Helper to get the current count (Utility function)
export function getClickStats() {
    const count = db.query("SELECT COUNT(*) as count FROM clicks").get() as any;
    return count.count;
}

// Helper to get the last entry
export function getLastClick() {
    return db.query("SELECT * FROM clicks ORDER BY id DESC LIMIT 1").get() as any;
}