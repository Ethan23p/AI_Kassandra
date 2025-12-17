import {
    createUser,
    getUserByEmail,
    createQuestion,
    getQuestions,
    saveAnswer,
    getAnswers,
    createGuidance,
    getLatestGuidance,
    db
} from './src/models'; // Added db export for direct cleanup if needed
import { buildContext } from './src/interfaces/profile_interface';

console.log("--- Starting Verification (Phase 2) ---");

// 1. Create User
const email = `test_${Date.now()}@example.com`;
const username = `test_user_p2_${Date.now()}`; // Unique username
console.log(`Creating user with email: ${email}`);
const user = createUser(username, email);
console.log(`User created: ID ${user.id}, Email: ${user.email}, Auth: ${user.auth_provider}`);

if (user.email !== email) throw new Error("Email mismatch");

// 2. Questions
console.log("Checking questions...");
const questions = getQuestions();
// If we have existing seeded questions from index, good. If not, seed.
if (questions.length === 0) {
    console.log("Seeding question...");
    createQuestion("Phase 2 Test?", 'radio', ["Yes", "No"]);
}
const updatedQs = getQuestions();
console.log(`Questions found: ${updatedQs.length}`);
// Just pick the last one we see or created
const targetQ = updatedQs[updatedQs.length - 1];
console.log(`Testing with Question: ${targetQ.text}, Options: ${JSON.stringify(targetQ.options)}`);

// 3. Answers
console.log("Submitting answer...");
const val = targetQ.options && targetQ.options[0] ? targetQ.options[0] : "Default";
saveAnswer(user.id, targetQ.id, val);
const answers = getAnswers(user.id);
console.log(`Answers retrieved: ${answers.length} -> Value: ${answers[0].value}`);
// Note: We might get previous answers if we're not careful, but new user = 0 previous answers.
if (answers.length === 0) throw new Error("No answers saved");

// 4. Profiler Interface
console.log("Building Context...");
const context = await buildContext(user.id);
console.log(`Context Built for user ${context.user.username}`);
if (context.answers.length === 0) throw new Error("Context missing answers");

// 5. Guidance
console.log("Creating guidance...");
createGuidance(user.id, "Phase 2 Verification Complete.");
const guidance = getLatestGuidance(user.id);
console.log(`Guidance retrieved: ${guidance?.content}`);

console.log("--- Verification Complete: SUCCESS ---");
