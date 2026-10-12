import type { UserSettings } from '@protein-daily/shared'

export const todayIso = new Intl.DateTimeFormat('en-CA', {
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date())

export const defaultSettings: UserSettings = {
  weight: 45,
  height: null,
  bodyFatPercentage: null,
  waist: null,
  hips: null,
  chest: null,
  profileVersion: 1,
  normalTarget: 81,
  trainingTarget: 90,
  trainingDays: [2, 4, 6],
  powder: { servingWeight: 30, proteinPerServing: 24 },
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
}
