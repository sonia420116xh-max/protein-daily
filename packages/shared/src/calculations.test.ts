import { describe, expect, it } from 'vitest'
import {
  calculateDailySummary,
  calculateFoodProtein,
  calculatePowderSuggestion,
  getDailyTarget,
  isTrainingDay,
} from './calculations'

describe('protein calculations', () => {
  it('calculates food protein from edible weight and per-100g data', () => {
    expect(calculateFoodProtein(138, 31)).toBe(42.8)
  })

  it('uses the training target on configured weekdays', () => {
    const settings = { normalTarget: 80, trainingTarget: 85, trainingDays: [2, 4, 6] }

    expect(isTrainingDay('2026-10-08', settings.trainingDays)).toBe(true)
    expect(getDailyTarget('2026-10-08', settings)).toBe(85)
    expect(getDailyTarget('2026-10-09', settings)).toBe(80)
  })

  it('calculates totals and never returns a negative gap', () => {
    expect(calculateDailySummary(80, [25.5, 18.2, 13.3])).toEqual({
      consumed: 57,
      remaining: 23,
      progress: 71,
    })
    expect(calculateDailySummary(80, [60, 35]).remaining).toBe(0)
  })

  it('converts the remaining protein into powder grams', () => {
    expect(calculatePowderSuggestion(23, { servingWeight: 30, proteinPerServing: 24 })).toBe(29)
    expect(calculatePowderSuggestion(0, { servingWeight: 30, proteinPerServing: 24 })).toBe(0)
  })

  it('handles invalid powder configuration safely', () => {
    expect(calculatePowderSuggestion(20, { servingWeight: 30, proteinPerServing: 0 })).toBe(0)
  })
})
