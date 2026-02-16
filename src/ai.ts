import { GoogleGenAI } from "@google/genai";
import { PersonalityProfile } from "./types";
import { PROMPTS as prompts } from "./data/prompts";
import { logger } from "./logger";


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
    const prompt = prompts.kassandra.prompt_template.replace("{personality_description}", personalityDescription);

    try {
        const response = await client.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                systemInstruction: prompts.kassandra.system_instruction
            }
        });

        return response.text || "The stars are silent today. Reflect on the space between your thoughts.";
    } catch (error) {
        logger.error("AI Guidance Generation Failed:", error);
        return "The stars are silent today. Reflect on the space between your thoughts.";
    }
}

/**
 * Generates a raw response from the AI using a custom user prompt.
 * Keeps the system instruction to maintain persona.
 */
export async function generateRawResponse(userPrompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        logger.warn("GEMINI_API_KEY is missing. Using fallback.");
        return "System offline.";
    }

    const client = new GoogleGenAI({ apiKey });

    try {
        const response = await client.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            config: {
                systemInstruction: prompts.kassandra.system_instruction
            }
        });

        return response.text || "Empty response.";
    } catch (error) {
        logger.error("AI Raw Generation Failed:", error);
        return "Error generating response.";
    }
}
