// src/views.tsx
import { html } from 'hono/html';
import { Question, Answer, Guidance } from './models';

// 1. The Shell
export const Layout = (props: { children: any; title?: string }) => html`
<!DOCTYPE html>
<html>
    <head>
        <title>${props.title || "Kassandra"}</title>
        <script src="https://unpkg.com/htmx.org@2.0.0"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body class="bg-slate-950 text-slate-200 min-h-screen font-sans antialiased flex flex-col items-center pt-20">
        <div class="w-full max-w-2xl px-6">
            <h1 class="text-3xl font-light tracking-widest text-indigo-400 mb-12 text-center uppercase border-b border-gray-800 pb-4">
                Kassandra
            </h1>
            ${props.children}
        </div>
    </body>
</html>
`;

// 2. Landing Page
export const LandingPage = () => (
    <Layout title="Welcome">
        <div class="text-center flex flex-col items-center gap-10 py-10">
            <div class="space-y-4">
                <h2 class="text-4xl font-extralight tracking-[0.2em] text-white uppercase italic">Ancient Insight</h2>
                <h3 class="text-xl font-light tracking-widest text-indigo-400 uppercase">Modern Intelligence</h3>
            </div>

            <p class="text-gray-400 max-w-md leading-relaxed text-lg font-light">
                Kassandra translates the patterns of your personality into a singular, weekly reflection. No horoscopes, just data-driven intuition.
            </p>

            <div class="flex flex-col gap-4 mt-8">
                <a href="/start" class="px-10 py-4 bg-indigo-900 hover:bg-indigo-800 text-indigo-100 rounded-full transition duration-500 uppercase tracking-[0.3em] text-sm shadow-lg shadow-indigo-950/50">
                    Begin Assessment
                </a>
                <a href="/about" class="text-xs uppercase tracking-widest text-gray-600 hover:text-gray-400 transition">
                    Learn More
                </a>
            </div>

            <div class="mt-20 opacity-20 hover:opacity-100 transition duration-1000">
                <a href="/login" class="text-[10px] uppercase tracking-[0.4em] text-gray-500 hover:text-indigo-400">
                    Established Identity
                </a>
            </div>
        </div>
    </Layout>
);

// 3. About Page
export const AboutPage = () => (
    <Layout title="About">
        <div class="space-y-8 text-gray-400 leading-relaxed font-light">
            <h2 class="text-xl text-indigo-400 uppercase tracking-widest font-normal">Origins</h2>
            <p>
                Kassandra was born from a simple question: Can we use the tools of modern profiling to achieve the resonance of ancient wisdom?
            </p>
            <p>
                By mapping your responses against established psychological measures, we create a temporary "digital twin" that our AI agent can reflect upon. The result is a weekly guidance item designed to cause meaningful reframing.
            </p>
            <div class="pt-10 border-t border-gray-900 mt-20">
                <p class="text-xs uppercase tracking-widest mb-4">Architect</p>
                <div class="flex flex-col gap-1">
                    <span class="text-gray-200">Ethan Porter</span>
                    <a href="mailto:contact@EthanPorter.xyz" class="text-indigo-500 hover:text-indigo-400">contact@EthanPorter.xyz</a>
                </div>
            </div>
            <div class="pt-8">
                <a href="/" class="text-xs uppercase tracking-widest text-indigo-900 hover:text-indigo-700 transition font-bold">Return</a>
            </div>
        </div>
    </Layout>
);

// 4. Registration Page (Upgrade)
export const RegistrationPage = (props: { error?: string }) => (
    <Layout title="Save Progress">
        <div class="max-w-sm mx-auto space-y-8">
            <div class="text-center space-y-2">
                <h2 class="text-lg text-indigo-300 uppercase tracking-widest">Guidance Received</h2>
                <p class="text-sm text-gray-500 font-light">Enter your email to save your profile and receive weekly reflections.</p>
            </div>

            <form hx-post="/register" hx-target="body" class="flex flex-col gap-6">
                {props.error && <div class="text-red-400 bg-red-900/20 px-4 py-2 rounded text-xs">{props.error}</div>}
                <div class="flex flex-col">
                    <label class="text-[10px] text-gray-500 mb-2 uppercase tracking-[0.2em]">Playtester Identity</label>
                    <input
                        type="text"
                        name="username"
                        class="bg-gray-900 border border-gray-800 p-3 rounded text-center focus:outline-none focus:border-indigo-500 transition-colors text-gray-300"
                        placeholder="Choose a name"
                        required
                    />
                </div>
                <div class="flex flex-col">
                    <label class="text-[10px] text-gray-500 mb-2 uppercase tracking-[0.2em]">Email for Reflection</label>
                    <input
                        type="email"
                        name="email"
                        class="bg-gray-900 border border-gray-800 p-3 rounded text-center focus:outline-none focus:border-indigo-500 transition-colors text-gray-300"
                        placeholder="you@email.com"
                        required
                    />
                </div>
                <div class="flex items-center gap-3 py-2">
                    <input type="checkbox" name="subscribe" id="subscribe" checked class="accent-indigo-900 w-4 h-4" />
                    <label for="subscribe" class="text-xs text-gray-400 cursor-pointer">Receive weekly guidance ($2/mo mockup)</label>
                </div>
                <button type="submit" class="w-full py-4 bg-indigo-900 hover:bg-indigo-800 text-indigo-100 rounded transition duration-300 uppercase tracking-widest text-xs">
                    Seal Identity
                </button>
            </form>
        </div>
    </Layout>
);

