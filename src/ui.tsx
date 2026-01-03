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
        <main id="main-content">
          ${props.children}
        </main>
      </body>
    </html>
  `
}

export const Welcome = () => (
  <div class="welcome-container">
    <header>
      <h1>AI Kassandra</h1>
      <p class="subtitle">Your personalized digital oracle.</p>
    </header>

    <section class="hero">
      <div class="card glass">
        <h2>Seek Guidance</h2>
        <p>Discover insights about your personality and path through the lens of artificial intelligence.</p>
        <button
          hx-get="/assessment/start"
          hx-target="#main-content"
          hx-push-url="true"
          class="btn-primary"
        >
          Begin Assessment
        </button>
      </div>
    </section>

    <footer>
      <p>&copy; 2024 AI Kassandra</p>
    </footer>
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
