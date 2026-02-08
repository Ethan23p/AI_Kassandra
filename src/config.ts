/**
 * AI Kassandra System Configuration
 */
export const CONFIG = {
    // Spam protection: Minimum time between generations for a single user
    USER_GENERATION_COOLDOWN_MS: 30 * 60 * 1000, // 30 minutes

    // Broad protection: Maximum total generations allowed across all users in 24 hours
    GLOBAL_DAILY_GENERATION_LIMIT: 100,

    // Personality sensitivity (0.0 to 1.0)
    PERSONALITY_SENSITIVITY: 0.1,
};
