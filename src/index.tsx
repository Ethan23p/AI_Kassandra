import { Hono } from 'hono'
import { logger as honoLogger } from 'hono/logger'
import { logger } from './logger'
import { Layout, LandingPage, AssessmentPage, RegistrationPage, DashboardPage, UserProfilePage, shuffle } from './ui'
import { getSessionUser, createSession, clearSession } from './auth'
import { saveUser, getProfileAt, saveProfile, saveGuidance, getGuidancesAt, getUserByEmail, getTotalGuidanceCountSince, saveInteraction, getInteractionsAt } from './db'
import { setCookie } from 'hono/cookie'
import { User, PersonalityProfile, Guidance, AssessmentAnswerSchema, RegisterSchema, Question, QuestionSchema, UserInteraction } from './types'
import { updateProfile, createNeutralProfile } from './user'
import { generateAIGuidance, generateRawResponse } from './ai'
import { CONFIG } from './config'
import { questionsData } from './data/questions'
import { COPY } from './data/copy'
import { v4 as uuidv4 } from 'uuid'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import workshop from './workshop/routes'

type Env = {
    Variables: {
        user: User | null
    }
}

const app = new Hono<Env>()

// Normalize trailing slashes
app.use('*', async (c, next) => {
    const path = new URL(c.req.url).pathname
    if (path !== '/' && path.endsWith('/')) {
        return c.redirect(path.slice(0, -1), 301)
    }
    await next()
})

app.use('*', honoLogger())

// Mount workshop dev routes
app.route('/dev/workshop', workshop)

