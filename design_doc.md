- ## Design
	- ### Overview
		- Imagine an app that profiles the user and provides daily spiritual guidance generated through clever use of AI.
			- profiles the user
				- engages the user with a number of low-friction, high-insight questions to create a personality profile.
			- daily
				- guidances are delivered daily
				- profiling (user choosing to answer questions) can happen at any time
			- spiritual guidance
				- Like a horoscope within Astrology
				- People value the guidance, insight, and clarity that spiritual practices bring
				- Many people are more effective when they have a direction to move in, even if which direction they go is not related to their metric of success.
					- I believe spiritual guidance is less about any supernatural forces and more about providing external framing & a direction to move in.
			- *'clever use of ai'* - I have lots of writing on this, so I'll focus on this completely separately from the development of the app.
		- Imagine Co-Star but instead of astrology it's AI.
		-
		- The most simple version of this just combines a user profile with some clever use of AI and provides a new 'guidance' once a day.
		- Motivation
			- **I'm developing micro-apps to touchdown into the market - to have the capacity to gain traction so that, in the long-term, I can build the cool things and, in the short-mid term, bring in money to survive.**
			- The short-mid term goal is all about creating potential for a feedback loop, instead of hacking away day and night on moonshot projects I'm actively managing to harvest resources from the world.
	- ### Rough Initial File Structure
		- **Project Root**
			- .env
			- guidances.sqlite
			- package.json
			- tsconfig.json
			- **public/**
				- styles.css
			- **src/**
				- index.tsx
				- db.ts
				- ui.tsx
				- ai.ts
				- auth.ts
				- types.ts
	- ### Fundamental Primitives
		- ### 1. The User (Identity & Status)
		  User identity, where they are in the funnel
			-
			  ```typescript
			  type UserStatus = 'anonymous' | 'registered' | 'premium';

			  type User = {
			  readonly id: string;         // Unique UUID or Email
			  email: string;
			  status: UserStatus;
			  createdAt: Date;
			  lastGuidanceAt?: Date;      // Used to calculate the "once every X hours" logic
			  };
			  ```
		- ### 2. The Assessment (Questions & Logic)
			-
			  ```typescript
			  type QuestionCategory = 'personality' | 'socio-economic' | 'political' | 'general';

			  type Question = {
			  readonly id: number;
			  category: QuestionCategory;
			  text: string;               // e.g., "How do you handle chaos?"
			  options: Choice[];          // Arbitrary number of choices
			  };

			  type Choice = {
			  readonly id: number;
			  questionId: number;
			  text: string;               // e.g., "I embrace it"
			  metadata?: string;            // Metadata for the AI (e.g., "high_openness")
			  };
			  ```
		- ### 3. The Answer (User Profile Data)
			-
			  ```typescript
			  type Answer = {
			  readonly userId: string;
			  readonly questionId: number;
			  readonly choiceId: number;
			  answeredAt: Date;
			  };
			  ```
		- ### 4. The Guidance (The Oracle's Output)
			-
			  ```typescript
			  type Guidance = {
			  readonly id: number;
			  readonly userId: string;
			  text: string;               // The "carefully crafted reflection"
			  generatedAt: Date;
			  isDaily: boolean;           // Distinguishes the "First hit" from the "Subscription" guidance
			  };
			  ```
		- ### 5. The "Synthesis" Profile (AI Context)
			-
			  ```typescript
			  type UserProfileSummary = {
			  email: string;
			  traits: {
			    ocean: { [key: string]: number }; // e.g., { openness: 0.8, neuroticism: 0.2 }
			    socioEcon: string[];
			    political: string[];
			  };
			  recentGuidance: string[];           // Last 3-5 items to avoid repetition
			  };
			  ```
	- ### Monetization
		- "First hit is Free"
			- The primary userbase is returning, premium users who use the app often but in short spurts. The service is a simple, flat cost: $2 to $5, undecided thus-far.
			- The funnel:
				- Any anonymous person can navigate to the site and try the service by doing a short assessment and receiving a single guidance, with low friction.
					- likely, even these users will provide an email address
						- as may be necessary to maintain a user's history - to prevent a user having to go through the initial assessment twice
						- also may be useful to prevent users from intentionally taking the initial assessment repeatedly, encouraging them to establish a user account for better guidance
				- Hopefully that single guidance convinces them to go premium; at the end, along with the guidance, the user is prompted:
					- GOOD: "By answering more questions, our system can provide even more insightful guidance. Would you like to receive a guidance like this every morning for $2 a month?"
					- OKAY: "Would you like to receive a guidance like this every morning and increase the systems understanding of you, for $2 a month?"
	- ### Nature of *Insight Items*
	  AI_Kassandra/nature of insight items
	- ### User Experience
		- walkthrough:
			- User: "Lol, this should be good. Like astrology but with AI."
			- User: *Enters site / app for the first time.*
			- App: *greets them with a welcome page.*
			- App: *provides the user ~5 questions; they should be a bit fun to answer. Now the app has a couple question-responses to triangulate insight about their personality.*
			- App: *returns a carefully crafted reflection in the form of guidance.*
			- App: *displays a 'guidance'; the essential job of 'spiritual guidance' is to cause meaningful reframing.*
			- User: "Huh, I guess I never thought of it that way. Makes sense, this app knows me better than constellations do."
			- App: *asks user if they would like to have a new guidance sent to their inbox once a week for $2 a month.*
			- User: "Why not."
			- features from walkthrough:
				- welcome page w/ explanation
				- simple registration
					- registers user with email address - just magic link email sign in would be great, just social media login would be great
				- prompt user: weekly guidance to email? y/n
