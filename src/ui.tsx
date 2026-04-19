/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx } from 'hono/jsx'
import { html } from 'hono/html'
import { User, UserInteraction } from './types'
import { COPY } from './data/copy'
import { CONFIG } from './config'
import { questionsData } from './data/questions'

export const Layout = (props: { children: any; user?: User | null }) => {
    return (
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>{COPY.meta.title}</title>
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
                    <a href="/">{COPY.meta.title}</a>
                    {props.user && <span style="font-size: 0.9rem; opacity: 0.7;">{props.user.email || COPY.layout.anonymous_user}</span>}
                </header>
                <main>
                    {props.children}
                </main>
                <footer>
                    <span style="font-size: 0.8rem; opacity: 0.5;">{COPY.layout.footer_copyright}</span>

                    {/* Debug Input */}
                    {CONFIG.DEBUG_MODE && (
                        <form hx-post="/api/debug/prompt" hx-target="main" style="display: flex; gap: 0.5rem; opacity: 0.5;">
                            <input
                                type="text"
                                name="prompt"
                                placeholder={COPY.layout.footer_debug_input_placeholder}
                                style="background: transparent; border: none; border-bottom: 1px solid #f5f5dc; color: #f5f5dc; padding: 0.2rem; font-size: 0.8rem; width: 200px;"
                            />
                            <button type="submit" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.2rem 0.6rem; margin: 0; border: none;">{COPY.layout.footer_debug_btn}</button>
                        </form>
                    )}

                    <button
                        class="btn btn-outline"
                        style="font-size: 0.8rem; padding: 0.4rem 1rem; margin-top: 0;"
                        hx-post="/api/clear-identity"
                        hx-confirm={COPY.layout.clear_identity_confirm}
                        hx-target="body"
                    >
                        {COPY.layout.clear_identity}
                    </button>
                </footer>
            </body>
        </html>
    )
}

export const LandingPage = () => {
    return (
        <div class="fade-in" style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            <h1>{COPY.landing.title}</h1>
            <p style="margin-bottom: 2rem;">
                {COPY.landing.description}
            </p>
            <a href="/assessment" class="btn">{COPY.landing.begin_btn}</a>

            <div style="margin-top: 4rem; opacity: 0.7; display: flex; flex-direction: column; align-items: center; width: 100%;">
                <p style="font-size: 0.9rem; margin-bottom: 0.5rem;">{COPY.landing.returning_user_label}</p>
                <form hx-post="/api/login" hx-target="body" style="display: flex; flex-direction: column; align-items: center; width: 100%;">
                    <input type="email" name="email" placeholder={COPY.landing.email_placeholder} required />
                    <button type="submit" class="btn btn-outline" style="font-size: 0.9rem; padding: 0.5rem 1.5rem; margin-top: 1.5rem;">{COPY.landing.enter_btn}</button>
                </form>
            </div>
        </div>
    )
}

// Fisher-Yates shuffle
export function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export const AssessmentPage = (props: { question: any; questionId: string; progress: number; total: number; remainingIds?: string[] }) => {
    const choiceEntries = Object.entries(props.question.choices);
    const randomizedChoices = shuffle(choiceEntries);

    return (
        <div class="fade-in" style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            <div style="margin-bottom: 2rem; opacity: 0.5; font-size: 0.9rem;">
                {COPY.assessment.progress_prefix} {props.progress} {COPY.assessment.progress_connector} {props.total}
            </div>
            <h2 style="font-size: 2rem; margin-bottom: 2rem; max-width: 700px;">{props.question.text}</h2>
            <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center; width: 100%;">
                {randomizedChoices.map(([key, choice]: [string, any]) => (
                    <button
                        class="btn btn-outline"
                        style="width: 100%; max-width: 400px; margin-top: 0;"
                        hx-post="/api/assessment/answer"
                        hx-vals={JSON.stringify({
                            questionId: props.questionId,
                            answerKey: key,
                            remainingIds: props.remainingIds?.join(',') || ''
                        })}
                        hx-target="main"
                    >
                        {choice.text}
                    </button>
                ))}
            </div>
        </div>
    )
}

export const RegistrationPage = () => {
    return (
        <div class="fade-in" style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            <h1>{COPY.registration.title}</h1>
            <p>{COPY.registration.description}</p>
            <form hx-post="/api/register" hx-target="body" style="margin-top: 2rem; display: flex; flex-direction: column; align-items: center; width: 100%;">
                <input type="email" name="email" placeholder={COPY.registration.email_placeholder} required />
                <button type="submit" class="btn" style="margin-top: 2rem;">{COPY.registration.submit_btn}</button>
            </form>
        </div>
    )
}

export const DashboardPage = (props: { guidance: any; user: User }) => {
    return (
        <div class="fade-in" style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            <h2 style="opacity: 0.6; font-size: 1.2rem; margin-bottom: 3rem;">{COPY.dashboard.insight_header}</h2>
            <div style="background: rgba(245, 245, 220, 0.05); padding: 3rem; border-radius: 8px; max-width: 600px; border: 1px solid rgba(245, 245, 220, 0.1);">
                <p style="font-size: 1.5rem; font-style: italic; line-height: 1.4;">
                    "{props.guidance.text}"
                </p>
            </div>
            <div style="margin-top: 3rem; display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;">
                <a href="/profile" class="btn btn-outline" style="margin-top: 2rem;">{COPY.dashboard.profile_btn}</a>
            </div>
            {props.user.tags.includes('playtester') && (
                <button
                    class="btn"
                    hx-post="/api/advance-time"
                    hx-target="body"
                    style="position: fixed; bottom: 2rem; right: 2rem; margin-top: 0; z-index: 10;"
                    title={COPY.dashboard.advance_time_hint}
                    aria-label={COPY.dashboard.advance_time_hint}
                >
                    {COPY.dashboard.advance_time_btn}
                </button>
            )}
        </div>
    )
}

