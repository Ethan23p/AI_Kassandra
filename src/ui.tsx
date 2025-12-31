import { html } from 'hono/html';
import { jsx } from 'hono/jsx';

export const Layout = (props: { title?: string; children: any }) => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${props.title || 'AI Kassandra'}</title>
      <script src="https://unpkg.com/htmx.org@2.0.0"></script>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap');
        body {
          font-family: 'Outfit', sans-serif;
          background: radial-gradient(circle at center, #1a1a2e 0%, #16213e 100%);
          color: #e94560;
        }
        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
        }
      </style>
    </head>
    <body class="min-h-screen flex flex-col items-center justify-center p-4">
      <div id="content" class="w-full max-w-2xl">
        ${props.children}
      </div>
    </body>
  </html>
`;

export const Landing = () => (
  <div class="glass p-8 text-center space-y-6">
    <h1 class="text-4xl font-bold tracking-tight text-white">AI Kassandra</h1>
    <p class="text-lg text-gray-300 leading-relaxed">
      Welcome, seeker. I am Kassandra, an artificial oracle designed to reflect the hidden patterns of your spirit.
    </p>
    <p class="text-md text-gray-400">
      By answering a few simple questions, we canbegin to triangulate your unique personality profile and provide daily guidance tailored to your vibration.
    </p>
    <div class="pt-4">
      <button
        hx-get="/assessment/start"
        hx-target="#content"
        hx-swap="innerHTML transition:true"
        class="px-8 py-3 bg-[#e94560] text-white font-semibold rounded-full hover:bg-[#ff4d6d] transition-all duration-300 shadow-lg shadow-[#e94560]/20 active:scale-95"
      >
        Begin the Assessment
      </button>
    </div>
  </div>
);

export const QuestionCard = (props: { question: any }) => (
  <div class="glass p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="space-y-2">
      <span class="text-xs font-semibold uppercase tracking-widest text-[#e94560] opacity-80">
        Triangulating Pattern...
      </span>
      <h2 class="text-2xl font-semibold text-white leading-tight">
        ${props.question.text}
      </h2>
    </div>
    <div class="grid gap-3">
      ${props.question.options.map((opt: any) => (
        <button
          hx-post="/api/answer"
          hx-vals={`js:{questionId: ${props.question.id}, choiceId: ${opt.id}}`}
          hx-target="#content"
          hx-swap="innerHTML transition:true"
          class="w-full text-left p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-gray-200 group flex items-center justify-between"
        >
          <span>${opt.text}</span>
          <span class="opacity-0 group-hover:opacity-100 transition-opacity text-[#e94560]">→</span>
        </button>
      ))}
    </div>
  </div>
);

export const AssessmentComplete = () => (
  <div class="glass p-8 text-center space-y-6 animate-in zoom-in duration-700">
    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#e94560]/20 text-[#e94560] mb-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h2 class="text-3xl font-bold text-white">Pattern Triangulated</h2>
    <p class="text-lg text-gray-300">
      Your unique vibration has been captured. The Oracle is now crafting your first guidance...
    </p>
    <div
      hx-get="/api/guidance/generate"
      hx-trigger="load delay:2s"
      hx-target="#content"
      class="pt-4 flex flex-col items-center"
    >
      <div class="w-12 h-12 border-4 border-[#e94560]/30 border-t-[#e94560] rounded-full animate-spin"></div>
      <p class="mt-4 text-sm text-gray-500 italic">Synthesizing insights...</p>
    </div>
  </div>
);
