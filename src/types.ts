export type UserStatus = 'anonymous' | 'registered' | 'premium';

export type User = {
    readonly id: string;         // Unique UUID or Email
    email: string;
    status: UserStatus;
    createdAt: Date;
    lastGuidanceAt?: Date;      // Used to calculate the "once every X hours" logic
};

export type QuestionCategory = 'personality' | 'socio-economic' | 'political' | 'general';

export type Question = {
    readonly id: number;
    category: QuestionCategory;
    text: string;               // e.g., "How do you handle chaos?"
};

export type Choice = {
    readonly id: number;
    questionId: number;
    text: string;               // e.g., "I embrace it"
    metadata?: string;          // Metadata for the AI (e.g., "high_openness")
};

export type Answer = {
    readonly userId: string;
    readonly questionId: number;
    readonly choiceId: number;
    answeredAt: Date;
};

export type Guidance = {
    readonly id: number;
    readonly userId: string;
    text: string;               // The "carefully crafted reflection"
    generatedAt: Date;
    isDaily: boolean;           // Distinguishes the "First hit" from the "Subscription" guidance
};

export type UserProfileSummary = {
    email: string;
    traits: {
        ocean: { [key: string]: number }; // e.g., { openness: 0.8, neuroticism: 0.2 }
        socioEcon: string[];
        political: string[];
    };
    recentGuidance: string[];           // Last 3-5 items to avoid repetition
};
