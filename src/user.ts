import { PersonalityProfile, PersonalityTrait, User } from './types';
import { v4 as uuidv4 } from 'uuid';
import { CONFIG } from './config';

/**
 * Applies an impulse to a value constrained between -1 and 1.
 * Uses the "Remaining Room" algorithm to prevent overflow.
 *
 * @param current The current trait score (-1 to 1)
 * @param impulse The force of the event (e.g. 0.1 or -0.2)
 * @param sensitivity A multiplier for how fast the system learns (0 to 1)
 */
export function applyImpulse(current: number, impulse: number, sensitivity = 0.1): number {
    // 1. Scale the raw impulse by sensitivity
    const force = impulse * sensitivity;

    // 2. Positive Impulse: Grow towards 1.0
    if (force > 0) {
        const roomToGrow = 1.0 - current;
        return current + (force * roomToGrow);
    }

    // 3. Negative Impulse: Shrink towards -1.0
    if (force < 0) {
        // Room to shrink is distance to -1.0
        const roomToShrink = 1.0 + current;
        return current + (force * roomToShrink);
    }

    // 4. No change
    return current;
}

/**
 * Updates a personality profile with a batch of impulses.
 */
export function updateProfile(
    profile: PersonalityProfile,
    impulses: Record<string, number>,
    sensitivity = 0.1
): PersonalityProfile {
    const newTraits = { ...profile.traits };

    for (const [traitName, impulse] of Object.entries(impulses)) {
        const currentTrait = newTraits[traitName] || {
            id: traitName,
            name: traitName,
            score: 0, // Neutral start
            label: traitName
        };

        newTraits[traitName] = {
            ...currentTrait,
            score: applyImpulse(currentTrait.score, impulse, sensitivity)
        };
    }

    return {
        ...profile,
        traits: newTraits,
        updated_at: Date.now()
    };
}

/**
 * Creates a neutral personality profile for a new user.
 */
export function createNeutralProfile(userId: string): PersonalityProfile {
    // Initial traits can be empty or predefined.
    // We'll define the Big 5 traits as a starting point.
    const traits: Record<string, PersonalityTrait> = {
        'openness': { id: 'openness', name: 'Openness', score: 0, label: 'Open' },
        'conscientiousness': { id: 'conscientiousness', name: 'Conscientiousness', score: 0, label: 'Conscientious' },
        'extraversion': { id: 'extraversion', name: 'Extraversion', score: 0, label: 'Extraverted' },
        'agreeableness': { id: 'agreeableness', name: 'Agreeableness', score: 0, label: 'Agreeable' },
        'neuroticism': { id: 'neuroticism', name: 'Neuroticism', score: 0, label: 'Neurotic' }
    };

    return {
        id: uuidv4(),
        user_id: userId,
        updated_at: Date.now(),
        traits
    };
}

/**
 * Constructs a fresh User. The single source of truth for new-user defaults —
 * status derived from email, tags populated from CONFIG.DEFAULT_NEW_USER_TAGS.
 */
export function buildNewUser(params: { email: string | null; playtest_cookie?: string }): User {
    const now = Date.now();
    return {
        id: uuidv4(),
        email: params.email,
        playtest_cookie: params.playtest_cookie ?? uuidv4(),
        status: params.email ? 'registeredOnly' : 'ephemeral',
        created_at: now,
        last_interacted_at: now,
        last_generated_at: null,
        tags: [...CONFIG.DEFAULT_NEW_USER_TAGS],
    };
}

/**
 * Pure helper for the "advance time" event: returns a timestamp shifted
 * backward so that the user's cooldown has effectively elapsed.
 */
export function shiftLastGeneratedForAdvance(now: number, deltaMs: number): number {
    return now - deltaMs;
}
