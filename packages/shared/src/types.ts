export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type WeightBasis = 'cooked' | 'raw' | 'bone-in' | 'boneless'
export type EntrySource = 'ai-estimate' | 'manual' | 'copied'

export interface FoodEntry {
  id: string
  date: string
  meal: MealType
  foodName: string
  estimatedWeight: number
  proteinPer100g: number
  protein: number
  weightBasis: WeightBasis
  source: EntrySource
  note?: string
  imageUrl?: string
  createdAt: string
}

export interface UserSettings {
  weight: number
  normalTarget: number
  trainingTarget: number
  trainingDays: number[]
  powder: {
    servingWeight: number
    proteinPerServing: number
  }
  timezone: string
}

export interface DailySummary {
  consumed: number
  remaining: number
  progress: number
}

export interface AiFoodCandidate {
  id: string
  foodName: string
  estimatedWeight: number
  proteinPer100g: number
  weightBasis: WeightBasis
  confidenceLabel: '较高' | '一般' | '较低'
  hint: string
}
