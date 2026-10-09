import { serve } from '@hono/node-server'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { z } from 'zod'

const app = new Hono()
app.use('*', logger())
app.use('/api/*', cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }))

const foodSchema = z.object({
  foodName: z.string().min(1).max(100),
  estimatedWeight: z.number().positive().max(5000),
  proteinPer100g: z.number().positive().max(100),
  weightBasis: z.enum(['cooked', 'raw', 'bone-in', 'boneless']),
})

app.get('/api/health', (context) => context.json({ ok: true, mode: 'mock' }))

app.post('/api/ai/recognize', async (context) => {
  const contentType = context.req.header('content-type') ?? ''
  if (!contentType.includes('multipart/form-data')) return context.json({ error: '需要上传图片' }, 400)
  return context.json({
    disclaimer: '图片识别结果仅为估算，请用户确认后保存。',
    candidates: [
      { id: 'mock-1', foodName: '香煎鸡胸肉', estimatedWeight: 135, proteinPer100g: 31, weightBasis: 'cooked', confidenceLabel: '较高', hint: '按熟重估算' },
      { id: 'mock-2', foodName: '西兰花', estimatedWeight: 90, proteinPer100g: 3.7, weightBasis: 'cooked', confidenceLabel: '一般', hint: '按可食用部分估算' },
    ],
  })
})

app.post('/api/entries/validate', zValidator('json', foodSchema), (context) => context.json({ valid: true, entry: context.req.valid('json') }))

app.notFound((context) => context.json({ error: 'Not found' }, 404))
app.onError((error, context) => { console.error(error); return context.json({ error: '服务暂时不可用' }, 500) })

const port = Number(process.env.PORT ?? 8787)
serve({ fetch: app.fetch, port }, (info) => console.log(`Protein Daily API listening on http://localhost:${info.port}`))

export default app
