import { expect, test, describe, beforeEach } from "bun:test";
import db, { saveUser, getUserAt, getUserByEmail } from "./db";
import { User } from "./types";
import { v4 as uuidv4 } from "uuid";

function makeUser(overrides: Partial<User> = {}): User {
    const now = Date.now();
    return {
        id: uuidv4(),
        email: null,
        playtest_cookie: uuidv4(),
        status: "ephemeral",
        created_at: now,
        last_interacted_at: now,
        last_generated_at: null,
        tags: [],
        ...overrides,
    } as User;
}

describe("User tags — DB persistence", () => {
    beforeEach(() => {
        db.run("DELETE FROM users");
    });

    test("tags array roundtrips through saveUser → getUserAt", () => {
        const user = makeUser({ tags: ["playtester", "alpha"] });
        saveUser(user);

        const fetched = getUserAt(user.playtest_cookie);
        expect(fetched).not.toBeNull();
        expect(fetched!.tags).toEqual(["playtester", "alpha"]);
    });

    test("tags array roundtrips through getUserByEmail", () => {
        const user = makeUser({ email: "tagtest@example.com", tags: ["custom"] });
        saveUser(user);

        const fetched = getUserByEmail("tagtest@example.com");
        expect(fetched).not.toBeNull();
        expect(fetched!.tags).toEqual(["custom"]);
    });

    test("user row with NULL tags column (pre-migration) reads as empty array", () => {
        const id = uuidv4();
        const cookie = uuidv4();
        const now = Date.now();
        // Simulate an old row where the tags column exists but is NULL
        db.run(
            `INSERT INTO users (id, email, playtest_cookie, status, created_at, last_interacted_at, last_generated_at, tags)
             VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
            [id, null, cookie, "ephemeral", now, now, null]
        );

        const fetched = getUserAt(cookie);
        expect(fetched).not.toBeNull();
        expect(fetched!.tags).toEqual([]);
    });

    test("empty tags array roundtrips without collapsing to null", () => {
        const user = makeUser({ tags: [] });
        saveUser(user);

        const fetched = getUserAt(user.playtest_cookie);
        expect(fetched!.tags).toEqual([]);
    });
});
