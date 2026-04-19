import { GoogleGenAI } from "@google/genai";
import { PersonalityProfile } from "./types";
import { PROMPTS } from "./data/prompts";
import { CONFIG } from "./config";
import { logger } from "./logger";

function getPersona() {
    const key = CONFIG.ACTIVE_PERSONA;
    const persona = (PROMPTS as Record<string, any>)[key];
    if (!persona) {
        logger.warn(`Persona "${key}" not found, falling back to "kassandra".`);
        return PROMPTS.kassandra;
    }
    return persona;
}


/**
 * Generates a guidance using Gemini Flash via the @google/genai SDK.
 */
export async function generateAIGuidance(profile: PersonalityProfile): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        logger.warn("GEMINI_API_KEY is missing. Using fallback guidance.");
        return "The stars are silent today. Reflect on the space between your thoughts.";
    }

    const client = new GoogleGenAI({ apiKey });

    // Raw Feed: Send exact trait scores to leverage AI's native understanding
    const traitScores = Object.values(profile.traits).reduce((acc, t) => {
        acc[t.name] = parseFloat(t.score.toFixed(2));
        return acc;
    }, {} as Record<string, number>);

    const personalityDescription = JSON.stringify(traitScores, null, 2);
    const persona = getPersona();
    const prompt = persona.prompt_template.replace("{personality_description}", personalityDescription);

    try {
        const response = await client.models.generateContent({
            model: "gemini-flash-latest",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                systemInstruction: persona.system_instruction
            }
        });

        return response.text || "The stars are silent today. Reflect on the space between your thoughts.";
    } catch (error) {
        logger.error("AI Guidance Generation Failed:", error);
        return "The stars are silent today. Reflect on the space between your thoughts.";
    }
}