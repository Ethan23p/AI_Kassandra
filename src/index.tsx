import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { getCookie, setCookie } from 'hono/cookie';
import { Layout, Landing, QuestionCard, AssessmentComplete } from './ui';
import { getQuestion, getNextQuestionId, saveAnswer, getOrCreateUser } from './db';

const app = new Hono<{ Variables: { userId: string } }>();

// Serve static files
app.use('/public/*', serveStatic({ root: './' }));

// Middleware to ensure anonymous_id
app.use('*', async (c, next) => {
    let userId = getCookie(c, 'anonymous_id');
    if (!userId) {
        userId = crypto.randomUUID();
        setCookie(c, 'anonymous_id', userId, {
            maxAge: 60 * 60 * 24 * 365, // 1 year
            path: '/',
        });
    }
    c.set('userId', userId);
    await next();
});

// Routing
app.get('/', (c) => {
    return c.html(
        <Layout>
            <Landing />
        </Layout>
    );
});

// Assessment Flow
app.get('/assessment/start', (c) => {
    const userId = c.get('userId') as string;
    getOrCreateUser(userId);
    const firstId = getNextQuestionId(null);
    if (!firstId) return c.html(<p class="text-white">No questions found.</p>);

    const question = getQuestion(firstId);
    return c.html(<QuestionCard question={question} />);
});

app.post('/api/answer', async (c) => {
    const userId = c.get('userId') as string;
    const body = await c.req.parseBody();
    const questionId = Number(body.questionId);
    const choiceId = Number(body.choiceId);

    saveAnswer(userId, questionId, choiceId);

    const nextId = getNextQuestionId(questionId);
    if (nextId) {
        const question = getQuestion(nextId);
        return c.html(<QuestionCard question={question} />);
    }

    return c.html(<AssessmentComplete />);
});

// Mock Guidance Generation
app.get('/api/guidance/generate', (c) => {
    return c.html(
        <div class="glass p-8 text-center space-y-4 animate-in fade-in duration-1000">
            <h2 class="text-2xl font-bold text-white">Your Guidance</h2>
            <p class="text-gray-300 italic">
                "The wind does not blow for the tree that remains rigid, but for the one that learns to dance in its own shadow. Your path today is not a line, but a circle expanding outward."
            </p>
            <div class="pt-6">
                <button class="text-[#e94560] font-semibold hover:underline">Receive this daily →</button>
            </div>
        </div>
    );
});

export default {
    port: 3000,
    fetch: app.fetch,
};
