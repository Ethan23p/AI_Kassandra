import { AiAgentContext, UserProfile } from './types';
import * as db from '../models';

export async function buildContext(userId: number): Promise<AiAgentContext> {
    const user = db.getUser(userId);
    if (!user) throw new Error("User not found");

    const answers = db.getAnswers(userId);

    // Simple aggregation logic for now
    // In a real app, this would calculate OCEAN scores etc.
    const userProfile: UserProfile = {
        id: user.id,
        username: user.username,
        email: user.email,
        traits: {
            // Mock trait logic:
            data_points: answers.length
        }
    };

    // Build history (last 5 guidances)
    // We haven't implemented getGuidanceHistory yet in models, assuming it's just latest for now or empty
    const history: string[] = [];
    const latest = db.getLatestGuidance(userId);
    if (latest) history.push(latest.content);

    return {
        user: userProfile,
        history: history,
        answers: answers.map(a => ({ question: a.question_text, answer: a.value }))
    };
}
