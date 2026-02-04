import { z } from 'zod';

export type UserStatus = 'ephemeral' | 'registeredOnly' | 'premium';

export const UserSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email().nullable(),
    playtest_cookie: z.string(),
    status: z.enum(['ephemeral', 'registeredOnly', 'premium']),
    created_at: z.number(),
    last_interacted_at: z.number(),
});

export type User = z.infer<typeof UserSchema>;

export const AssessmentAnswerSchema = z.object({
    questionId: z.string(),
    answerIndex: z.string().regex(/^\d+$/).transform(v => parseInt(v, 10)),
});

export const RegisterSchema = z.object({
    email: z.string().email(),
});

export const PersonalityTraitSchema = z.object({
    id: z.string(),
    name: z.string(),
    score: z.number().min(0).max(1),
    label: z.string(),
});

export type PersonalityTrait = z.infer<typeof PersonalityTraitSchema>;

export const PersonalityProfileSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    updated_at: z.number(),
    traits: z.record(z.string(), PersonalityTraitSchema),
});

export type PersonalityProfile = z.infer<typeof PersonalityProfileSchema>;

export interface Choice {
    id: string;
    text: string;
    modifier_weight: number;
}

export const QuestionSchema = z.object({
    id: z.string(),
    text: z.string(),
    category: z.string(),
    options: z.array(z.string()),
});

export type Question = z.infer<typeof QuestionSchema>;

export const GuidanceSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    text: z.string(),
    input_data: z.string(), // JSON string
    created_at: z.number(),
});

export type Guidance = z.infer<typeof GuidanceSchema>;
