import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { Layout, LandingPage, AssessmentPage, RegistrationPage, DashboardPage, UserProfilePage } from './ui'
import { getSessionUser, createSession, clearSession } from './auth'
import { saveUser, getProfileAt, saveProfile, saveGuidance, getGuidancesAt, getUserByEmail, getTotalGuidanceCountSince } from './db'
import { setCookie } from 'hono/cookie'
import { User, PersonalityProfile, Guidance, AssessmentAnswerSchema, RegisterSchema, Question, QuestionSchema } from './types'
import { updateProfile, createNeutralProfile } from './user'
import { generateAIGuidance } from './ai'
import { CONFIG } from './config'
import { questionsData } from './data/questions'
import { v4 as uuidv4 } from 'uuid'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

type Env = {
    Variables: {
        user: User | null
    }
}

const app = new Hono<Env>()

app.use('*', logger())

app.onError((err, c) => {
    console.error('SERVER ERROR:', err)
    return c.html(
        <Layout>
            <div class="fade-in">
                <h1>Something went quiet.</h1>
                <p>Kassandra hit a snag. The stars are momentarily obscured.</p>
                <code style="opacity: 0.5;">{err.message}</code>
                <br /><br />
                <a href="/" class="btn btn-outline">Return to the Path</a>
            </div>
        </Layout>,
        500
    )
})

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

    const questionKeys = Object.keys(questionsData)
    const firstId = questionKeys[0]
    const question = questionsData[firstId]
    console.log(`[DEBUG] /assessment: Starting with user ${user.id}, Total questions: ${questionKeys.length}`);

    return c.html(
        <Layout user={user}>
            <AssessmentPage question={question} questionId={firstId} progress={1} total={questionKeys.length} />
        </Layout>
    )
})

app.post('/api/assessment/answer', zValidator('form', AssessmentAnswerSchema), async (c) => {
    const user = c.get('user')
    if (!user) return c.redirect('/assessment')

    const { questionId, answerKey } = c.req.valid('form')
    const questionIds = Object.keys(questionsData)
    const currentIndex = questionIds.indexOf(questionId)

    // Sanity check: if question not found, restart assessment
    if (currentIndex === -1) {
        console.warn(`[DEBUG] Question not found: ${questionId}`);
        return c.redirect('/assessment')
    }

    const currentQuestion = questionsData[questionId]
    const chosenChoice = currentQuestion.choices[answerKey]

    if (!chosenChoice) {
        console.warn(`[DEBUG] Choice not found: ${answerKey} for question ${questionId}`);
        return c.redirect('/assessment')
    }

    // Update personality profile
    let profile = getProfileAt(user.id)
    if (!profile) {
        profile = createNeutralProfile(user.id)
    }

    const updatedProfile = updateProfile(profile, chosenChoice.impulses)
    saveProfile(updatedProfile)

    const nextIndex = currentIndex + 1
    console.log(`[DEBUG] /api/assessment/answer: questionId=${questionId}, answerKey=${answerKey}, nextIdx=${nextIndex}, total=${questionIds.length}`);

    if (nextIndex < questionIds.length) {
        const nextId = questionIds[nextIndex]
        const nextQuestion = questionsData[nextId]
        return c.html(<AssessmentPage question={nextQuestion} questionId={nextId} progress={nextIndex + 1} total={questionIds.length} />)
    } else {
        // Broad Protection: Check global daily limit
        const totalLast24h = getTotalGuidanceCountSince(Date.now() - (24 * 60 * 60 * 1000));

        let guidanceText: string;
        if (totalLast24h >= CONFIG.GLOBAL_DAILY_GENERATION_LIMIT) {
            guidanceText = "The collective energy is high. Kassandra is resting. Try again tomorrow.";
        } else {
            const profileSnapshot = getProfileAt(user.id);
            guidanceText = profileSnapshot
                ? await generateAIGuidance(profileSnapshot)
                : "Reflect on the silence within.";

            // Update user's last generation timestamp
            user.last_generated_at = Date.now();
            saveUser(user);
        }

        const guidance: Guidance = {
            id: uuidv4(),
            user_id: user.id,
            text: guidanceText,
            input_data: JSON.stringify({ completedAssessment: true, profileSnapshot: getProfileAt(user.id) }),
            created_at: Date.now()
        }
        saveGuidance(guidance)

        if (user.status === 'ephemeral') {
            console.log(`[DEBUG] Ephemeral user. Returning Integrated RegistrationPage fragment.`);
            return c.html(<RegistrationPage />)
        } else {
            console.log(`[DEBUG] Existing user. Redirecting to dashboard.`);
            c.header('HX-Redirect', '/dashboard')
            return c.redirect('/dashboard')
        }
    }
})

app.get('/registration', (c) => {
    const user = c.get('user')
    if (!user) return c.redirect('/assessment')
    return c.html(
        <Layout user={user}>
            <RegistrationPage />
        </Layout>
    )
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
    c.header('HX-Redirect', '/dashboard')
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
    const profile = getProfileAt(user.id)
    return c.html(
        <Layout user={user}>
            <UserProfilePage user={user} guidances={guidances} profile={profile} />
        </Layout>
    )
})

app.post('/api/login', zValidator('form', z.object({ email: z.string().email() })), async (c) => {
    const { email } = c.req.valid('form')

    // Minimal: just create/restore session based on email
    // In a real app, this would be more complex auth
    createSession(c, email)
    c.header('HX-Redirect', '/dashboard')
    return c.redirect('/dashboard')
})

app.post('/api/clear-identity', (c) => {
    clearSession(c)
    return c.redirect('/')
})

app.post('/api/generate-guidance', async (c) => {
    const user = c.get('user')
    if (!user) return c.redirect('/')

    // Spam Protection: Individual Cooldown
    const now = Date.now();
    if (user.last_generated_at && (now - user.last_generated_at < CONFIG.USER_GENERATION_COOLDOWN_MS)) {
        const remainingMin = Math.ceil((CONFIG.USER_GENERATION_COOLDOWN_MS - (now - user.last_generated_at)) / 60000);
        const waitGuidance: Guidance = {
            id: uuidv4(),
            user_id: user.id,
            text: `Patience. Clarity requires time. Return in ${remainingMin} minutes.`,
            input_data: JSON.stringify({ throttled: true }),
            created_at: Date.now()
        }
        saveGuidance(waitGuidance)
        return c.redirect('/dashboard')
    }

    // Broad Protection: Global Daily Limit
    const totalLast24h = getTotalGuidanceCountSince(now - (24 * 60 * 60 * 1000));
    if (totalLast24h >= CONFIG.GLOBAL_DAILY_GENERATION_LIMIT) {
        const limitGuidance: Guidance = {
            id: uuidv4(),
            user_id: user.id,
            text: "The stars are veiled by a great cloud. (Global limit reached). Try again tomorrow.",
            input_data: JSON.stringify({ global_limited: true }),
            created_at: Date.now()
        }
        saveGuidance(limitGuidance)
        return c.redirect('/dashboard')
    }

    const profile = getProfileAt(user.id)
    const guidanceText = profile
        ? await generateAIGuidance(profile)
        : "Action preceded by doubt is still action. Move forward."

    // Update timestamp
    user.last_generated_at = now;
    saveUser(user);

    const guidance: Guidance = {
        id: uuidv4(),
        user_id: user.id,
        text: guidanceText,
        input_data: JSON.stringify({ manual: true, profileSnapshot: profile }),
        created_at: Date.now()
    }
    saveGuidance(guidance)
    return c.redirect('/dashboard')
})

export default app
