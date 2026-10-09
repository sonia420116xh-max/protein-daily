import 'dotenv/config'
import { serve } from '@hono/node-server'
import app from './app'

const port = Number(process.env.PORT ?? 8787)
serve({ fetch: app.fetch, port }, (info) => console.log(`Protein Daily API listening on http://localhost:${info.port}`))

export default app
