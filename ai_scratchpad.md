# ai_scratchpad.md - This file is for more complex communication between the assistant and myself(Ethan).

Here is the operational plan for **Seeding** and **The Loop**:

### Phase 3: Seeding (Data Injection)

1.  **Create Seed Data Structure**
    *   In a new file (e.g., `seed.ts` or within `db.ts`), define a constant array containing ~5 distinct questions.
    *   Each question object should include its category, text, and a nested array of 2–4 choices (text + metadata).
    *   *Content Tip:* Align these with the "personality" category from your design doc (e.g., "How do you handle chaos?").

2.  **Implement Insert Logic**
    *   Write a `seedDatabase()` function.
    *   Use a **Transaction** (atomic operation) to ensure data integrity.
    *   Iterate through the array:
        *   Insert the **Question**, retrieve the returned `id`.
        *   Use that `question_id` to insert the corresponding **Choices**.

3.  **Execute Seed**
    *   Run this function once manually (or add a check in your server startup: `if (count(questions) == 0) seedDatabase()`).
    *   Verify by querying the SQLite file (using a generic SQL viewer or `console.log`) to ensure relations are linked correctly.

---

### Phase 4: The Loop (Core Application Flow)

1.  **Implement Mock Authentication (Middleware)**
    *   Create a Hono middleware function in `auth.ts`.
    *   **Logic:** Check the request header for a specific Cookie (e.g., `user_session`).
    *   **If missing:** Generate a UUID, create a generic "Anonymous" row in the `users` table, and set the `Set-Cookie` header on the response.
    *   **If present:** Attach the `userId` to the request context so downstream routes know who is asking.

2.  **Logic: "Get Next Question"**
    *   Create a helper function in `db.ts`: `findNextQuestionForUser(userId)`.
    *   **Query Logic:** Select the first Question ID from `questions` that does *not* exist in the `answers` table for this `userId`.
    *   Return `null` if all questions are answered (triggers the "Guidance" phase).

3.  **UI: The Assessment Component (`ui.tsx`)**
    *   Create a JSX component that accepts a `Question` object and `Choice[]`.
    *   Render the Question text.
    *   Render Buttons for choices.
    *   **HTMX Wiring:** The buttons should send a `POST` request to `/assess` when clicked and swap the inner HTML of the container.

4.  **Route: Display Assessment (`GET /assess`)**
    *   Call `findNextQuestionForUser`.
    *   If a question exists, render the Assessment Component.
    *   If `null` (finished), render a "Generating Insight..." placeholder (or the Guidance view).

5.  **Route: Handle Answer (`POST /assess`)**
    *   Parse form data (`questionId`, `choiceId`).
    *   Insert the record into the `answers` table.
    *   **The HTMX Trick:** Immediately call the logic for `GET /assess` (Step 4) and return the *new* HTML (the next question) in the response. This creates the "flash card" feel without a page reload.

6.  **Route: The Guidance (End State)**
    *   When `findNextQuestionForUser` returns `null`:
        *   Check `guidances` table: Does a daily guidance already exist for today?
        *   **If no:** Call your Mock AI function (returns random text), save to DB.
        *   **If yes:** Retrieve it.
    *   Render the "Guidance" component (The text + the "Subscribe" upsell).