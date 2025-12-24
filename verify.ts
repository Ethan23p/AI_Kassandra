import {
    getQuestions,
    saveAnswer,
    getAnswers,
    createAnonymousUser,
    updateUserToPermanent,
    createQuestion,
    getUser
} from './src/models';
import { buildContext } from './src/interfaces/profile_interface';

console.log("--- Starting Verification (Phase 3: Onboarding) ---");

try {
    // 0. Ensure Questions
    let qs = getQuestions();
    if (qs.length === 0) {
        console.log("Seeding test question...");
        createQuestion("Seeded Test Question", "radio", ["Yes", "No"]);
        qs = getQuestions();
    }

    // 1. Create Anonymous User
    console.log("Creating anonymous user...");
    const anon = createAnonymousUser();
    console.log(`Anon User created: ID ${anon.id}`);

    // 2. Submit Answer
    const targetQ = qs[0];
    saveAnswer(anon.id, targetQ.id, "Yes");

    // 3. Upgrade
    const email = `test_${Date.now()}@ Kassandra.com`;
    console.log(`Attempting upgrade to email: ${email}`);

    // Test if RETURNING works or if we should split it
    const permanent = updateUserToPermanent(anon.id, email, "Playtester");
    console.log(`Upgrade successful? ${!!permanent}`);
    if (permanent) {
        console.log(`New Email: ${permanent.email}`);
    }

    console.log("--- Verification Complete: SUCCESS ---");
} catch (error: any) {
    console.error("!!! VERIFICATION FAILED !!!");
    console.error(error);
    process.exit(1);
}
