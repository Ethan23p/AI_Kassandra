/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx } from 'hono/jsx'
import { html } from 'hono/html'

export const Layout = (props: { children: any }) => {
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
                <script src="https://unpkg.com/htmx-ext-sse@2.2.1/sse.js"></script>
                <style>{html`
          body {
            background-color: #121212;
            color: #f5f5dc;
            font-family: 'Outfit', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            font-size: 2.5rem;
            font-weight: 300;
          }
          #rotating-word {
            font-weight: 600;
            border-bottom: 2px solid #f5f5dc;
            animation: fadeIn 0.8s ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
            </head>
            <body>
                {props.children}
            </body>
        </html>
    )
}

export const MainPage = () => {
    return (
        <main>
            <p>
                AI Kassandra provides{' '}
                <span
                    hx-ext="sse"
                    sse-connect="/sse"
                    sse-swap="message"
                >
                    <span id="rotating-word">guidance</span>
                </span>.
            </p>
        </main>
    )
}
