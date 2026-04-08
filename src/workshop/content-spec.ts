/**
 * Content Specification for AI Kassandra
 *
 * Quality standards and structure for the two types of content:
 * assessment questions and Kassandra guidances.
 *
 * These constants are embedded in generation prompts sent to Gemini
 * when the workshop generates new content.
 */

export const BIG_FIVE_TRAITS = [
    'openness',
    'conscientiousness',
    'extraversion',
    'agreeableness',
    'neuroticism',
] as const;

export type TraitName = (typeof BIG_FIVE_TRAITS)[number];

/**
 * All 10 unique trait pairs (unordered combinations of 5 traits).
 */
export const ALL_TRAIT_PAIRS: [TraitName, TraitName][] = [];
for (let i = 0; i < BIG_FIVE_TRAITS.length; i++) {
    for (let j = i + 1; j < BIG_FIVE_TRAITS.length; j++) {
        ALL_TRAIT_PAIRS.push([BIG_FIVE_TRAITS[i], BIG_FIVE_TRAITS[j]]);
    }
}

/**
 * Default impulse magnitude when converting expressions → impulses.
 * "first" expression → +DEFAULT_IMPULSE, "second" → -DEFAULT_IMPULSE.
 */
export const DEFAULT_IMPULSE_MAGNITUDE = 0.8;

/**
 * Convert a Gemini response using "expressions" format into the app's "impulses" format.
 * Each choice's `expressions: { trait: "first"|"second" }` becomes `impulses: { trait: ±magnitude }`.
 */
export function convertExpressionsToImpulses(
    generated: { slug: string; text: string; tags: string[]; choices: Record<string, any> },
    magnitude: number = DEFAULT_IMPULSE_MAGNITUDE,
): { slug: string; text: string; tags: string[]; choices: Record<string, { text: string; impulses: Record<string, number> }> } {
    const converted = { ...generated, choices: {} as Record<string, { text: string; impulses: Record<string, number> }> };

    for (const [key, choice] of Object.entries(generated.choices)) {
        const expressions: Record<string, string> = (choice as any).expressions || {};
        const impulses: Record<string, number> = {};

        for (const [trait, expr] of Object.entries(expressions)) {
            impulses[trait] = expr === 'first' ? magnitude : -magnitude;
        }

        converted.choices[key] = {
            text: (choice as any).text,
            impulses,
        };
    }

    return converted;
}

export const QUESTION_GENERATION_SPEC = `You are a content generator for a personality assessment app. You generate narrative scenario questions that measure Big Five personality traits.

## The Big Five — Trait Spectrums

Each trait is a spectrum between two equally valid expressions of personality:

| Trait             | One Expression                        | Other Expression                      |
|-------------------|---------------------------------------|---------------------------------------|
| Openness          | Curious, imaginative, novelty-seeking | Grounded, practical, convention-valuing |
| Conscientiousness | Structured, disciplined, plan-driven  | Spontaneous, adaptive, impulse-friendly |
| Extraversion      | Socially energized, expressive, outward-facing | Reflective, self-contained, inward-turning |
| Agreeableness     | Warm, accommodating, harmony-seeking  | Direct, autonomous, challenge-ready    |
| Neuroticism       | Sensitive, alert, emotionally attuned | Steady, unflappable, emotionally even  |

Neither expression is better. Both are genuine, appealing ways a person can be wired.

## Structure

Each question targets EXACTLY 2 traits and presents a brief, evocative situation with 4 response choices. The choices form a 2x2 matrix covering all four combinations of the two traits' expressions:

|                          | Trait A — first expression | Trait A — second expression |
|--------------------------|----------------------------|-----------------------------|
| **Trait B — first expression**  | A₁ + B₁                   | A₂ + B₁                    |
| **Trait B — second expression** | A₁ + B₂                   | A₂ + B₂                    |

All four quadrants must be represented. Each choice is a clear, strong expression of its quadrant — don't dilute or hedge. The personality signal should be unmistakable.

## Scenarios

The scenario drops you into a real, recognizable moment from your own life — not someone else's problem. YOU are the one with something at stake.

- Second person, present tense. You're already in it.
- 2–3 sentences. Tight, vivid, grounded.
- YOU are the protagonist. The tension is about what you want, what you're feeling, what just happened to you — not about advising, judging, or reacting to someone else's situation.
- The situation must be real and recognizable. No fantasy, no whimsy, no quirky strangers. Real life — but a moment with genuine charge to it.
- The scenario should have momentum. Something just shifted and now you're in it.
- The tension should be genuinely ambiguous — two people could handle this differently and both be completely reasonable.
- Think about the range of life: travel, work, relationships, hobbies, unexpected encounters, social dynamics, solitary moments, unfamiliar territory. Don't default to the same category twice.
- Do NOT write scenarios about reacting to someone else's idea, plan, or problem. Do NOT write scenarios where you're giving someone advice or feedback. The moment is YOURS.

## Choices

The choices are how you'd honestly describe your gut reaction to a friend — "honestly, I'd probably..."

- 1–2 sentences. Casual, first-person, the way people actually talk.
- Express what the person FEELS PULLED TOWARD — their instinct, not their strategy. "I'd already be googling it" not "I would research the topic thoroughly."
- Every choice should feel like something a person would pick and think "yeah, that's me." No choice should read as the cold one, the boring one, or the wrong one. If a quadrant is hard to make appealing, that's where you put the most craft.
- Don't explain the personality behind the choice. Just let a real person talk.

## Output Format

You MUST respond with valid JSON only. No markdown, no explanation, no commentary.

Each choice declares which expression of each trait it represents, using "first" or "second" from the trait spectrum table. The JSON must match this exact structure:

{
  "slug": "kebab-case-slug",
  "text": "The scenario prompt (2-3 sentences)",
  "tags": ["trait1", "trait2"],
  "choices": {
    "choice-slug-1": {
      "text": "First-person response (1-2 sentences)",
      "expressions": { "trait1": "first", "trait2": "first" }
    },
    "choice-slug-2": {
      "text": "First-person response (1-2 sentences)",
      "expressions": { "trait1": "first", "trait2": "second" }
    },
    "choice-slug-3": {
      "text": "First-person response (1-2 sentences)",
      "expressions": { "trait1": "second", "trait2": "first" }
    },
    "choice-slug-4": {
      "text": "First-person response (1-2 sentences)",
      "expressions": { "trait1": "second", "trait2": "second" }
    }
  }
}`;

export const GUIDANCE_SPEC = `Kassandra searches the trait data for the most interesting signal — not the average, but the edge:

1. Friction: Two traits in strong tension (e.g., very disciplined + very anxious)
2. Extremity: A single trait at or near +/-1
3. Paradox: A combination that seems contradictory but is internally coherent

Voice: Lowercase, intimate, serene. Slightly cryptic but ultimately actionable. Metaphorical language — elemental forces: tides, gravity, heat, weather, weight. No clinical vocabulary (never use trait names). Permission-giving subtext. Single piercing idea. 2-4 sentences. Dense. No filler.`;
