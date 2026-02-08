import { expect, test, describe } from "bun:test";
import { applyImpulse, updateProfile, createNeutralProfile } from "./user";
import { PersonalityProfile } from "./types";

describe("Personality Logic", () => {
    describe("Remaining Room Algorithm (applyImpulse)", () => {
        test("Positive impulse increases score but never hits 1.0", () => {
            let score = 0;
            for (let i = 0; i < 100; i++) {
                score = applyImpulse(score, 1.0, 0.1);
                expect(score).toBeLessThan(1.0);
            }
            expect(score).toBeGreaterThan(0.9);
        });

        test("Negative impulse decreases score but never hits -1.0", () => {
            let score = 0;
            for (let i = 0; i < 100; i++) {
                score = applyImpulse(score, -1.0, 0.1);
                expect(score).toBeGreaterThan(-1.0);
            }
            expect(score).toBeLessThan(-0.9);
        });

        test("Impulse of 0 does not change score", () => {
            expect(applyImpulse(0.5, 0)).toBe(0.5);
        });

        test("Sensitivity scales the force", () => {
            const highSens = applyImpulse(0, 1.0, 0.5);
            const lowSens = applyImpulse(0, 1.0, 0.1);
            expect(highSens).toBeGreaterThan(lowSens);
        });
    });

    describe("Profile Management", () => {
        test("updateProfile updates multiple traits", () => {
            const initialProfile = createNeutralProfile("user-1");
            const impulses = {
                "openness": 1.0,
                "conscientiousness": -0.5
            };

            const updatedProfile = updateProfile(initialProfile, impulses);

            expect(updatedProfile.traits["openness"].score).toBeGreaterThan(0);
            expect(updatedProfile.traits["conscientiousness"].score).toBeLessThan(0);
            expect(updatedProfile.traits["extraversion"].score).toBe(0);
        });

        test("updateProfile creates trait if not present", () => {
            const initialProfile = createNeutralProfile("user-1");
            delete initialProfile.traits["openness"];

            const impulses = { "openness": 0.5 };
            const updatedProfile = updateProfile(initialProfile, impulses);

            expect(updatedProfile.traits["openness"]).toBeDefined();
            expect(updatedProfile.traits["openness"].score).toBeGreaterThan(0);
        });
    });
});
