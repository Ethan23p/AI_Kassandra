# AI Kassandra

An app that profiles your personality and delivers AI-generated reframings on a regular cadence — like Co-Star, but with personality psychology and AI driving the engine instead of astrology.

A *guidance* here is an item of insight aimed at meaningful reframing: turning a potentially negative pattern into validation, confidence, or amusement. The model behind them is the Big 5 personality traits (OCEAN), inferred over time from a short, replayable assessment.

> **Status:** late playtest, ~80% from concept to 1.0. Phases remaining: playtest (≈90% complete) → alpha (soft launch) → 1.0.

## How it works

1. **Assessment.** Quirky scenarios with four dialogue choices each. Each scenario pairs two of the Big 5 traits; the four choices map to the combinations of low/high expression of those traits. A response applies an *impulse* to your personality profile.
2. **Profile.** A vector of five values in `[-1, 1]`, updated incrementally with a "remaining room" algorithm so impulses gracefully saturate as the model converges.
3. **Guidance.** A prompt is built from your latest profile snapshot plus a short record of recent guidances, sent to a generative model. The output is a short, personally-aimed reframing.

The assessment can be retaken indefinitely — recent responses dominate over older ones, so the model tracks a real person over time rather than freezing them in place.

## Stack

- **Runtime:** Bun (TypeScript)
- **Server:** Hono
- **Frontend:** HTMX 2.0 + JSX templates rendered by Hono
- **Database:** SQLite via `bun:sqlite`
- **AI:** Google Gemini (latest checkpoint)
- **Validation:** Zod

## Architecture

A strict MVC split: model in `src/db.ts`, `src/types.ts`, `src/user.ts`; controller in `src/index.tsx`; views in `src/ui.tsx`. A workshop UI mounted at `/dev/workshop` (dev-server only) lets me iterate on the generative prompts that produce assessment scenarios and guidance personas.

## Running locally

```sh
bun install
bun run dev
```

Set `GEMINI_API_KEY` in `.env` — Bun loads it automatically.

## Roadmap

- **Playtest** — small, trusted group; workshop tooling complete; tag-gated playtest features in.
- **Alpha** — magic-link auth (Resend), Stripe, Terms/Privacy, soft launch.
- **1.0** — public.
- **Beyond** — automated guidance delivery to inbox at user-configurable cadence, with deliberate non-determinism so it doesn't become inbox wallpaper.

## Notes

This is a learning project that I'm taking seriously as my first end-user product. Feedback welcome via `Contact@EthanPorter.xyz`.
