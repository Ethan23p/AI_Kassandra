// src/index.tsx
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { AuthService, authMiddleware } from './auth';
import * as models from './models';
import {
  LandingPage,
  LoginPage,
  HomePage,
  QuestionForm,
  ProfileView,
  AboutPage,
  RegistrationPage
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

app.get('/', (c) => {
  const user = AuthService.getSessionUser(c);
  if (user && user.auth_provider !== 'anonymous') {
    return c.redirect('/dashboard');
  }
  return c.html(<LandingPage />);
});

app.get('/about', (c) => c.html(<AboutPage />));

app.get('/login', (c) => {
  const error = c.req.query('error');
  return c.html(<LoginPage error={error} />);
});

app.post('/login', async (c) => {
  const body = await c.req.parseBody();
  const identifier = body['username'] as string;
  const result = await AuthService.login(identifier);

  if (result.success && result.user) {
    AuthService.setSession(c, result.user);
    return c.redirect('/dashboard');
  } else {
    return c.redirect('/login?error=Invalid Credentials');
  }
});

app.get('/logout', (c) => {
  AuthService.logout(c);
  return c.redirect('/');
});

// --- ONBOARDING FLOW ---

app.get('/start', async (c) => {
  await AuthService.ensureSession(c);
  return c.redirect('/questions');
});

app.get('/questions', (c) => {
  const questions = models.getQuestions();
  return c.html(<QuestionForm questions={questions} />);
});

app.post('/submit-answers', async (c) => {
  const user = await AuthService.ensureSession(c);
  const body = await c.req.parseBody();

  // Save answers
  for (const key in body) {
    if (key.startsWith('q_')) {
      const qId = parseInt(key.replace('q_', ''));
      const val = body[key] as string;
      models.saveAnswer(user.id, qId, val);
    }
  }

  // Trigger AI Pipeline
  const context = await buildContext(user.id);
  const guidanceText = await generateGuidance(context);
  models.createGuidance(user.id, guidanceText);

  // If anonymous, go to registration to "save" the result
  if (user.auth_provider === 'anonymous') {
    return c.redirect('/register');
  }

  return c.redirect('/dashboard');
});

app.get('/register', (c) => {
  const user = AuthService.getSessionUser(c);
  if (!user || user.auth_provider !== 'anonymous') return c.redirect('/');
  return c.html(<RegistrationPage />);
});

app.post('/register', async (c) => {
  const user = AuthService.getSessionUser(c);
  if (!user || user.auth_provider !== 'anonymous') return c.redirect('/');

  const body = await c.req.parseBody();
  const email = body['email'] as string;
  const username = body['username'] as string;
  const subscribe = body['subscribe'] === 'on';

  try {
    const updatedUser = models.updateUserToPermanent(user.id, email, username, subscribe);
    AuthService.setSession(c, updatedUser);
    return c.redirect('/dashboard');
  } catch (e) {
    return c.html(<RegistrationPage error="Email may already be in use." />);
  }
});

// --- PROTECTED DASHBOARD ---

app.get('/dashboard', (c) => {
  const user = AuthService.getSessionUser(c);
  if (!user || user.auth_provider === 'anonymous') return c.redirect('/');

  const latest = models.getLatestGuidance(user.id);
  return c.html(<HomePage username={user.username!} latestGuidance={latest} />);
});

app.get('/profile', (c) => {
  const user = AuthService.getSessionUser(c);
  if (!user || user.auth_provider === 'anonymous') return c.redirect('/');

  const answers = models.getAnswers(user.id);
  return c.html(<ProfileView username={user.username!} answers={answers} />);
});

export default app;