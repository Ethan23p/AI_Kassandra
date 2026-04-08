import { GoogleGenAI } from "@google/genai";
import { logger } from "../logger";
type QuestionEntry = { text: string; tags: string[]; choices: Record<string, any> };

function getQuestionsData(): Record<string, QuestionEntry> {
    delete require.cache[require.resolve('../data/questions')];
    return require('../data/questions').questionsData;
}
import { QUESTION_GENERATION_SPEC, GUIDANCE_SPEC, convertExpressionsToImpulses, type TraitName } from "./content-spec";

const MODEL = "gemini-flash-latest";

function getClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        logger.warn("GEMINI_API_KEY is missing.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
}

// ─── Question Generation ────────────────────────────────────────

/**
 * Build the prompt for question generation, including anti-repetition context.
 */
export function buildQuestionPrompt(trait1: TraitName, trait2: TraitName, seedPrompt?: string): { systemInstruction: string; userPrompt: string } {
    // Find existing questions for this trait pair
    const existingForPair = Object.entries(getQuestionsData())
        .filter(([_, q]) => q.tags.includes(trait1) && q.tags.includes(trait2))
        .map(([slug, q]) => `- "${slug}": ${q.text}`);

    let userPrompt = `Generate ONE assessment question targeting the trait pair: ${trait1} and ${trait2}.`;

    if (seedPrompt) {
        userPrompt += `\n\nCreative direction: ${seedPrompt}`;
    }

    if (existingForPair.length > 0) {
        userPrompt += `\n\nThe following questions ALREADY EXIST for this trait pair. Generate something ORIGINAL — different scenario, different setting, different objects:\n${existingForPair.join('\n')}`;
    }

    return {
        systemInstruction: QUESTION_GENERATION_SPEC,
        userPrompt,
    };
}

/**
 * Call Gemini to generate a question, returning parsed JSON.
 */
export async function generateQuestion(trait1: TraitName, trait2: TraitName, seedPrompt?: string): Promise<{ slug: string; text: string; tags: string[]; choices: Record<string, any> }> {
    const { systemInstruction, userPrompt } = buildQuestionPrompt(trait1, trait2, seedPrompt);
    return generateQuestionFromPrompt(systemInstruction, userPrompt);
}

/**
 * Call Gemini with raw prompt strings (system instruction + user prompt) and parse the question JSON.
 * Used both by generateQuestion() and the compose-then-generate flow.
 */
export async function generateQuestionFromPrompt(systemInstruction: string, userPrompt: string): Promise<{ slug: string; text: string; tags: string[]; choices: Record<string, any> }> {
    const client = getClient();
    if (!client) throw new Error("GEMINI_API_KEY is not set.");

    const response = await client.models.generateContent({
        model: MODEL,
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        config: { systemInstruction },
    });

    const raw = response.text || '';
    logger.debug(`[Workshop] Question generation raw response: ${raw.substring(0, 200)}...`);

    // Strip markdown code fences if present
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
        const parsed = JSON.parse(cleaned);

        // If Gemini returned "expressions" format, convert to "impulses" for the app
        const firstChoice = Object.values(parsed.choices || {})[0] as any;
        if (firstChoice?.expressions && !firstChoice?.impulses) {
            return convertExpressionsToImpulses(parsed);
        }

        return parsed;
    } catch (e) {
        logger.error("[Workshop] Failed to parse question JSON:", e);
        throw new Error(`Gemini returned invalid JSON. Raw response:\n${raw}`);
    }
}

// ─── Guidance Generation ────────────────────────────────────────

/**
 * Build the prompt for guidance generation.
 */
export function buildGuidancePrompt(
    systemInstruction: string,
    promptTemplate: string,
    traitValues: Record<string, number>,
    persistentHistory: string[] = [],
): { systemInstruction: string; userPrompt: string } {
    const personalityDescription = JSON.stringify(traitValues, null, 2);
    let userPrompt = promptTemplate.replace('{personality_description}', personalityDescription);

    if (persistentHistory.length > 0) {
        userPrompt += `\n\nPREVIOUS GUIDANCES (generate something ENTIRELY ORIGINAL and different from these):\n${persistentHistory.map(g => `- "${g}"`).join('\n')}`;
    }

    return { systemInstruction, userPrompt };
}

/**
 * Call Gemini to generate one or more guidances.
 */
export async function generateGuidances(
    systemInstruction: string,
    promptTemplate: string,
    traitValues: Record<string, number>,
    count: number = 1,
    persistentHistory: string[] = [],
): Promise<string[]> {
    const client = getClient();
    if (!client) throw new Error("GEMINI_API_KEY is not set.");

    const results: string[] = [];

    // Generate sequentially so each can feed into the next for persistent mode
    for (let i = 0; i < count; i++) {
        const currentHistory = [...persistentHistory, ...results];
        const { systemInstruction: sysInst, userPrompt } = buildGuidancePrompt(
            systemInstruction, promptTemplate, traitValues, currentHistory,
        );

        const response = await client.models.generateContent({
            model: MODEL,
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            config: { systemInstruction: sysInst },
        });

        const text = response.text?.trim() || 'The stars are silent today.';
        results.push(text);

        logger.debug(`[Workshop] Guidance ${i + 1}/${count} generated: ${text.substring(0, 80)}...`);
    }

    return results;
}