// 5. Login Page (For existing users)
export const LoginPage = (props: { error?: string }) => (
    <Layout title="Login">
        <form hx-post="/login" hx-target="body" class="flex flex-col gap-6 items-center">
            {props.error && <div class="text-red-400 bg-red-900/20 px-4 py-2 rounded text-xs">{props.error}</div>}
            <div class="flex flex-col w-full max-w-sm">
                <label class="text-[10px] text-gray-500 mb-2 uppercase tracking-widest">Email Address</label>
                <input
                    type="email"
                    name="username"
                    class="bg-gray-900 border border-gray-800 p-3 rounded text-center focus:outline-none focus:border-indigo-500 transition-colors text-gray-300"
                    placeholder="you@email.com"
                    required
                />
            </div>
            <button type="submit" class="mt-4 px-10 py-3 bg-gray-900 border border-gray-800 hover:border-indigo-900 text-gray-400 hover:text-indigo-300 rounded transition duration-300 uppercase tracking-widest text-xs">
                Reconnect
            </button>
            <a href="/" class="text-[10px] uppercase tracking-widest text-gray-600 hover:text-gray-400 mt-4">Cancel</a>
        </form>
    </Layout>
);

// 3. Home Page
export const HomePage = (props: { username: string; latestGuidance: Guidance | null }) => (
    <Layout title="Home">
        <div class="text-center">
            <p class="mb-8 text-xl text-gray-400">Welcome, <span class="text-white font-semibold">{props.username}</span>.</p>

            {props.latestGuidance ? (
                <div class="bg-gray-900/50 p-8 rounded-lg border border-gray-800 mb-8">
                    <h2 class="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4">Latest Guidance</h2>
                    <p class="text-lg italic leading-relaxed text-gray-300">"{props.latestGuidance.content}"</p>
                    <p class="text-xs text-gray-600 mt-4 text-right">{new Date(props.latestGuidance.created_at).toLocaleString()}</p>
                </div>
            ) : (
                <div class="mb-8 p-6 border border-dashed border-gray-800 rounded-lg text-gray-500">
                    No guidance on record.
                </div>
            )}

            <div class="flex gap-4 justify-center">
                <a href="/questions" class="px-6 py-3 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/20 rounded transition uppercase text-sm tracking-wider">
                    {props.latestGuidance ? "Seek New Guidance" : "Begin Assessment"}
                </a>
                <a href="/profile" class="px-6 py-3 border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300 rounded transition uppercase text-sm tracking-wider">
                    View Profile
                </a>
            </div>
        </div>
    </Layout>
);

// 4. Questions Form
export const QuestionForm = (props: { questions: Question[] }) => (
    <Layout title="Assessment">
        <form hx-post="/submit-answers" hx-target="body" class="space-y-10">
            {props.questions.map(q => (
                <div class="flex flex-col gap-3">
                    <label class="text-lg text-gray-200">{q.text}</label>
                    <div class="flex flex-col gap-2 mt-2">
                        {q.options && q.options.length > 0 ? (
                            q.options.map(opt => (
                                <label class="flex items-center gap-2 cursor-pointer group">
                                    <input type="radio" name={`q_${q.id}`} value={opt} class="appearance-none w-4 h-4 border border-gray-600 rounded-full checked:bg-indigo-500 checked:border-indigo-500 transition" required />
                                    <span class="text-sm text-gray-500 group-hover:text-gray-300">{opt}</span>
                                </label>
                            ))
                        ) : (
                            // Fallback if no options (e.g. text input or default scale)
                            <input type="text" name={`q_${q.id}`} class="bg-gray-900 border border-gray-700 p-2 rounded text-gray-300" placeholder="Your answer..." required />
                        )}
                    </div>
                </div>
            ))}
            <div class="pt-8 flex justify-between items-center">
                <a href="/" class="text-gray-500 hover:text-gray-300 text-sm">Cancel</a>
                <button type="submit" class="px-8 py-3 bg-indigo-900 hover:bg-indigo-800 text-indigo-200 rounded transition duration-300 uppercase tracking-widest text-sm">
                    Submit Answers
                </button>
            </div>
        </form>
    </Layout>
);

// 5. Profile View (The Table)
export const ProfileView = (props: { username: string; answers: (Answer & { question_text: string })[] }) => (
    <Layout title="Profile">
        <div class="mb-6 flex justify-between items-end">
            <h2 class="text-sm font-bold text-gray-500 uppercase tracking-widest">Data Record: {props.username}</h2>
            <a href="/" class="text-indigo-400 hover:text-indigo-300 text-sm">Back</a>
        </div>
        <div class="overflow-x-auto border border-gray-800 rounded-lg">
            <table class="w-full text-left text-sm text-gray-400">
                <thead class="bg-gray-900 uppercase tracking-wider text-xs text-gray-500 font-medium">
                    <tr>
                        <th class="px-6 py-4">Question</th>
                        <th class="px-6 py-4">Value</th>
                        <th class="px-6 py-4 text-right">Timestamp</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-800">
                    {props.answers.length === 0 ? (
                        <tr><td colspan={3} class="px-6 py-8 text-center text-gray-600 italic">No data collected.</td></tr>
                    ) : (
                        props.answers.map(a => (
                            <tr class="hover:bg-gray-900/50 transition">
                                <td class="px-6 py-4 text-gray-300">{a.question_text}</td>
                                <td class="px-6 py-4 text-indigo-400 font-mono">{a.value}</td>
                                <td class="px-6 py-4 text-right text-gray-600 text-xs">{new Date(a.created_at).toLocaleString()}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </Layout>
);