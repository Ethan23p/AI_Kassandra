export const CONFIG = {
    // Environment
    ENV: process.env.NODE_ENV || 'development',
    DEBUG_MODE: process.env.DEBUG_MODE === 'true' || false,
    LOG_FILE_PATH: process.env.LOG_FILE_PATH || 'server.log',

    // Spam protection: Minimum time between generations for a single user
    USER_GENERATION_COOLDOWN_MS: 30 * 60 * 1000, // 30 minutes

    // Broad protection: Maximum total generations allowed across all users in 24 hours
    GLOBAL_DAILY_GENERATION_LIMIT: 100,

    // Personality sensitivity (0.0 to 1.0)
    PERSONALITY_SENSITIVITY: 0.5,

    // Which persona from prompts.ts to use for guidance generation
    ACTIVE_PERSONA: process.env.ACTIVE_PERSONA || 'stranger_kassandra_12',
};
