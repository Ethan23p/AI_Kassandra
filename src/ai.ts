import { GoogleGenAI } from "@google/genai";
import { PersonalityProfile } from "./types";
import { PROMPTS as prompts } from "./data/prompts";
import { logger } from "./logger";


/**
 * Transforms a personality profile into a natural language description.
 */
function describePersonality(profile: PersonalityProfile): string {
    const traitDescriptions = Object.values(profile.traits).map(t => {
        const intensity = Math.abs(t.score);
        const direction = t.score >= 0 ? "high" : "low";
        let level = "moderate";
        if (intensity > 0.7) level = "very " + direction;
        else if (intensity > 0.3) level = direction;

        return `${t.name} is ${level}`;
    });

    return traitDescriptions.join(", ") + ".";
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
    const personalityDescription = describePersonality(profile);
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
