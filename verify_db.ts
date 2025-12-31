import { db } from './src/db.ts'

const tables = db.query("SELECT name FROM sqlite_master WHERE type='table'").all()
console.log('Tables in database:', tables)

for (const table of (tables as any[])) {
    if (table.name === 'sqlite_sequence') continue
    const schema = db.query(`SELECT sql FROM sqlite_master WHERE name='${table.name}'`).get()
    console.log(`\nSchema for ${table.name}:`)
    console.log((schema as any).sql)
}
