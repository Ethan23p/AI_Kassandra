// src/index.tsx
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { AuthService, authMiddleware } from './auth';
import * as models from './models';
import {
  LoginPage,
  HomePage,
  QuestionForm,
  ProfileView
} from './views';
import { buildContext } from './interfaces/profile_interface';
import { generateGuidance } from './interfaces/ai_interface';

const app = new Hono();

app.use('*', logger());
app.use('*', authMiddleware);

// --- SEED DATA ---
if (models.getQuestions().length === 0) {
  console.log("Seeding default data...");
  models.createQuestion("I often feel overwhelmed by the possibilities of the future.", 'radio', ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]);
  models.createQuestion("I prefer structure and routine over spontaneity.", 'radio', ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]);
  models.createQuestion("Decision making is a purely logical process for me.", 'radio', ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]);
}

// --- PUBLIC ROUTES (Handled by middleware exemption) ---

app.get('/login', (c) => {
  const error = c.req.query('error');
  // Using existing LoginPage, but functionally it's now Email focused in Dev Strategy
  return c.html(<LoginPage error={error} />);
});

app.post('/login', async (c) => {
  const body = await c.req.parseBody();
  const identifier = body['username'] as string; // Reusing field name for now, but treating as identifier
  // Password ignored in Dev Strategy usually, or can be passed
  const password = body['password'] as string;

  const result = await AuthService.login(identifier, password);

  if (result.success && result.user) {
    AuthService.setSession(c, result.user);
    return c.redirect('/');
  } else {
    return c.redirect('/login?error=Invalid Credentials');
  }
});

app.get('/logout', (c) => {
  AuthService.logout(c);
  return c.redirect('/login');
});

// --- PROTECTED ROUTES ---

app.get('/', (c) => {
  const user = AuthService.getSessionUser(c);
  if (!user) return c.redirect('/login'); // Should be caught by middleware but safe check

  const latest = models.getLatestGuidance(user.id);
  return c.html(<HomePage username={user.username} latestGuidance={latest} />);
});

app.get('/questions', (c) => {
  const questions = models.getQuestions();
  return c.html(<QuestionForm questions={questions} />);
});

app.post('/submit-answers', async (c) => {
  const user = AuthService.getSessionUser(c);
  if (!user) return c.redirect('/login');

  const body = await c.req.parseBody();

  // Save answers
  for (const key in body) {
    if (key.startsWith('q_')) {
      const qId = parseInt(key.replace('q_', ''));
      const val = body[key] as string;
      models.saveAnswer(user.id, qId, val);
    }
  }

  // --- PIPELINE TRIGGER ---
  // 1. Profiler: Build Context
  const context = await buildContext(user.id);

  // 2. AI Agent: Generate Guidance
  const guidanceText = await generateGuidance(context);

  // 3. Save Result
  models.createGuidance(user.id, guidanceText);

  // 4. Communication (Future: Send Email)
  // await sendGuidance(user.email, guidanceText);

  return c.redirect('/');
});

app.get('/profile', (c) => {
  const user = AuthService.getSessionUser(c);
  if (!user) return c.redirect('/login');

  const answers = models.getAnswers(user.id);
  return c.html(<ProfileView username={user.username} answers={answers} />);
});

export default app;