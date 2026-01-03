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

### Phase 2-4 (again)

### 1. Database Implementation
**Goal:** Translate the "Fundamental Primitives" from your design doc into a live SQLite database.

*   **Initialize Connection (`src/db.ts`)**
    *   Import `Database` from `bun:sqlite`.
    *   Initialize the database file (e.g., `guidances.sqlite`).
*   **Define Schema Queries**
    *   Write raw SQL `CREATE TABLE IF NOT EXISTS` statements for:
        *   `users`: (id, email, status, created_at)
        *   `questions`: (id, category, text)
        *   `choices`: (id, question_id, text, metadata)
        *   `answers`: (user_id, question_id, choice_id, answered_at)
        *   `guidances`: (id, user_id, text, generated_at, is_daily)
*   **Execute Migration**
    *   Create a function (e.g., `initDB()`) that runs these queries transactionally.
    *   Call this function once on server startup in `src/index.tsx`.

### 2. Seeding
**Goal:** Populate the database with enough dummy data to make "The Loop" playable without manual entry.

*   **Create Seed Data**
    *   Define an array of ~3-5 Question objects (e.g., "How do you handle chaos?") with their associated Choices (e.g., "I embrace it", "I organize it").
*   **Write Seed Function**
    *   Create a script or function (e.g., in `src/db.ts` or a standalone `scripts/seed.ts`) that:
        1.  Checks if questions already exist.
        2.  If empty, performs `INSERT` statements for the questions and choices.
        3.  Creates one "Guest User" with a fixed ID to use for testing.
*   **Run Seed**
    *   Execute the script manually or hook it into the server startup temporarily.

### 3. The Loop (Assessment Flow)
**Goal:** Create the HTTP/HTMX interaction cycle: *Identify User -> Fetch Question -> Render -> Submit Answer -> Repeat.*

*   **User Identification (Temporary)**
    *   In `src/index.tsx`, create middleware that checks for a cookie.
    *   If no cookie exists, generate a UUID, set the cookie, and create a corresponding row in the `users` table.
*   **The "Next Question" Logic (`GET /assessment`)**
    *   Write a SQL query that finds questions *not* present in the `answers` table for the current user.
    *   If a question is found: Render the **Question UI** (Text + Buttons for choices).
    *   If no questions remain: Render the **Guidance/Waitlist UI** (Placeholder text for now).
*   **The "Submit Answer" Endpoint (`POST /assessment/:questionId`)**
    *   Create a route to handle the choice selection.
    *   **Write:** Insert the selected `choiceId` into the `answers` table for that user.
    *   **Redirect/Swap:** Return the HTML for the *next* step (by internally calling the logic from the "Next Question" step) to swap the UI via HTMX.
*   **UI Integration**
    *   Update `src/ui.tsx` to generate the HTML for the Question Card.
    *   Ensure the Choice buttons use `hx-post` to send data to the backend and `hx-swap="outerHTML"` to replace the card.