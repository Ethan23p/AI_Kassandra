# AI Kassandra — Sprint Tracker

---

## For Agents

**Canonical design doc:** Logseq page `[[projects/AI_Kassandra]]` — pull it via the Logseq MCP tools (`mcp__mcp-logseq__get_page_content`, page name: `projects/AI_Kassandra`) before starting any sprint task.

The design doc contains: full product vision, UX flow, MVC definitions, monetization model, personality system details, guidance philosophy, and the full workshop spec. CLAUDE.md covers architecture and runtime rules. Between the two, you should have everything you need — consult Ethan for anything that isn't covered.

---

## Phase: Prototype → Playtest

> Playtest audience: Ethan, girlfriend, a few close friends.
> Max-trust context — minimal polish, focus on play factors.
> Alpha stage will tighten abuse protection and "magic" feel.

---

## Sprint: Workshop — Content Generation Utility

Dev-only path: `/dev/workshop` — lets Ethan rapidly iterate on scenario prompts, dialogue choices, and guidance persona prompts.

> **Spec ref:** Full workshop spec lives in Logseq under `### Content Generation Utility for Ethan`. Key sections: "scenarios + dialogue choices", "guidances", "additional features/notes".

| # | Status | Task |
|---|--------|------|
| 1.0 | DONE | Scrappy utility at `/dev/workshop` for iterating prompts (scenarios + dialogue choices + guidance persona) |
| 1.1 | DONE | Full overhaul toward "transparent by design"; added "Randomize Traits" button to both workflows |
| 1.2 | IN PROGRESS | Bug fixes from redesign (see below) |

### 1.2 Open Items

- [ ] **Save function rework** — Both flows lack a working "Save" because the selector is a dropdown. Rework so a prompt/persona can actually be persisted.
  - *Spec:* Guidances flow should have load (dropdown → populate fields) and save (store with custom name) for personas in `prompts.ts`. Assessment flow should similarly persist the generative prompt.
- [ ] **Live JSON derivation** — Guidance generation section should show live-derived JSON (or at minimum the text content) as the user edits. Bonus: also implement for assessment generation.
  - *Spec:* "live preview of the exact contents that will be passed to the generation API — should robustly source the contents from *after* all transformations and additions are made, ideally in collaboration with the AI module"
- [ ] **"Previously Generated Entries" field + persistent-user toggle** — These two are coupled: the "Previously Generated Entries (optional)" field is populated by the persistent-user toggle. Verify the field exists and that the toggle correctly accumulates prior session outputs into it (on) or clears/ignores it (off).
  - *Spec:* "persistent user: on — each generated guidance gets included in the prompt for the following guidances (just in the current session)"; "persistent user: off — each generation is a fresh guidance"

---

## Sprint: Playtest-Specific Features

- [ ] **Time-skip button** — New button that simulates 24 hours passing, making a new guidance available as if the user returned organically the next day. Should be smoothly integrated and configurable. *Replaces* any earlier "regenerate guidances" feature.
- [ ] **User tagging system** — Support tagging users (`playtester`, `alpha`, etc.) to enable per-user experience configuration.

---

## Sprint: Testing — Systematic Audit & Implementation

### Phase 1: Audit Prep

- [ ] **Create function outline** — Comprehensive list of every function in the codebase in this file, with checkboxes, in two identical copies titled:
  - "Centralized Copy & Extensive Configuration"
  - "Comprehensive Observability"

### Phase 2: Centralized Copy & Extensive Configuration

*For each function in the outline above:*

- [ ] Identify all user-facing text → centralize to `src/data/copy.ts`
- [ ] Identify all values that should be configurable → expose in `src/config.ts`

### Phase 3: Comprehensive Observability

*For each function in the outline above:*

- [ ] Identify every point resources are allocated → ensure appropriate cooldowns & limits; surprising usage should be logically incompatible with correct operation
- [ ] Identify every interaction/operation → add associated logging (`debug` = comprehensive, `routine` = routed to central log)

### Phase 4: Logic & Correctness Testing

- [ ] Exhaustively identify and record all instances of:
  - Important logic
  - Information flows
  - Boundary violations
  - "Tell-don't-ask" violations
- [ ] Define 15–25 tests covering important logic & information flows (boundaries, constraints, correctness, procedure)
- [ ] Resolve each recorded violation

---

## Sprint: Persistent Web Domain

| # | Status | Task |
|---|--------|------|
| 1 | DONE | Set up Cloudflare tunnel for external access |
| 2 | DONE | Tunnel live and tested across multiple playtests |
