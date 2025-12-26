import {
    getQuestions,
    saveAnswer,
    createAnonymousUser,
    updateUserToPermanent,
    createQuestion,
    purgeAbandonedUsers,
    getUser,
    db
} from './src/models';

console.log("--- Starting Verification (Hygiene & Refinement) ---");

try {
    // 0. Ensure Questions
    let qs = getQuestions();
    if (qs.length === 0) {
        createQuestion("Hygiene Test?", "radio", ["Pass", "Fail"]);
        qs = getQuestions();
    }

    // 1. Test Anonymity Flag
    console.log("Creating anonymous user...");
    const anon = createAnonymousUser();
    console.log(`Anon User: ID ${anon.id}, is_anonymous: ${anon.is_anonymous}`);
    if (anon.is_anonymous !== 1) throw new Error("Anonymous user not flagged correctly");

    // 2. Test Activity & Abandonment Purge
    console.log("Testing abandonment purge (immediate)...");
    // Using 0 hours means purge anyone created even a millisecond ago
    purgeAbandonedUsers(0);
    const shouldBeDead = getUser(anon.id);
    console.log(`User ${anon.id} purged? ${!shouldBeDead}`);
    if (shouldBeDead) throw new Error("Abandoned user was not purged");

    // 3. Test Data Protection during Purge
    console.log("Testing purge protection for users WITH data...");
    const activeAnon = createAnonymousUser();
    saveAnswer(activeAnon.id, qs[0].id, "Pass");
    purgeAbandonedUsers(-1);
    const shouldBeAlive = getUser(activeAnon.id);
    console.log(`User with data ${activeAnon.id} still alive? ${!!shouldBeAlive}`);
    if (!shouldBeAlive) throw new Error("Active user with data was purged incorrectly");

    // 4. Test Email Normalization & Upgrade Anonymity Flip
    const rawEmail = "  TEST_UPGRADE@EXAMPLE.COM  ";
    console.log(`Upgrading user ${activeAnon.id} with email: '${rawEmail}'`);
    const permanent = updateUserToPermanent(activeAnon.id, rawEmail, "CleanUser");

    console.log(`Normalized Email: '${permanent.email}', is_anonymous: ${permanent.is_anonymous}`);
    if (permanent.email !== "test_upgrade@example.com") throw new Error("Email normalization failed");
    if (permanent.is_anonymous !== 0) throw new Error("User still flagged as anonymous after upgrade");

    console.log("--- Verification Complete: SUCCESS ---");
} catch (error: any) {
    console.error("!!! VERIFICATION FAILED !!!");
    console.error(error);
    process.exit(1);
}
