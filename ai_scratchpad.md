# ai_scratchpad.md

- #### Product
	- The most simple version of this just combines a user profile with some clever use of AI and provides a new 'guidance' *once* every x hours.
	- *clever use of ai* - I have lots of writing on this, so I'll focus on this completely separately from the development of the app.
		- If development of the app gets ahead of that, I just need to engineer a system which I can easily go into and tweak. This is what the design might look like which I should engineer to allow:
			- user assessment
				- this is still pretty up in the air, so all I know for sure is that it should be highly flexible.
				- most likely the format will be: **Some number of multiple choice questions with an arbitrary number of choices per question.**
				- most likely it won't be set in stone - the user will be able to answer more questions to provide more personality data.
			- user profile
				- will be some number of categories with multiple measures within.
					- e.g.
						- Big 5 personality traits / OCEAN
							- openness
							- conscientiousness
							- extrovertedness
							- agreeableness
							- neuroticism
						- socio-economic status
							- social status
							- economic status
							- *these might be a bit odd to be profiling on, I don't know*
						- Political alignment
							- authoritarian vs libertarianism
							- government involvement: economic
							- government involvement: social
			- guidance items
				- I suppose this needn't be any more complex than a string of text.
	- a system for differentiating users
		- Should 100% be tied to an email address
			- if not for simplicity, because the first big feature will be having the guidance delivered to your inbox. (arguably the best format for this service altogether)
	- an 'about' page
		- The vibe: somebody says, "oh yeah, I signed up for that one service... What's it do again?"
		- could also include some 'contact me' information for myself
	- user walkthrough:
		- User: "Lol, this should be good. Like astrology but with AI."
		- *Enters site / app for the first time.*
		- *App greets them with a welcome page.*
		- *App provides the user ~5 questions; they should be a bit fun to answer. Now the app has a couple question-responses to triangulate insight about their personality.*
		- *App returns a carefully crafted reflection in the form of guidance.*
		- *App displays a 'guidance'; the essential job of 'spiritual guidance' is to cause meaningful reframing.*
		- User: "Huh, I guess I never thought of it that way. Makes sense, this app knows me better than constellations do."
		- *App asks user if they would like to have a new guidance sent to their inbox once a week for $2 a month.*
		- User: "Why not."
	- features from walkthrough:
		- welcome page w/ explanation
		- simple registration
			- registers user with email address - just magic link email sign in would be great, just social media login would be great
		- prompt user: weekly guidance to email? y/n

## Technical Outline

### 1. Data & Persistence (`src/db.ts`, `src/models.ts`)
- **Schema**: Tables for `users` (id, email, auth_provider, subscribed_to_weekly), `questions` (text, options as JSON), `answers`, and `guidance`.
- **Functions**:
  - `createAnonymousUser()`: Initializes a session for a new visitor.
  - `updateUserToPermanent(id, email, username, subscribe)`: Converts an anonymous record into a registered account.
  - `saveAnswer(userId, questionId, value)`: Upserts user responses.
  - `getQuestions()` / `getAnswers(userId)`: Retrieval logic.
  - `createGuidance(userId, content)` / `getLatestGuidance(userId)`: Persisting AI output.

### 2. Authentication & Sessions (`src/auth.ts`)
- **`AuthService`**:
  - `ensureSession(context)`: Guarantees a user ID exists (creates anonymous if needed).
  - `getSessionUser(context)`: Retrieves user object from cookie.
  - `login(email)`: Strategy-based entry (currently `DevAuthStrategy` for playtesters).
- **`authMiddleware`**: Protects `/dashboard`, `/profile`, etc. while exempting onboarding routes (`/`, `/about`, `/start`).

### 3. Service Interfaces (`src/interfaces/`)
- **Profile Interface**: `buildContext(userId)` - Aggregates data into `AiAgentContext` for the AI.
- **AI Interface**: `generateGuidance(context)` - The "Oracle" engine (currently shallow mock).
- **Communication Interface**: `sendGuidance(email, content)` - Messaging abstraction (currently console logs).

### 4. Application Flow (`src/index.tsx`, `src/views.tsx`)
- **Routes**:
  - `GET /`: Landing Page.
  - `GET /start`: Initializes session and sends to questions.
  - `POST /submit-answers`: Runs the pipeline (context -> guidance) and redirects to `/register` if anonymous.
  - `POST /register`: Handover from anonymous to permanent.
- **Views**: Aesthetic Hono/JSX components using Tailwind CSS for a premium "Playtester" vibe.
