# AI_Kassandra

## Current Phase

- ### From Scratch to Playtesting
	- Design Pillars
		- modular & flexible
		- elegant
		- tell, don't ask
	- The external services and developer content (like prompts and such) should operate through clean, abstracted interfaces so that connections can be swapped and added easily.
		- In service of this, our first iteration will operate using shallow, mock systems in place of external services and developer content.

## Tech Stack

- ### tech stack
	- ### Modern & Minimal
		- **Backend:** Bun + Hono (TypeScript/JavaScript)
		- **Frontend:** HTMX 2.0 + JSX templates (via Hono)
		- **Notify:** SSE via Hono
		- **Database:** SQLite via bun:sqlite (native)
		- **Pros:** modern JS runtime, fast, great DX, single language, rapid development, native SQLite, growing ecosystem, AI tools excel here
		- **Styling:** Between Tailwind and Basecoat, I have stupidly easy modern components & design plus it's flexible enough to inject personality.

