
- ## Overview
	- Imagine an app that profiles the user and provides daily 'spiritual' guidance generated through clever use of AI.
		- spiritual in a pragmatic sense.
	- Imagine Co-Star but instead of astrology driving the mechanisms, it's AI.
	-
	- The minimal implementation of the concept is: there's a user profile based on a short assessment; a new 'guidance' is provided once a day generated based on the user profile using AI.
	- ### Motivation and Scale
		- Currently only planning on an MVP.
			- *I'll go more in-depth another time.*
	- ### Development Guiding Principles
		- #### elegant
		- #### modular & flexible
			- Clean interfaces should exist for external systems as well as between some internal systems.
			- external systems and developer content should be handled through interfaces that are flexible to support a "plug and play" capacity.
		- #### "tell, don't ask" principle
		- #### interactivity
			- Bias toward supporting visual or design cues corresponding to code changes and app state.
		- #### Production-Grade Rigor by Default
			- Strict Type Safety
- ## Design
	- ### User Experience
	  *This is the idealized vision post release.*
		- User: "Lol, this should be good. Like astrology but with AI."
		- User: *Enters site / app for the first time.*
		- App: *greets them with a welcome page.*
		- App: *provides the user ~5 questions; they should be a bit fun to answer. Now the app has a couple question-responses to triangulate insight about their personality.*
		- App: *after the last-most question the user is obligated to register, offering an input field for their email. (Nothing more.)*
		- User: "Ah, figures. Well, I'd like to see where this goes." *Submits an email address.*
		- App: *displays a 'guidance'; the essential job of 'spiritual guidance' is to cause meaningful reframing.*
		- User: "Huh, I guess I never thought of it that way. Makes sense, this app knows me better than constellations do."
		- App: *asks user if they would like to have a new guidance sent to their inbox once a week for $2 a month.*
		- User: "Why not."
		- User: *Returns 25 hours later* "Ooh, a new guidance. I suppose I should answer some more questions so the guidances are even more relevant. (Plus, it was kind of fun.)"
	- ### Model, Controller, View
		- fourth draft
			- ## Model (Types)
				- ### User
					- id: UUID
					- email: string (unique, nullable if anonymous)
					- ~~auth provider id (?)~~ playtest-cookie: string
						- *For this prototype: just a simple cookie.*
					- (account) status: Enum [ephemeral, premium, registeredOnly]
					- created at: timestamp
					- last interacted at: timestamp
					- active personality profile: entity id
						- *depreciating*
				- ### User implementation:
					-
					  ```typescript
					  export const UserSchema = z.object({
					      id: z.string().uuid(),
					      email: z.string().email().nullable(),
					      playtest_cookie: z.string(),
					      status: z.enum(['ephemeral', 'registeredOnly', 'premium']),
					      created_at: z.number(),
					      last_interacted_at: z.number(),
					  });
					  ```
				- ### Personality Model
				  *This type is our SSOT reference for the personality models. (Like the Big 5.)*
					- entity id
					- name: string
					- version: string (e.g. v1.1)
					- traits[trait]: any[trait]
				- ### User Personality Profile
					- id
					- user id
					- updated at
					- traits: record(trait)
				- ### Personality Profile Implementation:
					-
					  ```typescript
					  export const PersonalityProfileSchema = z.object({
					      id: z.string().uuid(),
					      user_id: z.string().uuid(),
					      updated_at: z.number(),
					      traits: z.record(z.string(), PersonalityTraitSchema),
					  });
					  ```
				- ### Personality Trait
					- id
					- name
					- score
					- label
					- associated model id
						- *depreciating*
				- ### Personality Trait Implementation:
					-
					  ```typescript
					  export const PersonalityTraitSchema = z.object({
					      id: z.string(),
					      name: z.string(),
					      score: z.number().min(0).max(1),
					      label: z.string(),
					  });
					  ```
				- ### Question
					- id
					- text: string
					- choices[choice]: array[choice]
					- tags: array[tag]
						- *instead of 'category' we should use 'tags'*
				- ### choice
					- id
					- associated question id (?)
					- text
					- weights: array[ [trait] = [weight] ]
						- *I assume this will be necessary when we implement the assessment system.*
				- ### Question Implementation:
					-
					  ```typescript
					  export const QuestionSchema = z.object({
					      id: z.string(),
					      text: z.string(),
					      category: z.string(),
					      options: z.array(z.string()),
					  });
					  ```
				- ### Guidance
					- id
					- user id
					- text
					- input data: json string
						- *for the sake of debugging, we store exactly what was sent to the AI.*
					- created at: timestamp
				- ### Guidance Implementation:
					-
					  ```typescript
					  export const GuidanceSchema = z.object({
					      id: z.string().uuid(),
					      user_id: z.string().uuid(),
					      text: z.string(),
					      input_data: z.string(), // JSON string
					      created_at: z.number(),
					  });
					  ```
			- ## Controller (Events)
				- ### Clear Identity
				  *This is present for debugging pre-release.*
					- located in the footer
					- Clears user's local cookies for debugging purposes.
				- ### Collect User Responses
					- As the user submits during each step of the assessment, collect choices and trait score impulses
					- when the user submits the final assessment of the current batch, consolidate trait score impulses and **generate personality snapshot**
				- ### Generate Personality Snapshot
					- Input:
						- latest personality snapshot OR neutral
						- batch of trait score impulses from assessment
					- Output:
						- new user personality snapshot (intended to be swapped with latest)
					- Logic:
						- Remaining Room Algorithm, TypeScript:
							-
							  ```TypeScript
							  /**
							   * Applies an impulse to a value constrained between -1 and 1.
							   * Uses the "Remaining Room" algorithm to prevent overflow.
							   *
							   * @param current The current trait score (-1 to 1)
							   * @param impulse The force of the event (e.g. 0.1 or -0.2)
							   * @param sensitivity A multiplier for how fast the system learns (0 to 1)
							   */
							  function applyImpulse(current: number, impulse: number, sensitivity = 0.1): number {
							    // 1. Scale the raw impulse by sensitivity
							    const force = impulse * sensitivity;

							    // 2. Positive Impulse: Grow towards 1.0
							    if (force > 0) {
							      const roomToGrow = 1.0 - current;
							      return current + (force * roomToGrow);
							    }

							    // 3. Negative Impulse: Shrink towards -1.0
							    if (force < 0) {
							      // Note: If current is -0.9, room is 0.1.
							      const roomToShrink = 1.0 + current;
							      return current + (force * roomToShrink);
							    }

							    // 4. No change
							    return current;
							  }
							  ```
				- ### Generate Guidance
					- Input:
						- latest personality snapshot
						- system prompt
					- Output:
						- guidance (intended to be swapped with latest)
				- ### Registration
					- replaces the "submit" button for the last question of the assessment
					- input field
						- prototype & playtest: accepts email with full trust, updates internal identity, updates local identity, lets user proceed
						- post-playtest: accepts email, does internal verification, updates internal identity, updates local identity, lets user proceed
							- *This step will do things like handle repeat users and such*
							- *This step will not, even at release, force the user to go validate their email before proceeding to see their guidance - the app will send the email and they can validate on their own time.*
				- ### User Profile
					- #### Window into User Profile
						- Playtest: Play-testers will have all of their individual data available to inspect; this is so the play-tester can assess how well the system is doing, like judging for meaningful vs generic guidance.
						- Post-playtest: A serene window into the app's representation of them, particularly their personality profile for their own knowledge.
			- ## View (Distinct Elements)
				- ### Header
					- Main branding -> Dashboard
				- ### Footer
					- Button (all versions before release): "Clear Identity" -> clears user's browser cookies
					- Fine Text (like copyright)
				- ### Dashboard
					- current guidance
						- **Post-launch**: The dashboard feels lifeless since the app is pretty passive in nature, so we may add a fun interaction - maybe something that happens when the user clicks/taps the current guidance.
					- Button (during playtest, only while possible): "Generate Guidance"
					- Button: "Take Assessment" -> Assessment (returning user)
					- button: "View Profile" -> User Profile
				- ### Landing
					- about blurb
					- button: "begin assessment" -> Onboarding
					- returning user
						- label: "Returning user?"
						- input field: email
				- ### Assessment
					- question
					- choices
					- Button: Submit
					- Input field: **Registration** (only for final response, replaces 'Submit' button) -> Dashboard
						- Should not be a separate page
				- ### Registration
					- label: "Get your guidance by providing your email:"
					- input field: email
				- ### User Profile
					- #### Window into User Profile
						- For the playtest: Play-testers will have all of their individual data available to inspect
							- Take care to visualize the data well - tables should be scrollable, multiple views may be necessary
						- Post-playtest: A serene window into the app's representation of them, particularly a visual representation of their personality profile for their own use.
							- Text descriptions of the model and the traits.
							- Visual Representation
								- Loli-Pop graph, centered at 0 (or average?) with bars representing the traits perpendicular and reaching away from the origin, with positive values above origin and negative values below origin
								- *Note: This might require a dedicated, separate chunk of work.*
				- ### Info
					- #### 'about' blurb
						- Answer's the question, "Oh, I forgot what this service I signed up for is; what even is this?"
					- #### creator information
						- Created by: Ethan Porter
						- email (linkTo): Contact@EthanPorter.xyz
	- ### File Structure
		- First Draft
			- **Project Root**
				- .env
				- guidances.sqlite
				- package.json
				- tsconfig.json
				- **public/**
					- styles.css
				- **src/**
					- **data/**
						- questions.json
					- index.tsx
					- db.ts
					- ui.tsx
					- ai.ts
					- auth.ts
					- types.ts
	- ### Monetization
		- first draft
			- "First hit is Free"
				- The primary userbase is returning, premium users who use the app often but in short spurts. The service is a simple, flat cost: probably $2-5
				- the funnel: anyone can try the onboarding and get a free initial guidance; users are then encouraged to register for $2 to get a new guidance every morning, potentially through email.
					- anyone can navigate to the site online and try the onboarding - friction is intentionally low.
					- after they've gone through onboarding, the app provides their guidance and prompts them with a strong hook - something like, "Want to receive this in your inbox every morning? Only $2"
	- ### Nature of *Guidances (items of insight)*
	  AI_Kassandra/nature of insight items
		- For my collaborators: Be mindful that I'm treating the 'guidances' as an interactive art; **don't** decide on logic yourself, consult with Ethan for the implementation.
- ## Ideation
	- ### Practical Details
	  *Any details that are declared but not elaborated on are probably in progress, do not hesitate to consult Ethan about design & architectural decisions.*
		- At what step does the app request their email?
			- just before they get the guidance is ideal, to discourage one-time-use
		- How are these produced:
			- Questions, choices, weight
				- At this early stage: these are procured by a developer using AI & procedurally generated content. Placed in `/src/data/*.ts`
					- While they could hypothetically be automatically generated, this process serves as Quality Assurance (QA), plus reduces the complexity/cost of external services.
					- Modern AI is competent at generating the entire package: question + accompanying responses; but, in actuality, each piece is generated individually for the sake of 'single responsibility', simplicity, elegance.
						- It would be worth including the prompts in this document, if I ever get around to it.
			- Personality Models
				- The Big 5 Personality Traits (OCEAN) - Course, this is a pre-existing framework which works spectacularly well.
		- How does the app profile the user? How do we find their personality in a meaningful sense?
			- the profile: a user's personality profile is defined by how they measure for each of the 5 traits from 'The Big 5'.
				- These 5 measures (aka scores) describe a 5 dimensional point/space which is that users precise profile.
				- When the profile needs to be human-readable, we'll convert to natural language using a lightweight call to AI. (Like: .85 extraversion = quite high (but not extremely high))
			- the approach: quirky scenario + dialogue choices.
				- The app assesses the user by posing a quirky scenario to which they will respond with one of 4 dialogue choices.
					- quirky scenario: pertaining to **2** traits of 'The Big 5' personality traits
						- e.g. openness & neuroticism
					- dialogue choices: **4** potential responses which capture the 'vibe' of the various combinations of the *positive* and *negative* expression of those traits.
						- e.g.
						  | | **Extraverted** (extraversion, positive) | **Introverted** (extraversion, negative) |
						  |---|---|---|
						  | **Anxious** (neurotic, positive) | extraverted and anxious | introverted and anxious |
						  | **Chill** (neurotic, negative) | extraverted and chill | introverted and chill |
					- Depending on their response, we can apply an impulse to their active personality profile to increase / decrease the corresponding traits and, over multiple questions pertaining to any given trait, triangulate the specific user's precise measure.
						- This is 'aggregate' accuracy
			- Implementation: The profile is a vector of 5 values ranging from -1 to 1; the selected responses apply impulses, greater or lesser, to those values.
		- How does the app construct personality snapshots?
			- Assessments consist of questions which provide data in the form of 'impulses' to trait scores.
			- At the end of any assessment, trait impulses are collected together and applied to the user's previous snapshot.
		- How does the app generate guidances?
			- The guidances are generated by AI based on a system prompt, the user's unique personality profile
				- system prompt: This will be developer content, Ethan will be iterating on it over time. Likely located at, `/src/data/system_prompt.json`
					- It will describe a persona named Kassandra who is prompted to generate guidances that are potentially helpful but are also general such that they could apply to anyone with *roughly* that profile
				- user's latest personality snapshot: user's personality snapshots are transformed into natural language descriptions.
				- What the AI receives is a system prompt, establishing it's identity as 'Kassandra', and a prompt which describes in natural language a particular personality.
			- Is there any protection against repetitive guidances?
				- during the play-test: No
				- **Post-launch**: I have some ideas;
					- prevent repetitive sentiment by comparing similarity between new guidances and historical ones
						- I suspect we could store a user's historical guidances in a vector database, then compare the similarity of a newly generated guidance to that of any historical guidances, or recent ones in particular.
						- If a new guidance is too similar to previously provided guidances, the app could run the generation again with an identical prompt but with a note appended that says, "*You are to generate a. . .* Here are some of your recent guidances, be mindful to provide fresh insights. [provide those overly similar guidances]"
							- The AI can be trusted to observe the previous guidances and choose a distinct new direction
							- hypothetically, if this happens more than once (or often), the app could continuously add the offending generation to the prompt and call for another generation
					- another factor may be a "wildcard" inserted for the sake of variety or motivated leading.
			- Is there any protection against nonsensical or contradictory guidances?
				- during the play-test: No
				- **Post-launch**: perhaps
					- The app could send every new generation through a validation AI which assesses the generation multiple times, independently for various failure-modes
						- e.g.
							- "The following is a message being sent from my underling to a potential customer. Is the logic sound?",
							- "Is the message offensive?"
		- Does the personality profile system primarily orient toward *accuracy*?
			- pre-launch: yes, just accuracy over a user's 'lifetime'.
			- Eventually: Yes; specifically, the personality profile orients toward *accurate* measure of personality, *recently*.
				- While we won't worry about this until later, the personality profile will be dialed in such that each trait is decided by some number of recent relevant responses, as opposed to all relevant responses.
					- Imagine how many responses determine a given trait's measure:
						- all relevant responses: once the measures saturate - subtle shifts for any responses.
						- only latest relevant response: Every question the user answers changes their profile completely.
						- only the latest 5 relevant responses: once the measures saturate - profile describes the users personality *as of recent*;
							- each question has the potential to move the measure a bit, providing meaningful feedback but maintaining accuracy
							- perhaps the app even displays their personality *as of recent* compared to *total average*.
		- What is the significance of the 'assessment' aspect of the app?
			- I think this unique approach can create a measure of personality that is more effective, more accurate, and more fun than anything that has been done before.
			- *more effective, more accurate*
				- I'm no researcher, but this is an interesting exploration. The key detail in this methodology is that only with recent advances in AI could one generate the amount of content necessary to make complex methods, testing 2 traits per response and with content precisely, consistently tailored for every question & each response.
			- *more fun*
				- I believe these assessments, generated procedurally, will be quite fun to go through.
				- Also, providing an accurate assessment of one's personality is valuable, by itself (though, in this product, it's sort of just a by-product). As demonstrated by the Myers Brigg personality scale, enneagram, and many other less grounded assessments.
					- User's can engage with the assessments as much as they'd like, meaning some users will only do assessments to the point that they accurately reflect them and other users may return to them often; the data should saturate rather quickly.
				- The vibe this evokes is like the simple, basically brain-rot quizzes that young people online find themselves attracted to, like, *"Which 'Stranger Things' character are you most like?!"*
	- ### Market angles from Claude:
		- "Daily reflection prompts that actually know you"
		- "Your personality framework that evolves with you"
		- "Journaling, but the journal talks back"
		- "Like Co-Star, but real"
- ## Tech Stack
	- ### Modern & Minimal
		- **Backend:** Bun + Hono (TypeScript/JavaScript)
		- **Frontend:** HTMX 2.0 + JSX templates (via Hono)
		- **Notify:** SSE via Hono
		- **Database:** SQLite via bun:sqlite (native)
- ## Going From Design to Live Service
	- ### Design - Make a Spec Detailing Guiding Values, Draft MVC Definitions
		- DONE describe development pillars
		- DONE declare tech stack
		- DONE describe monetization
		- DONE describe primitive types, verbs, views (Model, Controller, View)
	- ### Minimal Web Interface
		- *This is for the purposes of exposing me to the technology stack.*
		- *Before I give the agent the entire design doc, I'll give them just the block below.*
		- #### Extremely simple webpage
The eventual tech stack:
			- ## Tech Stack
				- ### Modern & Minimal
					- **Backend:** Bun + Hono (TypeScript/JavaScript)
					- **Frontend:** HTMX 2.0 + JSX templates (via Hono)
					- **Notify:** SSE via Hono
					- **Database:** SQLite via bun:sqlite (native)
			- Guiding Principles, will become more relevant as complexity increases:

			- ### Development Guiding Principles
				- #### elegant
				- #### modular & flexible
					- Clean interfaces should exist for external systems as well as between some internal systems.
					- external systems and developer content should be handled through interfaces that are flexible to support a "plug and play" capacity.
				- #### "tell, don't ask" principle
				- #### interactivity
					- Bias toward supporting visual or design cues corresponding to code changes and app state.
				- #### Production-Grade Rigor by Default
					- Strict Type Safety

			- only one element: a line of text
				- the last word in the line of text gets swapped out for another word every two seconds.
				- word list:
					- AI Kassandra provides [___].
						- guidance
						- reframing
						- insight
						- clarity
						- validation
						- confidence
			- The style
				- Later on we'll focus on the visual design, until then the visual design should be minimal.
					- To begin, the colors should communicate: 'dark mode' and 'creamy'
	- ### From Design to Prototype
		- Implement the design with *mock* capabilities
			- lay the foundations according to the Model, Controller, View
			- then implement the logic and features based on the Model, Controller, View; just shallow, mock functionality at first
		- #### Milestone
			- Hypothetical new user can go through a mock onboarding:
				- specify a new username/email
				- then take a shallow assessment
				- then get a mock guidance.
	- ### From Prototype to Playtest
		- *The playtest will be primarily myself, my girlfriend, and a couple friends. This is maximum trust, requiring minimal polish, because this is a minimal milestone; at the alpha stage we'll tighten everything up to avoid abuse and feel more of the 'magic'.*
		- #### Securing the Foundation
			- Transparent debugging and robustness pass
				- implement logging
					- Errors should always reflect to the developer, like a printed message in the console as well as a persistent log file
						- given that this is such a simple app, my expectations are set high, errors should be quite rare.
					- A debugging mode which prints *all* events to the console
			- implement an extensive config system
			- implement a system for centralized copy text
				- in `/src/data/copy.ts` we have
			- if the project is properly modular and flexible, these steps should be a piece of cake.
		- #### Transition from Mocks to Logic
			- Logic: Assessment, User Personality Snapshot, Guidance
				- Added to the design section under the Controller heading.
			- implement cooldowns (minimal at this stage)
		- #### Establish the AI Pipeline
			- Using Google's Gemini Flash Latest
				- **Do a web search** for the correct implementation.
			- AI Helper logic for crafting input and processing output.
			- implement a temporary input field in the footer that I can use to validate our AI module
				- Course, quick and dirty is all we need.
		- #### Build the Transparency/Inspection View
			- Any visualization for the traits is sufficient, we'll return to this later to execute the full vision of a 'lolipop' graph.
		- #### Transition from Internal Server to External Server
			- I'll be setting up a tunnel through CloudFlare
		- #### Milestones
			- Hypothetical new user can go through onboarding:
				- take an actual assessment
				- register using an email
				- get a guidance (standard: somewhat meaningful is sufficient)
				- view their profile, including all individual user data as well as the questions, responses, & guidances as well as their corresponding weights & inputs.
					- In the playtest, we'll expose all of this information to the play-tester so that they can assess if the system is doing anything meaningful as opposed to generic.
			- Hypothetical existing user can bypass the landing page with a "returning user" input field:
				- If app does not recognize user, they can put their email in a "returning user" input field to be sent to the dashboard view
			- Hypothetical existing user can summon new guidances:
				- once every minute or so they can select a "new guidance" option.
			- While the server is running, users external to Ethan's PC can connect to an instance of the app
				- I haven't done this before, I'll record it here once I know how I'll be doing it.
				- in the meantime
	- ### Alpha
		- In the Alpha is when I'll first consider bringing in truly external users.
		- This will require we return to the features that I've paved over thus far - the features I don't yet understand fully which I'm looking out for are:
			- Authentication
			- Payment Processing
			- Automation (Cron(?))
		- Securing the foundation
			- Logic Pass: Do a pass to make sure logic is properly in place,
				- regarding readability and ui vs index vs types vs etc.
			- Hygiene Pass:
				- ensure comments are minimal, organized and
				- remove any that are unnecessary
	- ### ????
	- ### 1.0 - app is in a state such that, if I had a guaranteed customer, I could point them to the site and they could immediately buy into the service.
	- ### Profit!
