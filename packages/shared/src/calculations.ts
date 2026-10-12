import type { DailySummary, TrainingDayOverrides, UserSettings } from './types'

const roundToOne = (value: number) => Math.round(value * 10) / 10
const range = (weight: number, minRate: number, maxRate: number) => ({
  min: Math.round(weight * minRate),
  max: Math.round(weight * maxRate),
})

export function getWeightBasedNutritionTargets(weight: number) {
  if (!Number.isFinite(weight) || weight <= 0) return null
  return {
    protein: range(weight, 1.8, 2),
    trainingCalories: range(weight, 38, 41),
    restCalories: range(weight, 35, 39),
    trainingCarbs: range(weight, 4.4, 5.3),
    restCarbs: range(weight, 3.8, 4.7),
    fat: range(weight, 1.1, 1.3),
  }
}

export function scaleRecipeNutrition(
  nutrition: { proteinG: number; minKcal: number; maxKcal: number },
  servings: number,
) {
  const factor = Number.isFinite(servings) && servings > 0 ? servings : 0
  return {
    proteinG: roundToOne(nutrition.proteinG * factor),
    minKcal: Math.round(nutrition.minKcal * factor),
    maxKcal: Math.round(nutrition.maxKcal * factor),
  }
}

export function calculateNutritionSummary(
  entries: Array<{ protein: number; caloriesMin?: number; caloriesMax?: number }>,
) {
  return entries.reduce((summary, entry) => ({
    proteinG: roundToOne(summary.proteinG + Math.max(0, entry.protein || 0)),
    minKcal: summary.minKcal + Math.max(0, entry.caloriesMin || 0),
    maxKcal: summary.maxKcal + Math.max(0, entry.caloriesMax || 0),
  }), { proteinG: 0, minKcal: 0, maxKcal: 0 })
}

export function isValidIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function calculateFoodProtein(weight: number, proteinPer100g: number): number {
  if (!Number.isFinite(weight) || !Number.isFinite(proteinPer100g) || weight <= 0 || proteinPer100g <= 0) {
    return 0
  }
  return roundToOne((weight * proteinPer100g) / 100)
}

export function isTrainingDay(date: string, trainingDays: number[], overrides: TrainingDayOverrides = {}): boolean {
  if (Object.hasOwn(overrides, date)) return overrides[date] === true
  const weekday = new Date(`${date}T12:00:00`).getDay()
  return trainingDays.includes(weekday)
}

export function getDailyTarget(
  date: string,
  settings: Pick<UserSettings, 'normalTarget' | 'trainingTarget' | 'trainingDays'>,
  overrides: TrainingDayOverrides = {},
): number {
  return isTrainingDay(date, settings.trainingDays, overrides) ? settings.trainingTarget : settings.normalTarget
}

export function calculateDailySummary(target: number, proteinValues: number[]): DailySummary {
  const consumed = roundToOne(proteinValues.reduce((sum, value) => sum + Math.max(0, value), 0))
  const remaining = roundToOne(Math.max(0, target - consumed))
  const progress = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0
  return { consumed, remaining, progress }
}

export function calculatePowderSuggestion(
  remainingProtein: number,
  powder: UserSettings['powder'],
): number {
  if (remainingProtein <= 0 || powder.servingWeight <= 0 || powder.proteinPerServing <= 0) return 0
  return Math.ceil((remainingProtein / powder.proteinPerServing) * powder.servingWeight)
}
