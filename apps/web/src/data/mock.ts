import type { AiFoodCandidate, FoodEntry, UserSettings } from '@protein-daily/shared'

export const todayIso = new Intl.DateTimeFormat('en-CA', {
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date())

const dateOffset = (days: number) => {
  const date = new Date(`${todayIso}T12:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export const defaultSettings: UserSettings = {
  weight: 50,
  normalTarget: 80,
  trainingTarget: 85,
  trainingDays: [2, 4, 6],
  powder: { servingWeight: 30, proteinPerServing: 24 },
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
}

export const initialEntries: FoodEntry[] = [
  {
    id: 'entry-1', date: todayIso, meal: 'breakfast', foodName: '希腊酸奶', estimatedWeight: 180,
    proteinPer100g: 9.5, protein: 17.1, weightBasis: 'cooked', source: 'manual', createdAt: `${todayIso}T08:12:00`,
  },
  {
    id: 'entry-2', date: todayIso, meal: 'breakfast', foodName: '水煮蛋', estimatedWeight: 55,
    proteinPer100g: 12.6, protein: 6.9, weightBasis: 'cooked', source: 'manual', createdAt: `${todayIso}T08:13:00`,
  },
  {
    id: 'entry-3', date: todayIso, meal: 'lunch', foodName: '香煎鸡胸肉', estimatedWeight: 120,
    proteinPer100g: 31, protein: 37.2, weightBasis: 'cooked', source: 'ai-estimate', createdAt: `${todayIso}T12:32:00`,
    imageUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'entry-4', date: dateOffset(-1), meal: 'lunch', foodName: '三文鱼', estimatedWeight: 140,
    proteinPer100g: 22, protein: 30.8, weightBasis: 'cooked', source: 'ai-estimate', createdAt: `${dateOffset(-1)}T12:18:00`,
  },
  {
    id: 'entry-5', date: dateOffset(-1), meal: 'dinner', foodName: '北豆腐', estimatedWeight: 180,
    proteinPer100g: 12.2, protein: 22, weightBasis: 'cooked', source: 'manual', createdAt: `${dateOffset(-1)}T18:41:00`,
  },
  {
    id: 'entry-6', date: dateOffset(-3), meal: 'breakfast', foodName: '希腊酸奶', estimatedWeight: 200,
    proteinPer100g: 9.5, protein: 19, weightBasis: 'cooked', source: 'copied', createdAt: `${dateOffset(-3)}T08:05:00`,
  },
]

export const mockCandidates: AiFoodCandidate[] = [
  {
    id: 'candidate-1', foodName: '香煎鸡胸肉', estimatedWeight: 135, proteinPer100g: 31,
    weightBasis: 'cooked', confidenceLabel: '较高', hint: '按熟重估算，未计入盘中酱汁',
  },
  {
    id: 'candidate-2', foodName: '西兰花', estimatedWeight: 90, proteinPer100g: 3.7,
    weightBasis: 'cooked', confidenceLabel: '一般', hint: '可食用部分熟重估算',
  },
]