app.onError((err, c) => {
    logger.error('SERVER ERROR:', err)
    return c.html(
        <Layout>
            <div class="fade-in">
                <h1>{COPY.error.title}</h1>
                <p>{COPY.error.description}</p>
                <code style="opacity: 0.5;">{err.message}</code>
                <br /><br />
                <a href="/" class="btn btn-outline">{COPY.error.return_btn}</a>
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
    const shuffledKeys = shuffle(questionKeys)
    const firstId = shuffledKeys[0]
    const remaining = shuffledKeys.slice(1)
    const question = questionsData[firstId]

    logger.debug(`[DEBUG] /assessment: Starting with user ${user.id}, Shuffled Total: ${shuffledKeys.length}`);

    return c.html(
        <Layout user={user}>
            <AssessmentPage
                question={question}
                questionId={firstId}
                progress={1}
                total={shuffledKeys.length}
                remainingIds={remaining}
            />
        </Layout>
    )
})

app.post('/api/assessment/answer', zValidator('form', AssessmentAnswerSchema), async (c) => {
    const user = c.get('user')
    if (!user) return c.redirect('/assessment')

    const { questionId, answerKey, remainingIds } = c.req.valid('form')
    const totalQuestions = Object.keys(questionsData).length

    // Convert remainingIds string back to array
    const remaining = remainingIds ? remainingIds.split(',').filter(id => id.length > 0) : []
    const progress = totalQuestions - remaining.length

    const currentQuestion = questionsData[questionId]
    if (!currentQuestion) {
        logger.warn(`[DEBUG] Question not found: ${questionId}`);
        return c.redirect('/assessment')
    }

    const chosenChoice = currentQuestion.choices[answerKey]
    if (!chosenChoice) {
        logger.warn(`[DEBUG] Choice not found: ${answerKey} for question ${questionId}`);
        return c.redirect('/assessment')
    }

    // Update personality profile
    let profile = getProfileAt(user.id)
    if (!profile) profile = createNeutralProfile(user.id)

    const updatedProfile = updateProfile(profile, chosenChoice.impulses, CONFIG.PERSONALITY_SENSITIVITY)
    saveProfile(updatedProfile)

    // Log Interaction
    const interaction: UserInteraction = {
        id: uuidv4(),
        user_id: user.id,
        question_id: questionId,
        choice_id: answerKey,
        impulses: chosenChoice.impulses,
        created_at: Date.now()
    }
    saveInteraction(interaction)

    logger.debug(`[DEBUG] /api/assessment/answer: questionId=${questionId}, answerKey=${answerKey}, remaining=${remaining.length}, total=${totalQuestions}`);

    if (remaining.length > 0) {
        const nextId = remaining[0]
        const nextRemaining = remaining.slice(1)
        const nextQuestion = questionsData[nextId]
        return c.html(
            <AssessmentPage
                question={nextQuestion}
                questionId={nextId}
                progress={progress + 1}
                total={totalQuestions}
                remainingIds={nextRemaining}
            />
        )
    } else {
        // Broad Protection: Check global daily limit
        const totalLast24h = getTotalGuidanceCountSince(Date.now() - (24 * 60 * 60 * 1000));

        let guidanceText: string;
        if (totalLast24h >= CONFIG.GLOBAL_DAILY_GENERATION_LIMIT) {
            guidanceText = COPY.guidance.global_limit;
        } else {
            const profileSnapshot = getProfileAt(user.id);
            guidanceText = profileSnapshot
                ? await generateAIGuidance(profileSnapshot)
                : COPY.guidance.fallback_silence;

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
            logger.debug(`[DEBUG] Ephemeral user. Returning Integrated RegistrationPage fragment.`);
            return c.html(<RegistrationPage />)
        } else {
            logger.debug(`[DEBUG] Existing user. Redirecting to dashboard.`);
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
    const interactions = getInteractionsAt(user.id)

    return c.html(
        <Layout user={user}>
            <UserProfilePage user={user} guidances={guidances} profile={profile} interactions={interactions} />
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

async function generateAndSaveGuidance(user: User): Promise<void> {
    // Spam Protection: Individual Cooldown
    const now = Date.now();
    if (user.last_generated_at && (now - user.last_generated_at < CONFIG.USER_GENERATION_COOLDOWN_MS)) {
        const remainingMin = Math.ceil((CONFIG.USER_GENERATION_COOLDOWN_MS - (now - user.last_generated_at)) / 60000);
        const waitGuidance: Guidance = {
            id: uuidv4(),
            user_id: user.id,
            text: `${COPY.guidance.cooldown_prefix}${remainingMin}${COPY.guidance.cooldown_suffix}`,
            input_data: JSON.stringify({ throttled: true }),
            created_at: Date.now()
        }
        saveGuidance(waitGuidance)
        return
    }

    // Broad Protection: Global Daily Limit
    const totalLast24h = getTotalGuidanceCountSince(now - (24 * 60 * 60 * 1000));
    if (totalLast24h >= CONFIG.GLOBAL_DAILY_GENERATION_LIMIT) {
        const limitGuidance: Guidance = {
            id: uuidv4(),
            user_id: user.id,
            text: COPY.guidance.global_limit,
            input_data: JSON.stringify({ global_limited: true }),
            created_at: Date.now()
        }
        saveGuidance(limitGuidance)
        return
    }

    const profile = getProfileAt(user.id)
    const guidanceText = profile
        ? await generateAIGuidance(profile)
        : COPY.guidance.fallback_action;

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
}

app.post('/api/generate-guidance', async (c) => {
    const user = c.get('user')
    if (!user) return c.redirect('/')
    await generateAndSaveGuidance(user)
    return c.redirect('/dashboard')
})

app.post('/api/debug/prompt', zValidator('form', z.object({ prompt: z.string() })), async (c) => {
    const { prompt } = c.req.valid('form')
    const response = await generateRawResponse(prompt)

    return c.html(
        <div class="fade-in" style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            <h2 style="opacity: 0.6; font-size: 1.2rem; margin-bottom: 3rem;">Debug Response</h2>
            <div style="background: rgba(245, 245, 220, 0.05); padding: 3rem; border-radius: 8px; max-width: 600px; border: 1px solid rgba(245, 245, 220, 0.1);">
                <p style="font-size: 1.5rem; font-style: italic; line-height: 1.4;">"{response}"</p>
            </div>
            <a href="/" class="btn btn-outline" style="margin-top: 2rem;">Back</a>
        </div>
    )
})

export default app
