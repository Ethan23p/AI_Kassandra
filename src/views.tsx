// src/views.tsx
import { html } from 'hono/html';

// 1. The Shell (HTML Head, Scripts, Body wrapper)
export const Layout = (props: { children: any }) => html`
<!DOCTYPE html>
    <html>
        <head>
            <script src="https://unpkg.com/htmx.org@2.0.0"></script>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
            <body class="bg-gray-900 text-white p-10 font-mono">
            <h1 class="text-2xl mb-4">Basement Prototype</h1>
            ${props.children}
        </body>
    </html>
`;

// 2. The Log Component (The thing that updates via OOB)
export const ActivityLog = (props: { count: number }) => (
    <div id="activity-log" hx-swap-oob="true" class="mb-4 text-green-400">
        System Active. Total Clicks: {props.count}
    </div>
);

// 3. The Button Component (The thing that triggers the event)
export const ClickButton = (props: { lastTimestamp?: string }) => (
    <button
        hx-post="/click"
        hx-swap="outerHTML"
        class={`border px-4 py-2 transition ${props.lastTimestamp
                ? "border-green-500 text-green-500" // Green if clicked
                : "border-white hover:bg-white hover:text-black" // White if fresh
            }`}
    >
        {props.lastTimestamp
            ? `Sequence recorded at ${props.lastTimestamp}`
            : "Initialize Sequence"
        }
    </button>
);