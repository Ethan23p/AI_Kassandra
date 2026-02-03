export type UserStatus = 'ephemeral' | 'registeredOnly' | 'premium';

export interface User {
    id: string; // UUID
    email: string | null;
    playtest_cookie: string;
    status: UserStatus;
    created_at: number;
    last_interacted_at: number;
}

export interface PersonalityTrait {
    id: string;
    name: string;
    score: number; // 0.0 to 1.0
    label: string;
}

export interface PersonalityProfile {
    id: string;
    user_id: string;
    updated_at: number;
    traits: Record<string, PersonalityTrait>; // trait_id -> trait
}

export interface Choice {
    id: string;
    text: string;
    modifier_weight: number;
}

export interface Question {
    id: string;
    text: string;
    category: string;
    options: string[]; // For simplicity in mock
}

export interface Guidance {
    id: string;
    user_id: string;
    text: string;
    input_data: string; // JSON string of what was sent to AI
    created_at: number;
}
