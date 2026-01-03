import { html } from 'hono/html'

export const Layout = (props: { children: any; title?: string }) => {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${props.title || 'AI Kassandra'}</title>
        <link rel="stylesheet" href="/public/styles.css" />
        <script src="https://unpkg.com/htmx.org@2.0.0"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Outfit:wght@500;700&display=swap" rel="stylesheet">
      </head>
      <body>
        <header>
          <a href="/" hx-get="/" hx-target="#main-content" hx-push-url="true">
            <h1>AI Kassandra</h1>
          </a>
          <p class="subtitle">Your personalized digital oracle.</p>
        </header>
        <main id="main-content">
          ${props.children}
        </main>
        <footer>
          <p>&copy; 2024 AI Kassandra</p>
          <div class="debug-links" style="margin-top: 1rem; opacity: 0.3;">
            <a href="/debug/reset" style="color: var(--accent-color); text-decoration: none; font-size: 0.8rem;">[Debug: Reset Progress]</a>
          </div>
        </footer>
      </body>
    </html>
  `
}

export const HeroContent = ({ username }: { username?: string }) => (
  <section class="hero" id="hero-section">
    <div class="card glass">
      {username ? (
        <>
          <h2>Welcome, {username}</h2>
          <p>Your path awaits. Shall we consult the oracle?</p>
          <button
            hx-get="/assessment/start"
            hx-target="#main-content"
            hx-push-url="true"
            class="btn-primary"
          >
            Begin Assessment
          </button>
        </>
      ) : (
        <>
          <h2>Who are you?</h2>
          <p>Identify yourself to begin your journey through the digital stars.</p>
          <form hx-post="/identify" hx-target="#hero-section" hx-swap="outerHTML" style="margin-top: 2rem;">
            <input
              type="text"
              name="username"
              placeholder="Enter Username"
              required
              class="input-primary"
              style="padding: 0.8rem 1.2rem; border-radius: 10px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.05); color: white; width: 100%; max-width: 300px; margin-bottom: 1rem;"
            />
            <br />
            <button type="submit" class="btn-primary">Identify</button>
          </form>
        </>
      )}
    </div>
  </section>
)

export const Welcome = ({ username }: { username?: string }) => (
  <div class="welcome-container">
    <HeroContent username={username} />
  </div>
)

export const QuestionView = ({ question }: { question: any }) => (
  <div class="card glass">
    <h2>{question.text}</h2>
    <div class="options">
      {question.choices.map((choice: any) => (
        <button
          hx-post="/assess"
          hx-vals={JSON.stringify({ questionId: question.id, choiceId: choice.id })}
          hx-target="#main-content"
          class="btn-secondary"
        >
          {choice.text}
        </button>
      ))}
    </div>
  </div>
)

export const GuidanceView = ({ guidance }: { guidance: string }) => (
  <div class="card glass guidance-card">
    <h2>Your Digital Oracle Speaks</h2>
    <div class="guidance-text">
      <p>{guidance}</p>
    </div>
    <div class="upsell">
      <p>Would you like to receive a guidance like this every morning for $2 a month?</p>
      <button class="btn-primary">Go Premium</button>
    </div>
  </div>
)

export const GeneratingView = () => (
  <div class="card glass" hx-get="/assess" hx-trigger="load delay:2s" hx-target="#main-content">
    <div class="generating-container">
      <h2 class="pulse">Consulting the digital stars...</h2>
      <div class="loader-bar">
        <div class="loader-progress"></div>
      </div>
      <p class="subtitle">Weaving your choices into a path of insight.</p>
    </div>
  </div>
)
