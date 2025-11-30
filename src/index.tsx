// src/index.tsx
import { Hono } from 'hono';
import { db, getClickStats, getLastClick } from './db';
import { Layout, ActivityLog, ClickButton } from './views';

const app = new Hono();

// --- ROUTE: INITIALIZE (Client Load) ---
app.get('/', (c) => {
  // 1. Get Data
    const count = getClickStats();

  // 2. Render Full Page
    return c.html(
    <Layout>
      {/* We manually place the components inside the layout */}
        <ActivityLog count={count} />
        <ClickButton />
    </Layout>
    );
});

// --- ROUTE: EVENT (User Click) ---
app.post('/click', (c) => {
  // 1. Process Logic (Write to DB)
    db.run("INSERT INTO clicks (timestamp) VALUES (?)", [new Date().toISOString()]);

  // 2. Fetch Updated Data
    const lastEntry = getLastClick();
    const count = getClickStats();

  // 3. Render Updates Only (No Layout!)
    return c.html(
    <>
        <ClickButton lastTimestamp={lastEntry.timestamp} />
        <ActivityLog count={count} />
    </>
    );
});

export default app;