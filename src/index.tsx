import { Hono } from 'hono'
import { Layout, LandingPage, AssessmentPage, RegistrationPage, DashboardPage, UserProfilePage } from './ui'
import { getSessionUser, createSession, clearSession } from './auth'
import { saveUser, getProfileAt, saveProfile, saveGuidance, getGuidancesAt, getUserByEmail } from './db'
import { setCookie } from 'hono/cookie'
import { User, PersonalityProfile, Guidance, AssessmentAnswerSchema, RegisterSchema } from './types'
import questionsData from './data/questions.json'
import { v4 as uuidv4 } from 'uuid'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

type Env = {
    Variables: {
        user: User | null
    }
}

const app = new Hono<Env>()

// Middleware to ensure session
app.use('*', async (c, next) => {
    const user = getSessionUser(c)
    if (user) {
        user.last_interacted_at = Date.now()
        saveUser(user)
    }
    c.set('user', user)
    await next()
})

app.get('/', (c) => {
    const user = c.get('user')
    if (user && user.email) {
        return c.redirect('/dashboard')
    }
    return c.html(
        <Layout user={user}>
            <LandingPage />
        </Layout>
    )
})

app.get('/assessment', (c) => {
    let user = c.get('user')
    if (!user) {
        user = createSession(c)
    }

    // For prototype, we just start at Q0
    const question = questionsData[0]
    return c.html(
        <Layout user={user}>
            <AssessmentPage question={question} progress={1} />
        </Layout>
    )
})

app.post('/api/assessment/answer', zValidator('form', AssessmentAnswerSchema), async (c) => {
    const user = c.get('user')
    if (!user) return c.redirect('/assessment')

    const { questionId, answerIndex } = c.req.valid('form')

    // Normalize comparison by checking strings
    const currentIndex = questionsData.findIndex(q => String(q.id) === String(questionId))
    const nextIndex = currentIndex + 1

    if (nextIndex < 5) { // Prototype: only 5 questions
        const nextQuestion = questionsData[nextIndex]
        return c.html(<AssessmentPage question={nextQuestion} progress={nextIndex + 1} />)
    } else {
        // Generate mock guidance for finishing assessment
        const mockGuidance: Guidance = {
            id: uuidv4(),
            user_id: user.id,
            text: "By completing this cycle, you've shown a commitment to self-reflection. Today, notice how your assumptions color your environment.",
            input_data: JSON.stringify({ completedAssessment: true }),
            created_at: Date.now()
        }
        saveGuidance(mockGuidance)

        // If it's the 5th question, go to registration or dashboard
        if (user.status === 'ephemeral') {
            return c.html(
                <Layout user={user}>
                    <RegistrationPage />
                </Layout>
            )
        } else {
            return c.redirect('/dashboard')
        }
    }
})

app.post('/api/register', zValidator('form', RegisterSchema), async (c) => {
    const user = c.get('user')
    if (!user) return c.redirect('/assessment')

    const { email } = c.req.valid('form')

    // Check if user with this email already exists
    const existing = getUserByEmail(email)

    if (existing) {
        // If they exist, switch the session to their old ID
        // Note: For playtest simplicity, we just take over the session
        setCookie(c, 'kassandra_session', existing.playtest_cookie, {
            path: '/',
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 30,
        })
        return c.redirect('/dashboard')
    }

    user.email = email
    user.status = 'registeredOnly'
    user.last_interacted_at = Date.now()
    saveUser(user)
    return c.redirect('/dashboard')
})

app.get('/dashboard', (c) => {
    const user = c.get('user')
    if (!user) return c.redirect('/')

    const guidances = getGuidancesAt(user.id)
    if (guidances.length === 0) {
        // Should have one if they just registered, but just in case
        return c.redirect('/assessment')
    }

    return c.html(
        <Layout user={user}>
            <DashboardPage guidance={guidances[0]} user={user} />
        </Layout>
    )
})

app.get('/profile', (c) => {
    const user = c.get('user')
    if (!user) return c.redirect('/')

    const guidances = getGuidancesAt(user.id)
    return c.html(
        <Layout user={user}>
            <UserProfilePage user={user} guidances={guidances} />
        </Layout>
    )
})

app.post('/api/login', zValidator('form', z.object({ email: z.string().email() })), async (c) => {
    const { email } = c.req.valid('form')

    // Minimal: just create/restore session based on email
    // In a real app, this would be more complex auth
    createSession(c, email)
    return c.redirect('/dashboard')
})

app.post('/api/clear-identity', (c) => {
    clearSession(c)
    return c.redirect('/')
})

app.post('/api/generate-guidance', (c) => {
    const user = c.get('user')
    if (!user) return c.redirect('/')

    const mockGuidance: Guidance = {
        id: uuidv4(),
        user_id: user.id,
        text: `Insight generated at ${new Date().toLocaleTimeString()}: Embrace the ambiguity of your current path; clarity often follows action, not thought.`,
        input_data: JSON.stringify({ manual: true }),
        created_at: Date.now()
    }
    saveGuidance(mockGuidance)
    return c.redirect('/dashboard')
})

export default app
