import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { Layout, Welcome } from './ui'
import { initDB } from './db'

// Initialize Database
initDB()

const app = new Hono()

// Static file serving
app.use('/public/*', serveStatic({ root: './' }))

// Root route
app.get('/', (c) => {
    return c.html(
        <Layout>
            <Welcome />
        </Layout>
    )
})

// Placeholder assessment route
app.get('/assessment/start', (c) => {
    return c.html(
        <div class="card glass">
            <h2>Step 1: The First Question</h2>
            <p>Imagine you are at a crossroads. Which way do you turn?</p>
            <div class="options">
                <button class="btn-secondary">The sun-drenched path to the right</button>
                <button class="btn-secondary">The misty trail to the left</button>
            </div>
        </div>
    )
})

export default {
    port: 3000,
    fetch: app.fetch,
}
