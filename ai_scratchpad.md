# AI Kassandra — TODO Tracker

> Tasks pulled verbatim from the design doc at [[projects/AI_Kassandra]] in Logseq.
> Analysis and context folded in from prior scratchpad sessions where relevant.

---

## From Prototype to Playtest

### Content Generation Utility for Ethan

> DONE 1.0 - Scrappy utility at a dev-limited path `/dev/workshop` which allows Ethan to quickly iterate through prompts to generate scenarios + dialogue choices and to iterate on prompts for the persona that generates guidances.

---

TODO 1.1 - Total overhaul toward, "transparent by design" is necessary, our first pass didn't prioritize this.

---

### Securing the Foundation

TODO Systematic Review: We should return to this, our first attempt was a bit too gentle. Ideally, Claude will put together a systematized plan to make sure all code is reviewed and has logging implemented.

---

TODO Systematic Review: Claude should comb through the code for any potential configuration options.

---

TODO Systematic Review: I think we got most of this, but a review would be good. *(re: copy text centralization in `copy.ts`)*

---

### Transition from Mocks to Logic

TODO Playtest feature: implement a new button which allows playtesters to simulate the passing of 24 hours, thus making a new guidance available *as if* they had organically come back after 24 hours.
- integrated smoothly, configurable (consult with Ethan on best options, perhaps a floating button?)
- this feature replaces an earlier specified (not sure if implemented) feature which allowed playtesters to "regenerate guidances"

> **Analysis:** A `/api/debug/advance-time` POST route (gated behind a playtester check) that sets `user.last_generated_at` to `Date.now() - CONFIG.USER_GENERATION_COOLDOWN_MS - 1`, effectively clearing the cooldown.
> **Open questions:** Floating overlay or integrated into dashboard? Auto-generate or just unlock?

---

TODO general feature: we should support the capacity to tag users with playtester, alpha, perhaps other tags such that we can configure the user experience per-user.

> **Analysis:** Add a `tags` TEXT column to the users table (JSON array of strings). Add helpers to check tags. Gate playtest-only features behind a `playtester` tag.
> **Open question:** How do users get tagged? Manually in the DB? A secret URL? Automatically for all users during playtest phase?

---

TODO Validate *(re: assessment, personality snapshot, guidance logic)*

---

TODO Validate, assess need *(re: cooldowns)*

---

### Establish the AI Pipeline

TODO Validate: Should more of a "helper" design pattern be implemented? The system should be minimally capable of having the AI model / provider swapped out.

> **Analysis:** `ai.ts` directly instantiates `GoogleGenAI`. It's ~72 lines. Swapping providers later is a find-and-replace, not an architecture change. Recommend: skip for playtest, revisit at alpha.

---

### Build the Transparency/Inspection View

TODO Validate: Review with Ethan what the meaningful data is which can be provided for playtesters. Let Ethan know if any particular data is exceptionally effortful to make available to playtesters, otherwise provide all of it.

> **Currently exposed on `/profile`:** identity info, personality traits (radar chart), guidance history, detailed interaction log (question/choice/impulses per answer).
> **Candidate additions:** exact prompt + system instruction sent to Gemini per guidance; trait score progression over time (graph); raw Gemini response metadata (token count, model version).

---

### Transition from Internal Server to External Server

> DONE Ethan has set up a tunnel through Cloudflared for multiple playtests.

TODO Setup a persistently hosted instance at a subsite of `EthanPorter.xyz`
*(Claude: To the best of my knowledge this is an Ethan only task, so no need to worry about it.)*

---

### Milestones

TODO Validate: Hypothetical new user can go through onboarding:
- take an actual assessment
- register using an email
- get a guidance (standard: somewhat meaningful is sufficient)
- view their profile, including all individual user data as well as the questions, responses, & guidances as well as their corresponding weights & inputs.
  - In the playtest, we'll expose all of this information to the play-tester so that they can assess if the system is doing anything meaningful as opposed to generic.

---

TODO Validate: Hypothetical existing user can bypass the landing page with a "returning user" input field:
- If app does not recognize user, they can put their email in a "returning user" input field to be sent to the dashboard view

> **Analysis:** Test that an existing user who enters their email on the landing page actually gets routed to `/dashboard` with their full profile and guidance history intact. The `createSession` function in `auth.ts` may or may not handle this correctly — needs verification.

---

TODO Validate: Hypothetical existing user can access a button for 'advance 24 hours' which simulates time passing (initializing a new guidance generation)

---

## Alpha

TODO prepare codebase for genuine partitioning of users

---

TODO enable registration with 'magic-link'

---

TODO also ensure there's a more manual process Ethan can engage in, for the outliers, whatever they may be.

---

TODO Ethan sets up an LLC for his AI products. *(Claude: I think this is also an Ethan only task, no need to worry about it.)*

---

TODO Ethan opens a business bank account. *(Claude: don't worry about it, Ethan task)*

---

TODO Establish a workflow for dev and user interaction through email, like a mailing list (I suppose)

---

TODO Establish a workflow for automated, programmatic email dispatch
- like cron
