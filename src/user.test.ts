import { expect, test, describe } from "bun:test";
import { applyImpulse, updateProfile, createNeutralProfile, buildNewUser, shiftLastGeneratedForAdvance } from "./user";
import { PersonalityProfile } from "./types";
import { CONFIG } from "./config";

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

describe("User Factory (buildNewUser)", () => {
    test("applies DEFAULT_NEW_USER_TAGS to a fresh user", () => {
        const user = buildNewUser({ email: null });
        expect(user.tags).toEqual([...CONFIG.DEFAULT_NEW_USER_TAGS]);
    });

    test("assigns 'ephemeral' status when email is null", () => {
        const user = buildNewUser({ email: null });
        expect(user.status).toBe("ephemeral");
        expect(user.email).toBeNull();
    });

    test("assigns 'registeredOnly' status when email is provided", () => {
        const user = buildNewUser({ email: "newbie@example.com" });
        expect(user.status).toBe("registeredOnly");
        expect(user.email).toBe("newbie@example.com");
    });

    test("returns a mutation-safe copy of DEFAULT_NEW_USER_TAGS", () => {
        const user = buildNewUser({ email: null });
        user.tags.push("mutated");
        expect(CONFIG.DEFAULT_NEW_USER_TAGS).not.toContain("mutated");
    });
});

describe("Advance Time (shiftLastGeneratedForAdvance)", () => {
    test("shifts timestamp backward by deltaMs", () => {
        const now = 1_000_000_000_000;
        const delta = 24 * 60 * 60 * 1000;
        expect(shiftLastGeneratedForAdvance(now, delta)).toBe(now - delta);
    });

    test("is a pure function (does not mutate inputs)", () => {
        const now = 2_000_000_000_000;
        const delta = 42;
        shiftLastGeneratedForAdvance(now, delta);
        expect(now).toBe(2_000_000_000_000);
        expect(delta).toBe(42);
    });
});
