import { GoogleGenAI } from "@google/genai";
import { PersonalityProfile } from "./types";
import { PROMPTS as prompts } from "./data/prompts";


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
        console.warn("GEMINI_API_KEY is missing. Using fallback guidance.");
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
        console.error("AI Guidance Generation Failed:", error);
        return "The stars are silent today. Reflect on the space between your thoughts.";
    }
}
