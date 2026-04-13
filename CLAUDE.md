# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Reference

The canonical design document lives in Logseq at **[[projects/AI_Kassandra]]**. It contains the full product vision, user experience design, MVC definitions, monetization model, and development roadmap. Consult it (or ask Ethan) for product-level decisions. Access it via the Logseq MCP tools.

## Development Guiding Principles

- **Elegant**: Prefer clean, minimal solutions
- **Modular & flexible**: Clean interfaces between systems; external systems and developer content should support "plug and play" capacity
- **"Tell, don't ask"**: Prefer pushing data/events rather than polling for state
- **Interactivity**: Bias toward visual or design cues corresponding to code changes and app state
- **Production-Grade Rigor**: Strict type safety by default

> **Important**: The guidances (AI-generated insights) are treated as interactive art. Do not decide on guidance logic independently — consult Ethan for implementation decisions around what Kassandra says and how.

## Commands

```bash
bun run dev          # Start server with hot-reload (src/index.tsx on port 3000)
bun test             # Run all tests
bun test src/user.test.ts  # Run a single test file
bun install          # Install dependencies
```

Required env var: `GEMINI_API_KEY`. Optional: `DEBUG_MODE=true`, `LOG_FILE_PATH`, `NODE_ENV`.

## Runtime Rules

**Always use Bun**: No Node, no npm/yarn/pnpm, no ts-node, no Vite, no Express. Use `bun:sqlite` for SQLite, `Bun.file` for I/O, `Bun.$` for shell.

The server uses **Hono** (not `Bun.serve()`), with JSX rendered server-side via Hono's JSX runtime. The frontend uses **HTMX 2.0** — form submissions and partial page updates are driven by HTMX attributes, not a JS framework.

**AI SDK**: Use `@google/genai` (not `@google/generative-ai` or `@google-ai/generativelanguage`). Model string: `"gemini-flash-latest"`. Import pattern: `new GoogleGenAI({ apiKey })` → `client.models.generateContent({...})`. Note: `GEMINI.md` in the project root is a generic Bun reference doc and does not reflect this project's patterns.

**Zod v4**: This project uses Zod v4 (`^4.3.6`), not v3. Key differences: `z.input`/`z.output` replace `z.infer`, `.parse()` returns `{ success, data, error }` by default, and schema composition APIs differ. Check Zod v4 docs before assuming v3 patterns.

## Architecture

**AI Kassandra** is a personality-assessment web app. Users answer narrative scenario questions that map to Big 5 personality traits; after completing the assessment, Gemini Flash generates a short, cryptic "guidance" insight.

### Data Flow

1. User visits `/assessment` → questions shuffled, served one at a time via HTMX form posts
2. Each answer applies trait impulses to the user's `PersonalityProfile` via the **Remaining Room algorithm** (`src/user.ts:applyImpulse`)
3. On final answer → `generateAIGuidance()` in `src/ai.ts` calls Gemini with the raw trait scores
4. Result is saved as a `Guidance` record and shown on `/dashboard`

### Key Files

| File | Purpose |
|---|---|
| `src/index.tsx` | All Hono routes (SSR with JSX). The app entry point. |
| `src/ai.ts` | Gemini Flash integration (`generateAIGuidance`, `generateRawResponse`) |
| `src/db.ts` | SQLite via `bun:sqlite`; DB file is `guidances.sqlite` at project root |
| `src/auth.ts` | Cookie-based sessions (`kassandra_session` HTTP-only cookie) |
| `src/user.ts` | Personality math: `applyImpulse`, `updateProfile`, `createNeutralProfile` |
| `src/ui.tsx` | All JSX components (`Layout`, `AssessmentPage`, `DashboardPage`, etc.) |
| `src/types.ts` | All Zod schemas and TypeScript types — the single source of truth |
| `src/config.ts` | Runtime config: cooldowns, limits, sensitivity |
| `src/data/questions.ts` | Assessment question bank (Big 5 narrative scenarios with impulse maps) |
| `src/data/prompts.ts` | Kassandra's AI persona: `system_instruction` + `prompt_template` |
| `src/data/copy.ts` | All UI strings centralized here |
| `src/data/question-prompts.ts` | Prompt templates for assessment question generation |
| `src/logger.ts` | Singleton `logger` (INFO/WARN/ERROR/DEBUG); writes to console + `LOG_FILE_PATH`. DEBUG output gated by `CONFIG.DEBUG_MODE`. |
| `src/workshop/routes.tsx` | Dev-only `/dev/workshop` route — content generation UI for Ethan |
| `src/workshop/ui.tsx` | Workshop JSX components |
| `src/workshop/ai.ts` | Workshop Gemini calls (question + guidance generation) |
| `src/workshop/files.ts` | File I/O for persisting prompts/personas to `src/data/` |
| `src/workshop/content-spec.ts` | Zod schemas for workshop content types |

### Personality System

- Trait scores range `[-1, 1]` (Big 5: openness, conscientiousness, extraversion, agreeableness, neuroticism)
- **Remaining Room algorithm**: impulse moves score toward ±1 proportional to remaining distance, preventing overflow
- `CONFIG.PERSONALITY_SENSITIVITY` (default `0.5`) scales all impulses globally

### User States

`ephemeral` → `registeredOnly` → `premium`. Ephemeral users see a registration prompt after the assessment; registered users go straight to `/dashboard`.

### Spam Protection

Two layers in `src/config.ts`:
- **Per-user cooldown**: `USER_GENERATION_COOLDOWN_MS` (default 30 min) between generations
- **Global daily cap**: `GLOBAL_DAILY_GENERATION_LIMIT` (default 100) total guidances per 24h

## Testing

Test files live alongside source files (e.g., `src/user.test.ts`). Run with `bun test` or target a single file with `bun test src/user.test.ts`. Currently only the personality math (`applyImpulse`, `updateProfile`) has test coverage.

### Content Authoring

To add assessment questions, add entries to `src/data/questions.ts` following the existing schema: `text`, `tags` (trait names), `choices` (keyed by slug, each with `text` and `impulses` map). Impulse values should stay within `[-1.0, 1.0]`. To adjust Kassandra's voice or generation behavior, edit `src/data/prompts.ts`.

## Current Phase

The project is in the **"From Prototype to Playtest"** stage — core assessment, personality profiling, and AI guidance generation are functional. Active work areas include content workshopping (questions + prompts) and playtest-readiness features. See the Logseq design doc for the full roadmap and open TODOs.
