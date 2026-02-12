import { z } from 'zod';

export type UserStatus = 'ephemeral' | 'registeredOnly' | 'premium';

export const UserSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email().nullable(),
    playtest_cookie: z.string(),
    status: z.enum(['ephemeral', 'registeredOnly', 'premium']),
    created_at: z.number(),
    last_interacted_at: z.number(),
    last_generated_at: z.number().nullable().optional(),
});

export type User = z.infer<typeof UserSchema>;

export const AssessmentAnswerSchema = z.object({
    questionId: z.string(),
    answerKey: z.string(),
    remainingIds: z.string().optional(),
});

export const RegisterSchema = z.object({
    email: z.string().email(),
});

export const PersonalityTraitSchema = z.object({
    id: z.string(),
    name: z.string(),
    score: z.number().min(-1).max(1),
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

export const ChoiceSchema = z.object({
    text: z.string(),
    impulses: z.record(z.string(), z.number()),
});

export type Choice = z.infer<typeof ChoiceSchema>;

export const QuestionSchema = z.object({
    text: z.string(),
    tags: z.array(z.string()),
    choices: z.record(z.string(), ChoiceSchema),
});

export type Question = z.infer<typeof QuestionSchema>;

export type QuestionMap = Record<string, Question>;

export const GuidanceSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    text: z.string(),
    input_data: z.string(), // JSON string
    created_at: z.number(),
});

export type Guidance = z.infer<typeof GuidanceSchema>;

export const UserInteractionSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    question_id: z.string(),
    choice_id: z.string(),
    impulses: z.record(z.string(), z.number()), // Snapshot of applied impulses
    created_at: z.number(),
});

export type UserInteraction = z.infer<typeof UserInteractionSchema>;
