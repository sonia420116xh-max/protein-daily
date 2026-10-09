import type { UserSettings } from '@protein-daily/shared'

export const todayIso = new Intl.DateTimeFormat('en-CA', {
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date())

export const defaultSettings: UserSettings = {
  weight: 50,
  normalTarget: 80,
  trainingTarget: 85,
  trainingDays: [2, 4, 6],
  powder: { servingWeight: 30, proteinPerServing: 24 },
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
}
