import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import {
  calculateDailySummary,
  calculateFoodProtein,
  calculatePowderSuggestion,
  getDailyTarget,
  type FoodEntry,
  type UserSettings,
} from '@protein-daily/shared'
import { defaultSettings, initialEntries, todayIso } from '@/data/mock'

const readStored = <T>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch { return fallback }
}

export const useNutritionStore = defineStore('nutrition', () => {
  const entries = ref<FoodEntry[]>(readStored('protein-daily.entries', initialEntries))
  const settings = ref<UserSettings>(readStored('protein-daily.settings', defaultSettings))
  const selectedDate = ref(todayIso)

  const entriesForDate = computed(() => entries.value.filter((entry) => entry.date === selectedDate.value))
  const targetForDate = computed(() => getDailyTarget(selectedDate.value, settings.value))
  const summaryForDate = computed(() => calculateDailySummary(targetForDate.value, entriesForDate.value.map((entry) => entry.protein)))
  const powderSuggestion = computed(() => calculatePowderSuggestion(summaryForDate.value.remaining, settings.value.powder))

  function addEntry(input: Omit<FoodEntry, 'id' | 'protein' | 'createdAt'>) {
    entries.value.unshift({
      ...input,
      id: crypto.randomUUID(),
      protein: calculateFoodProtein(input.estimatedWeight, input.proteinPer100g),
      createdAt: new Date().toISOString(),
    })
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

  function updateSettings(next: UserSettings) { settings.value = structuredClone(next) }

  function entriesByDate(date: string) { return entries.value.filter((entry) => entry.date === date) }
  function summaryByDate(date: string) {
    const daily = entriesByDate(date)
    return calculateDailySummary(getDailyTarget(date, settings.value), daily.map((entry) => entry.protein))
  }

  watch(entries, (value) => localStorage.setItem('protein-daily.entries', JSON.stringify(value)), { deep: true })
  watch(settings, (value) => localStorage.setItem('protein-daily.settings', JSON.stringify(value)), { deep: true })

  return {
    entries, settings, selectedDate, entriesForDate, targetForDate, summaryForDate, powderSuggestion,
    addEntry, updateEntry, removeEntry, copyEntry, updateSettings, entriesByDate, summaryByDate,
  }
})
