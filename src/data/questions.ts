import { QuestionMap } from '../types';

export const questionsData: QuestionMap = {
    "manor-inheritance": {
        text: "You unexpectedly inherit a sprawling, slightly dilapidated Victorian manor filled to the brim with dust, antique clutter, and rumors of secret passages behind the bookcases. You step into the chaotic foyer for the first time; what is your immediate plan of action?",
        tags: [
            "conscientiousness",
            "openness"
        ],
        choices: {
            "catalog-efficiency": {
                text: "I immediately hire a professional cleaning crew and an appraiser to catalogue every single item, creating a detailed spreadsheet to maximize the efficiency of the estate sale.",
                impulses: {
                    conscientiousness: 0.8,
                    openness: -0.4
                }
            },
            "investigate-secrets": {
                text: "I grab a flashlight and ignore the mess entirely, spending the first night hunting for those secret passages and imagining what kind of bizarre artist retreat I could turn this into.",
                impulses: {
                    conscientiousness: -0.4,
                    openness: 0.8
                }
            },
            "restore-preserve": {
                text: "I draft a meticulous renovation plan to restore the architecture while preserving the eccentricities, aiming to convert the manor into a structured, curated museum of curiosities.",
                impulses: {
                    conscientiousness: 0.5,
                    openness: 0.5
                }
            },
            "sell-immediate": {
                text: "I am overwhelmed by the chaos and the creepiness; I call a realtor immediately to sell the property \"as-is\" so I don't have to deal with the headache or the unknown.",
                impulses: {
                    conscientiousness: -0.2,
                    openness: -0.8
                }
            },
            "party-now": {
                text: "I invite all my friends over for an impromptu \"Haunted House\" party amidst the clutter; we can worry about the cleaning and the serious decisions later.",
                impulses: {
                    conscientiousness: -0.6,
                    openness: 0.4
                }
            }
        }
    }
};
