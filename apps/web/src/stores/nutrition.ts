import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import {
  calculateDailySummary,
  calculateFoodProtein,
  calculatePowderSuggestion,
  calculateNutritionSummary,
  scaleRecipeNutrition,
  getDailyTarget,
  isTrainingDay,
  type FoodEntry,
  type TrainingDayOverrides,
  type UserSettings, type Recipe,
} from '@protein-daily/shared'
import { defaultSettings, todayIso } from '@/data/defaults'

const readStored = <T>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch { return fallback }
}

export const useNutritionStore = defineStore('nutrition', () => {
  const legacySeedEntryIds = new Set(['entry-1', 'entry-2', 'entry-3', 'entry-4', 'entry-5', 'entry-6'])
  const storedEntries = readStored<FoodEntry[]>('protein-daily.entries', [])
  const entries = ref<FoodEntry[]>(storedEntries.filter((entry) => !legacySeedEntryIds.has(entry.id)))
  const storedSettings = readStored<UserSettings>('protein-daily.settings', defaultSettings)
  const settings = ref<UserSettings>(storedSettings.profileVersion
    ? storedSettings
    : { ...storedSettings, weight: 45, profileVersion: 1 })
  const trainingOverrides = ref<TrainingDayOverrides>(readStored('protein-daily.training-overrides', {}))
  const favoriteRecipeIds = ref<string[]>(readStored('protein-daily.recipe-favorites', []))
  const selectedDate = ref(todayIso)

  const entriesForDate = computed(() => entries.value.filter((entry) => entry.date === selectedDate.value))
  const targetForDate = computed(() => targetByDate(selectedDate.value))
  const summaryForDate = computed(() => calculateDailySummary(targetForDate.value, entriesForDate.value.map((entry) => entry.protein)))
  const powderSuggestion = computed(() => calculatePowderSuggestion(summaryForDate.value.remaining, settings.value.powder))
  const nutritionForDate = computed(() => calculateNutritionSummary(entriesForDate.value))

  function addEntry(input: Omit<FoodEntry, 'id' | 'protein' | 'createdAt'>) {
    entries.value.unshift({
      ...input,
      id: crypto.randomUUID(),
      protein: calculateFoodProtein(input.estimatedWeight, input.proteinPer100g),
      createdAt: new Date().toISOString(),
    })
  }

  function addRecipe(recipe: Recipe, options: { date: string; meal: 'lunch' | 'dinner'; servings: number }) {
    const snapshot = scaleRecipeNutrition({
      proteinG: recipe.proteinEstimateG,
      minKcal: recipe.energyEstimateKcal.min,
      maxKcal: recipe.energyEstimateKcal.max,
    }, options.servings)
    addEntry({
      date: options.date,
      meal: options.meal,
      foodName: recipe.name,
      // Recipe protein is already a scaled snapshot. Keep the generic per-100g
      // calculation neutral so servings are not applied a second time.
      estimatedWeight: 100,
      proteinPer100g: snapshot.proteinG,
      weightBasis: 'cooked',
      source: 'recipe',
      recipeId: recipe.id,
      servings: options.servings,
      caloriesMin: snapshot.minKcal,
      caloriesMax: snapshot.maxKcal,
      note: `${options.servings} 份 · ${recipe.ingredients.map((item) => `${item.name}${item.weightG}g`).join('、')}`,
    })
  }

  function toggleRecipeFavorite(recipeId: string) {
    favoriteRecipeIds.value = favoriteRecipeIds.value.includes(recipeId)
      ? favoriteRecipeIds.value.filter((id) => id !== recipeId)
      : [...favoriteRecipeIds.value, recipeId]
  }

  function updateEntry(id: string, patch: Partial<FoodEntry>) {
    const index = entries.value.findIndex((entry) => entry.id === id)
    if (index < 0) return
    const next = { ...entries.value[index]!, ...patch }
    next.protein = calculateFoodProtein(next.estimatedWeight, next.proteinPer100g)
    entries.value[index] = next
  }

  function removeEntry(id: string) {
    entries.value = entries.value.filter((entry) => entry.id !== id)
  }

  function copyEntry(entry: FoodEntry, date = selectedDate.value) {
    addEntry({ ...entry, date, source: 'copied' })
  }

  function updateSettings(next: UserSettings) {
    settings.value = JSON.parse(JSON.stringify(next)) as UserSettings
  }

  function isTrainingDate(date: string) {
    return isTrainingDay(date, settings.value.trainingDays, trainingOverrides.value)
  }

  function targetByDate(date: string) {
    return getDailyTarget(date, settings.value, trainingOverrides.value)
  }

  function toggleTrainingDate(date: string) {
    const nextValue = !isTrainingDate(date)
    const recurringValue = isTrainingDay(date, settings.value.trainingDays)
    const nextOverrides = { ...trainingOverrides.value }
    if (nextValue === recurringValue) delete nextOverrides[date]
    else nextOverrides[date] = nextValue
    trainingOverrides.value = nextOverrides
  }

  function entriesByDate(date: string) { return entries.value.filter((entry) => entry.date === date) }
  function summaryByDate(date: string) {
    const daily = entriesByDate(date)
    return calculateDailySummary(targetByDate(date), daily.map((entry) => entry.protein))
  }

  watch(entries, (value) => localStorage.setItem('protein-daily.entries', JSON.stringify(value)), { deep: true })
  watch(settings, (value) => localStorage.setItem('protein-daily.settings', JSON.stringify(value)), { deep: true })
  watch(trainingOverrides, (value) => localStorage.setItem('protein-daily.training-overrides', JSON.stringify(value)), { deep: true })
  watch(favoriteRecipeIds, (value) => localStorage.setItem('protein-daily.recipe-favorites', JSON.stringify(value)), { deep: true })

  return {
    entries, settings, trainingOverrides, favoriteRecipeIds, selectedDate, entriesForDate, targetForDate, summaryForDate, powderSuggestion, nutritionForDate,
    addEntry, updateEntry, removeEntry, copyEntry, updateSettings, isTrainingDate, toggleTrainingDate,
    targetByDate, entriesByDate, summaryByDate, addRecipe, toggleRecipeFavorite,
  }
})
