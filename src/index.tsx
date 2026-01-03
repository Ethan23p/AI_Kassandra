import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { Layout, Welcome, QuestionView, GuidanceView } from './ui'
import { initDB, findNextQuestionForUser, saveAnswer } from './db'
import { authMiddleware } from './auth'

// Initialize Database
initDB()

type Variables = {
    userId: string
}

const app = new Hono<{ Variables: Variables }>()

// Static file serving
app.use('/public/*', serveStatic({ root: './' }))

// Auth middleware for all routes except static
app.use('*', (c, next) => {
    if (c.req.path.startsWith('/public/')) return next()
    return authMiddleware(c, next)
})

// Root route
app.get('/', (c) => {
    return c.html(
        <Layout>
            <Welcome />
        </Layout>
    )
})

// Start Assessment
app.get('/assessment/start', (c) => {
    return c.redirect('/assess')
})

// Display/Fetch Question
app.get('/assess', (c) => {
    const userId = c.get('userId')
    const question = findNextQuestionForUser(userId)

    if (!question) {
        // Mock Guidance
        const mockGuidance = "Your path is illuminated by the flickering light of digital stars. You balance chaos with a search for meaning, seeking harmony in the friction of existence. Trust your intuition, for it is the compass of your soul."
        return c.html(<GuidanceView guidance={mockGuidance} />)
    }

    return c.html(<QuestionView question={question} />)
})

// Handle Answer
app.post('/assess', async (c) => {
    const userId = c.get('userId')
    const body = await c.req.parseBody()
    const questionId = parseInt(body.questionId as string)
    const choiceId = parseInt(body.choiceId as string)

    saveAnswer(userId, questionId, choiceId)

    // Return the next question
    const nextQuestion = findNextQuestionForUser(userId)
    if (!nextQuestion) {
        const mockGuidance = "Your path is illuminated by the flickering light of digital stars. You balance chaos with a search for meaning, seeking harmony in the friction of existence. Trust your intuition, for it is the compass of your soul."
        return c.html(<GuidanceView guidance={mockGuidance} />)
    }

    return c.html(<QuestionView question={nextQuestion} />)
})

export default {
    port: 3000,
    fetch: app.fetch,
}
