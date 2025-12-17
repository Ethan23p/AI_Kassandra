import { AiAgentContext } from './types';

export async function generateGuidance(context: AiAgentContext): Promise<string> {
    // "Shallow" implementation
    // Just returns a string based on the count of answers for now

    const answerCount = context.answers.length;

    if (answerCount === 0) {
        return "The stars are silent. Speak to them (answer questions) to hear their voice.";
    }

    const templates = [
        "Your path is marked by potential. The data suggests you value structure.",
        "Chaos swirls around you, but your core remains steady. Trust your intuition.",
        "The patterns indicate a time for action. Do not hesitate.",
        "Reflection is your greatest tool right now. Look inward."
    ];

    // Pseudo-random selection based on user ID to be deterministic-ish
    const index = (context.user.id + answerCount) % templates.length;
    return templates[index];
}