export const UserProfilePage = (props: { user: User; guidances: any[]; profile: any; interactions?: UserInteraction[] }) => {
    const traits = props.profile ? Object.values(props.profile.traits) : [];
    const interactions = props.interactions || [];

    return (
        <div class="fade-in" style="width: 100%; max-width: 800px; text-align: left;">
            <h1 style="font-size: 2.5rem; margin-bottom: 2rem;">{COPY.profile.title}</h1>

            <section style="margin-bottom: 3rem;">
                <h2 style="font-size: 1.5rem; opacity: 0.7; border-bottom: 1px solid rgba(245, 245, 220, 0.2); padding-bottom: 0.5rem;">{COPY.profile.section_identity}</h2>
                <p><strong>{COPY.profile.label_id}</strong> {props.user.id}</p>
                <p><strong>{COPY.profile.label_email}</strong> {props.user.email || COPY.layout.anonymous_user}</p>
                <p><strong>{COPY.profile.label_status}</strong> {props.user.status}</p>
                <p><strong>{COPY.profile.label_created}</strong> {new Date(props.user.created_at).toLocaleString()}</p>
            </section>

            <section style="margin-bottom: 3rem;">
                <h2 style="font-size: 1.5rem; opacity: 0.7; border-bottom: 1px solid rgba(245, 245, 220, 0.2); padding-bottom: 0.5rem;">{COPY.profile.section_personality}</h2>
                {traits.length > 0 ? (
                    <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem;">
                        {traits.map((t: any) => (
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <span style="width: 150px; font-weight: 400;">{t.name}</span>
                                <div style="flex: 1; height: 10px; background: rgba(245, 245, 220, 0.1); border-radius: 5px; position: relative; overflow: hidden;">
                                    <div style={{
                                        position: 'absolute',
                                        left: '50%',
                                        width: `${Math.abs(t.score) * 50}%`,
                                        height: '100%',
                                        background: t.score >= 0 ? '#4CAF50' : '#F44336',
                                        transform: t.score < 0 ? 'translateX(-100%)' : 'none'
                                    }}></div>
                                </div>
                                <span style="width: 50px; text-align: right; font-size: 0.8rem; opacity: 0.7;">{t.score.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style="opacity: 0.5;">{COPY.profile.no_personality_data}</p>
                )}
            </section>

            <section style="margin-bottom: 3rem;">
                <h2 style="font-size: 1.5rem; opacity: 0.7; border-bottom: 1px solid rgba(245, 245, 220, 0.2); padding-bottom: 0.5rem;">{COPY.profile.section_interactions}</h2>
                {interactions.length > 0 ? (
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 0.9rem;">
                            <thead>
                                <tr style="text-align: left; opacity: 0.7;">
                                    <th style="padding: 0.5rem; border-bottom: 1px solid rgba(245,245,220,0.1);">{COPY.profile.label_question}</th>
                                    <th style="padding: 0.5rem; border-bottom: 1px solid rgba(245,245,220,0.1);">{COPY.profile.label_choice}</th>
                                    <th style="padding: 0.5rem; border-bottom: 1px solid rgba(245,245,220,0.1);">{COPY.profile.label_impulses}</th>
                                    <th style="padding: 0.5rem; border-bottom: 1px solid rgba(245,245,220,0.1);">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {interactions.map(i => {
                                    const q = questionsData[i.question_id];
                                    const c = q?.choices[i.choice_id];
                                    return (
                                        <tr style="border-bottom: 1px solid rgba(245,245,220,0.05);">
                                            <td style="padding: 0.5rem;">{q ? q.text : i.question_id}</td>
                                            <td style="padding: 0.5rem;">{c ? c.text : i.choice_id}</td>
                                            <td style="padding: 0.5rem;">
                                                {Object.entries(i.impulses).map(([k, v]) => (
                                                    <span style={{ marginRight: '0.5rem', opacity: 0.8, color: (v as number) > 0 ? '#4CAF50' : '#F44336' }}>
                                                        {k}: {(v as number) > 0 ? '+' : ''}{v}
                                                    </span>
                                                ))}
                                            </td>
                                            <td style="padding: 0.5rem; opacity: 0.5;">{new Date(i.created_at).toLocaleTimeString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p style="opacity: 0.5;">No interactions recorded yet.</p>
                )}
            </section>

            <section style="margin-bottom: 3rem;">
                <h2 style="font-size: 1.5rem; opacity: 0.7; border-bottom: 1px solid rgba(245, 245, 220, 0.2); padding-bottom: 0.5rem;">{COPY.profile.section_history}</h2>
                <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
                    {props.guidances.map(g => (
                        <div style="padding: 1rem; border-left: 2px solid #f5f5dc; background: rgba(245, 245, 220, 0.02);">
                            <p style="margin: 0; font-style: italic;">"{g.text}"</p>
                            <span style="font-size: 0.8rem; opacity: 0.5;">{new Date(g.created_at).toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </section>

            <a href="/dashboard" class="btn btn-outline">{COPY.dashboard.back_btn}</a>
        </div>
    )
}
