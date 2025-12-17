export interface UserProfile {
    id: number;
    username: string;
    email?: string;
    traits: Record<string, any>; // Aggregated personality logic
}

export interface AiAgentContext {
    user: UserProfile;
    history: string[]; // Previous guidance
    answers: { question: string, answer: string }[]; // Raw QA pairs for context
}

export interface GuidanceResponse {
    content: string;
    metadata?: Record<string, any>;
}
