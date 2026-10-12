export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type WeightBasis = 'cooked' | 'raw' | 'bone-in' | 'boneless'
export type EntrySource = 'ai-estimate' | 'manual' | 'copied' | 'recipe'
export type TrainingDayOverrides = Record<string, boolean>

export interface FoodEntry {
  id: string
  date: string
  meal: MealType
  foodName: string
  estimatedWeight: number
  proteinPer100g: number
  protein: number
  caloriesMin?: number
  caloriesMax?: number
  recipeId?: string
  servings?: number
  weightBasis: WeightBasis
  source: EntrySource
  note?: string
  imageUrl?: string
  createdAt: string
}

export interface RecipeIngredient {
  name: string
  weightG: number
  weightBasis: WeightBasis
}

export interface Recipe {
  id: string
  name: string
  mealType: 'lunch' | 'dinner'
  ingredients: RecipeIngredient[]
  proteinEstimateG: number
  energyEstimateKcal: { min: number; max: number }
  tags: string[]
  notes: string
}

export interface UserSettings {
  weight: number
  height?: number | null
  bodyFatPercentage?: number | null
  waist?: number | null
  hips?: number | null
  chest?: number | null
  profileVersion?: number
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
