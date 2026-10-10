import { describe, expect, it } from 'vitest'
import { createOpenAIClient, parseRecognitionResult, validateImageUpload } from './recognition'

describe('image upload validation', () => {
  it('accepts a compressed JPEG below the upload limit', () => {
    expect(validateImageUpload({ type: 'image/jpeg', size: 850_000 })).toEqual({ ok: true })
  })

  it('rejects unsupported image formats', () => {
    expect(validateImageUpload({ type: 'image/svg+xml', size: 10_000 })).toEqual({
      ok: false,
      message: '仅支持 JPEG、PNG、WebP 或 GIF 图片',
    })
  })

  it('rejects images larger than 4 MB', () => {
    expect(validateImageUpload({ type: 'image/jpeg', size: 4 * 1024 * 1024 + 1 })).toEqual({
      ok: false,
      message: '图片过大，请压缩到 4MB 以内',
    })
  })
})

describe('model result parsing', () => {
  it('accepts a structured food recognition result', () => {
    const result = parseRecognitionResult(JSON.stringify({
      containsFood: true,
      warning: '重量来自图片估算',
      candidates: [{
        foodName: '南瓜', estimatedWeight: 120, proteinPer100g: 1,
        weightBasis: 'cooked', confidenceLabel: '较高', hint: '按去皮熟重估算',
      }],
    }))

    expect(result.candidates[0]?.foodName).toBe('南瓜')
  })

  it('rejects invalid numeric estimates from the model', () => {
    expect(() => parseRecognitionResult(JSON.stringify({
      containsFood: true,
      warning: '',
      candidates: [{
        foodName: '鸡蛋', estimatedWeight: -50, proteinPer100g: 12.6,
        weightBasis: 'cooked', confidenceLabel: '较高', hint: '',
      }],
    }))).toThrow('模型返回的数据格式无效')
  })
})

describe('OpenAI-compatible provider configuration', () => {
  it('uses the configured relay base URL without changing its path', () => {
    process.env.OPENAI_BASE_URL = 'https://relay.example.com/custom/v1/'
    const client = createOpenAIClient('test-key')

    expect(client.baseURL).toBe('https://relay.example.com/custom/v1')
    delete process.env.OPENAI_BASE_URL
  })

  it('uses the official OpenAI base URL when no relay is configured', () => {
    delete process.env.OPENAI_BASE_URL
    const client = createOpenAIClient('test-key')

    expect(client.baseURL).toBe('https://api.openai.com/v1')
  })
})
