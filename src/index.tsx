import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { Layout, MainPage } from './ui'

const app = new Hono()

const words = [
    'guidance',
    'reframing',
    'insight',
    'clarity',
    'validation',
    'confidence'
]

app.get('/', (c) => {
    return c.html(
        <Layout>
            <MainPage />
        </Layout>
    )
})

app.get('/sse', async (c) => {
    return streamSSE(c, async (stream) => {
        let index = 0
        while (true) {
            const nextWord = words[(index + 1) % words.length]
            await stream.writeSSE({
                data: `<span id="rotating-word">${nextWord}</span>`,
                event: 'message',
                id: String(index),
            })
            index = (index + 1) % words.length
            await stream.sleep(2000)
        }
    })
})

export default app
