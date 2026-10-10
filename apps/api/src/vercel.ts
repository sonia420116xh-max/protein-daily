import { handle } from 'hono/vercel'
import app from './app.js'

export const POST = handle(app)
