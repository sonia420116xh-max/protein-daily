import OpenAI from 'openai'
import { z } from 'zod'

const supportedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const maxImageBytes = 4 * 1024 * 1024

const candidateSchema = z.object({
  foodName: z.string().trim().min(1).max(100),
  estimatedWeight: z.number().positive().max(5000),
  proteinPer100g: z.number().positive().max(100),
  weightBasis: z.enum(['cooked', 'raw', 'bone-in', 'boneless']),
  confidenceLabel: z.enum(['较高', '一般', '较低']),
  hint: z.string().max(200),
})

const recognitionSchema = z.object({
  containsFood: z.boolean(),
  warning: z.string().max(300),
  candidates: z.array(candidateSchema).max(12),
})

export type RecognitionResult = z.infer<typeof recognitionSchema>

export function validateImageUpload(file: Pick<File, 'type' | 'size'>): { ok: true } | { ok: false; message: string } {
  if (!supportedImageTypes.has(file.type)) return { ok: false, message: '仅支持 JPEG、PNG、WebP 或 GIF 图片' }
  if (file.size > maxImageBytes) return { ok: false, message: '图片过大，请压缩到 4MB 以内' }
  if (file.size === 0) return { ok: false, message: '图片内容为空' }
  return { ok: true }
}

export function parseRecognitionResult(outputText: string): RecognitionResult {
  try {
    const result = recognitionSchema.parse(JSON.parse(outputText))
    if (result.containsFood && result.candidates.length === 0) throw new Error('empty candidates')
    return result
  } catch {
    throw new Error('模型返回的数据格式无效')
  }
}

const responseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['containsFood', 'warning', 'candidates'],
  properties: {
    containsFood: { type: 'boolean' },
    warning: { type: 'string' },
    candidates: {
      type: 'array',
      maxItems: 12,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['foodName', 'estimatedWeight', 'proteinPer100g', 'weightBasis', 'confidenceLabel', 'hint'],
        properties: {
          foodName: { type: 'string' },
          estimatedWeight: { type: 'number' },
          proteinPer100g: { type: 'number' },
          weightBasis: { type: 'string', enum: ['cooked', 'raw', 'bone-in', 'boneless'] },
          confidenceLabel: { type: 'string', enum: ['较高', '一般', '较低'] },
          hint: { type: 'string' },
        },
      },
    },
  },
} as const

const recognitionPrompt = `你是饮食图片识别助手。分析照片中所有可以清楚看到的食物，用简体中文返回。

要求：
- 分开列出不同食物，不要识别餐具、盘子或装饰。
- estimatedWeight 是可食用部分的大致克数。鸡蛋默认不含蛋壳；带骨肉类说明是否按带骨重量估算。
- weightBasis 必须选择 cooked、raw、bone-in、boneless。无法判断生熟时根据画面给出最可能值，并降低把握度。
- proteinPer100g 使用该食物在当前生熟状态下常见的每 100g 蛋白质克数，只保留合理估算，不假装精确测量。
- confidenceLabel 根据食物是否清晰、遮挡程度和份量参照选择“较高”“一般”“较低”。
- hint 简述重量口径、数量判断或主要不确定性。
- 图片没有食物时 containsFood=false，candidates 返回空数组，并在 warning 说明原因。
- 重量无法可靠判断时仍给出保守估算，同时在 warning 和 hint 中明确提示用户修改。`

export async function recognizeFoodImage(file: File, apiKey: string): Promise<RecognitionResult> {
  const validation = validateImageUpload(file)
  if (!validation.ok) throw new Error(validation.message)

  const imageBase64 = Buffer.from(await file.arrayBuffer()).toString('base64')
  const client = new OpenAI({ apiKey, timeout: 30_000, maxRetries: 1 })
  const response = await client.responses.create({
    model: process.env.OPENAI_VISION_MODEL || 'gpt-4.1-mini',
    store: false,
    max_output_tokens: 1800,
    input: [{
      role: 'user',
      content: [
        { type: 'input_text', text: recognitionPrompt },
        { type: 'input_image', image_url: `data:${file.type};base64,${imageBase64}`, detail: 'high' },
      ],
    }],
    text: {
      format: {
        type: 'json_schema',
        name: 'food_recognition',
        strict: true,
        schema: responseSchema,
      },
    },
  })

  if (!response.output_text) throw new Error('模型没有返回识别结果')
  return parseRecognitionResult(response.output_text)
}
