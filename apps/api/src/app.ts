import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { recognizeFoodImage, validateImageUpload } from './recognition.js'

const app = new Hono()
const rateLimits = new Map<string, { count: number; resetAt: number }>()
const rateLimitWindowMs = 60 * 60 * 1000
const maxRequestsPerWindow = 20

app.use('*', logger())

function isSameOrigin(origin: string | undefined, host: string | undefined): boolean {
  if (!origin || !host) return true
  try {
    const originUrl = new URL(origin)
    return originUrl.host === host || ['localhost', '127.0.0.1'].includes(originUrl.hostname)
  } catch { return false }
}

function consumeRateLimit(ip: string): boolean {
  const now = Date.now()
  if (rateLimits.size > 1000) {
    for (const [key, value] of rateLimits) if (value.resetAt <= now) rateLimits.delete(key)
  }
  const current = rateLimits.get(ip)
  if (!current || current.resetAt <= now) {
    rateLimits.set(ip, { count: 1, resetAt: now + rateLimitWindowMs })
    return true
  }
  if (current.count >= maxRequestsPerWindow) return false
  current.count += 1
  return true
}

app.get('/api/health', (context) => context.json({ ok: true, mode: 'openai-vision' }))

app.post('/api/recognize', async (context) => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return context.json({ error: '识别服务尚未配置，请添加 OPENAI_API_KEY' }, 503)

  if (!isSameOrigin(context.req.header('origin'), context.req.header('host'))) {
    return context.json({ error: '不允许从其他网站调用识别服务' }, 403)
  }
  const clientIp = context.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (!consumeRateLimit(clientIp)) return context.json({ error: '识别次数过多，请稍后再试' }, 429)

  const body = await context.req.parseBody()
  const image = body.image
  if (!(image instanceof File)) return context.json({ error: '需要上传图片' }, 400)

  const validation = validateImageUpload(image)
  if ('message' in validation) return context.json({ error: validation.message }, 400)

  const result = await recognizeFoodImage(image, apiKey)
  if (!result.containsFood || result.candidates.length === 0) {
    return context.json({ error: result.warning || '图片中没有识别到食物' }, 422)
  }

  return context.json({
    disclaimer: result.warning || '图片识别和重量均为估算，请确认后保存。',
    candidates: result.candidates.map((candidate) => ({ ...candidate, id: crypto.randomUUID() })),
  })
})

app.notFound((context) => context.json({ error: 'Not found' }, 404))
app.onError((error, context) => {
  console.error('Food recognition failed', error)
  const message = error instanceof Error && error.message.includes('图片') ? error.message : '识别暂时失败，请重试或手动录入'
  return context.json({ error: message }, 500)
})

export default app
