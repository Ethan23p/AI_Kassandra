import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { deleteCookie } from 'hono/cookie'
import { Layout, Welcome, HeroContent, QuestionView, GuidanceView, GeneratingView } from './ui'
import { initDB, findNextQuestionForUser, saveAnswer, findDailyGuidanceForUser, saveGuidance, clearUserProgress } from './db'
import { authMiddleware } from './auth'
import { UserManager } from './user'
import { setCookie } from 'hono/cookie'

// Initialize Database
initDB()

type Variables = {
    userId?: string
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
app.get('/', async (c) => {
    const userId = c.get('userId')
    const user = userId ? await UserManager.getUserById(userId) : null

    if (c.req.header('HX-Request')) {
        return c.html(<Welcome username={user?.username} />)
    }

    return c.html(
        <Layout>
            <Welcome username={user?.username} />
        </Layout>
    )
})

// Identify User
app.post('/identify', async (c) => {
    const body = await c.req.parseBody()
    const username = body.username as string

    if (!username) return c.text('Username required', 400)

    const user = await UserManager.getOrCreateUserByUsername(username)

    // Set cookie
    setCookie(c, 'user_session', user.id, {
        path: '/',
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365, // 1 year
    })

    // Return just the hero section update
    return c.html(
        <HeroContent username={user.username} />
    )
})

// Start Assessment
app.get('/assessment/start', (c) => {
    return c.redirect('/assess')
})

// Debug: Reset Progress
app.get('/debug/reset', (c) => {
    const userId = c.get('userId')
    if (userId) {
        clearUserProgress(userId)
        deleteCookie(c, 'user_session', { path: '/' })
    }
    return c.redirect('/')
})

// Display/Fetch Question
app.get('/assess', async (c) => {
    const userId = c.get('userId')
    if (!userId) return c.redirect('/')

    const question = findNextQuestionForUser(userId)
    let content;

    if (!question) {
        // Check for existing guidance today
        const existing = findDailyGuidanceForUser(userId)
        if (existing) {
            content = <GuidanceView guidance={existing.text} />
        } else {
            // Generate and Save Mock Guidance
            const mockGuidance = "Your path is illuminated by the flickering light of digital stars. You balance chaos with a search for meaning, seeking harmony in the friction of existence. Trust your intuition, for it is the compass of your soul."
            saveGuidance(userId, mockGuidance, true)
            content = <GuidanceView guidance={mockGuidance} />
        }
    } else {
        content = <QuestionView question={question} />
    }

    if (c.req.header('HX-Request')) {
        return c.html(content)
    }
    return c.html(<Layout>{content}</Layout>)
})

// Handle Answer
app.post('/assess', async (c) => {
    const userId = c.get('userId')
    if (!userId) return c.redirect('/')

    const body = await c.req.parseBody()
    const questionId = parseInt(body.questionId as string)
    const choiceId = parseInt(body.choiceId as string)

    saveAnswer(userId, questionId, choiceId)

    // Return the next question or the generating view
    const nextQuestion = findNextQuestionForUser(userId)
    if (!nextQuestion) {
        return c.html(<GeneratingView />)
    }

    return c.html(<QuestionView question={nextQuestion} />)
})

export default {
    port: 3000,
    fetch: app.fetch,
}
