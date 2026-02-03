import { Hono } from 'hono'
import { Layout, LandingPage, AssessmentPage, RegistrationPage, DashboardPage, UserProfilePage } from './ui'
import { getSessionUser, createSession, clearSession } from './auth'
import { saveUser, getProfileAt, saveProfile, saveGuidance, getGuidancesAt } from './db'
import { User, PersonalityProfile, Guidance } from './types'
import questionsData from './data/questions.json'
import { v4 as uuidv4 } from 'uuid'

type Env = {
    Variables: {
        user: User | null
    }
}

const app = new Hono<Env>()

// Middleware to ensure session
app.use('*', async (c, next) => {
    const user = getSessionUser(c)
    c.set('user', user)
    await next()
})

app.get('/', (c) => {
    const user = c.get('user') as User | null
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
    let user = c.get('user') as User | null
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

app.post('/api/assessment/answer', async (c) => {
    const user = c.get('user') as User
    const body = await c.req.parseBody()
    const questionId = body.questionId
    const answerIndex = parseInt(body.answerIndex as string)

    // Normalize comparison by checking strings
    const currentIndex = questionsData.findIndex(q => String(q.id) === String(questionId))
    const nextIndex = currentIndex + 1

    if (nextIndex < 5) { // Prototype: only 5 questions
        const nextQuestion = questionsData[nextIndex]
        return c.html(<AssessmentPage question={nextQuestion} progress={nextIndex + 1} />)
    } else {
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

app.post('/api/register', async (c) => {
    const user = c.get('user') as User
    const body = await c.req.parseBody()
    const email = body.email as string

    user.email = email
    user.status = 'registeredOnly'
    saveUser(user)

    // Generate initial mock guidance
    const mockGuidance: Guidance = {
        id: uuidv4(),
        user_id: user.id,
        text: "Your willingness to adapt is your greatest strength. Today, focus on the space between your plans and the reality that unfolds.",
        input_data: JSON.stringify({ initial: true }),
        created_at: Date.now()
    }
    saveGuidance(mockGuidance)

    return c.redirect('/dashboard')
})

app.get('/dashboard', (c) => {
    const user = c.get('user') as User | null
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
    const user = c.get('user') as User | null
    if (!user) return c.redirect('/')

    const guidances = getGuidancesAt(user.id)
    return c.html(
        <Layout user={user}>
            <UserProfilePage user={user} guidances={guidances} />
        </Layout>
    )
})

app.post('/api/login', async (c) => {
    const body = await c.req.parseBody()
    const email = body.email as string

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
    const user = c.get('user') as User
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
