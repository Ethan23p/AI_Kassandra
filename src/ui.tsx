/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx } from 'hono/jsx'
import { html } from 'hono/html'
import { User } from './types'

export const Layout = (props: { children: any; user?: User | null }) => {
    return (
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>AI Kassandra</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap" rel="stylesheet" />
                <script src="https://unpkg.com/htmx.org@2.0.1"></script>
                <style>{html`
          body {
            background-color: #121212;
            color: #f5f5dc;
            font-family: 'Outfit', sans-serif;
            margin: 0;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            font-weight: 300;
          }
          header, footer {
            padding: 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          header a {
            color: #f5f5dc;
            text-decoration: none;
            font-weight: 600;
            font-size: 1.2rem;
            letter-spacing: 1px;
          }
          main {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 2rem;
            text-align: center;
          }
          h1 { font-weight: 600; font-size: 3rem; margin-bottom: 1rem; }
          p { font-size: 1.2rem; max-width: 600px; line-height: 1.6; }
          .btn {
            background-color: #f5f5dc;
            color: #121212;
            padding: 0.8rem 2rem;
            border: none;
            border-radius: 4px;
            font-family: 'Outfit', sans-serif;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            text-decoration: none;
            margin-top: 2rem;
            transition: transform 0.2s, opacity 0.2s;
          }
          .btn:hover { transform: translateY(-2px); opacity: 0.9; }
          .btn-outline {
            background: transparent;
            border: 1px solid #f5f5dc;
            color: #f5f5dc;
            margin-top: 1rem;
          }
          input[type="email"] {
            background: transparent;
            border: none;
            border-bottom: 1px solid #f5f5dc;
            color: #f5f5dc;
            padding: 0.5rem;
            font-family: 'Outfit', sans-serif;
            font-size: 1.1rem;
            margin-top: 1rem;
            width: 100%;
            max-width: 300px;
            text-align: center;
            outline: none;
          }
          .fade-in { animation: fadeIn 1s ease-out; }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
            </head>
            <body class="fade-in">
                <header>
                    <a href="/">AI KASSANDRA</a>
                    {props.user && <span style="font-size: 0.9rem; opacity: 0.7;">{props.user.email || 'Anonymous'}</span>}
                </header>
                <main>
                    {props.children}
                </main>
                <footer>
                    <span style="font-size: 0.8rem; opacity: 0.5;">© 2026 AI Kassandra</span>
                    <button
                        class="btn btn-outline"
                        style="font-size: 0.8rem; padding: 0.4rem 1rem; margin-top: 0;"
                        hx-post="/api/clear-identity"
                        hx-confirm="Clear your personality profile and start over?"
                        hx-target="body"
                    >
                        Clear Identity
                    </button>
                </footer>
            </body>
        </html>
    )
}

export const LandingPage = () => {
    return (
        <div class="fade-in">
            <h1>Spiritual Guidance, Triangulated.</h1>
            <p>
                Imagine astrology, but driven by AI and your actual personality.
                AI Kassandra analyzes your traits to provide daily pragmatic insight that helps you reframe your world.
            </p>
            <a href="/assessment" class="btn">Begin Assessment</a>
            <div style="margin-top: 3rem; opacity: 0.7;">
                <p style="font-size: 0.9rem;">Returning user?</p>
                <form hx-post="/api/login" hx-target="body">
                    <input type="email" name="email" placeholder="enter your email" required />
                    <br />
                    <button type="submit" class="btn btn-outline" style="font-size: 0.9rem; padding: 0.5rem 1.5rem;">Enter</button>
                </form>
            </div>
        </div>
    )
}

export const AssessmentPage = (props: { question: any; progress: number }) => {
    return (
        <div class="fade-in">
            <div style="margin-bottom: 2rem; opacity: 0.5; font-size: 0.9rem;">
                Question {props.progress} / 5
            </div>
            <h2 style="font-size: 2rem; margin-bottom: 2rem; max-width: 700px;">{props.question.text}</h2>
            <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center;">
                {props.question.options.map((option: string, index: number) => (
                    <button
                        class="btn btn-outline"
                        style="width: 100%; max-width: 400px; margin-top: 0;"
                        hx-post="/api/assessment/answer"
                        hx-vals={JSON.stringify({ questionId: props.question.id, answerIndex: index })}
                        hx-target={props.progress === 5 ? "body" : "main"}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    )
}

export const RegistrationPage = () => {
    return (
        <div class="fade-in">
            <h1>One Last Step.</h1>
            <p>Provide your email to receive your first guidance and preserve your profile.</p>
            <form hx-post="/api/register" hx-target="body" style="margin-top: 2rem;">
                <input type="email" name="email" placeholder="your@email.com" required />
                <br />
                <button type="submit" class="btn">Proceed to Guidance</button>
            </form>
        </div>
    )
}

export const DashboardPage = (props: { guidance: any; user: User }) => {
    return (
        <div class="fade-in">
            <h2 style="opacity: 0.6; font-size: 1.2rem; margin-bottom: 3rem;">Your Daily Insight</h2>
            <div style="background: rgba(245, 245, 220, 0.05); padding: 3rem; border-radius: 8px; max-width: 600px; border: 1px solid rgba(245, 245, 220, 0.1);">
                <p style="font-size: 1.5rem; font-style: italic; line-height: 1.4;">
                    "{props.guidance.text}"
                </p>
            </div>
            <div style="margin-top: 3rem; display: flex; gap: 1rem;">
                <button class="btn" hx-post="/api/generate-guidance" hx-target="body">Generate New Insight</button>
                <a href="/profile" class="btn btn-outline">View Profile</a>
            </div>
        </div>
    )
}

export const UserProfilePage = (props: { user: User; guidances: any[] }) => {
    return (
        <div class="fade-in" style="width: 100%; max-width: 800px; text-align: left;">
            <h1 style="font-size: 2.5rem; margin-bottom: 2rem;">User Profile</h1>

            <section style="margin-bottom: 3rem;">
                <h2 style="font-size: 1.5rem; opacity: 0.7; border-bottom: 1px solid rgba(245, 245, 220, 0.2); padding-bottom: 0.5rem;">Identity</h2>
                <p><strong>UUID:</strong> {props.user.id}</p>
                <p><strong>Email:</strong> {props.user.email || 'Anonymous'}</p>
                <p><strong>Status:</strong> {props.user.status}</p>
                <p><strong>Created:</strong> {new Date(props.user.created_at).toLocaleString()}</p>
            </section>

            <section style="margin-bottom: 3rem;">
                <h2 style="font-size: 1.5rem; opacity: 0.7; border-bottom: 1px solid rgba(245, 245, 220, 0.2); padding-bottom: 0.5rem;">Guidance History</h2>
                <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
                    {props.guidances.map(g => (
                        <div style="padding: 1rem; border-left: 2px solid #f5f5dc; background: rgba(245, 245, 220, 0.02);">
                            <p style="margin: 0; font-style: italic;">"{g.text}"</p>
                            <span style="font-size: 0.8rem; opacity: 0.5;">{new Date(g.created_at).toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </section>

            <a href="/dashboard" class="btn btn-outline">Back to Dashboard</a>
        </div>
    )
}
