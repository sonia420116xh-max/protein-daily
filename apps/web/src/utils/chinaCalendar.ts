import chineseDays from 'chinese-days'

export type ChinaCalendarStatus = 'holiday' | 'workday' | null

export interface ChinaCalendarDay {
  status: ChinaCalendarStatus
  name: string
}

export function getChinaCalendarDay(date: string): ChinaCalendarDay {
  const detail = chineseDays.getDayDetail(date)
  const [, chineseName] = detail.name.split(',')

  if (!chineseName) return { status: null, name: '' }

  return {
    status: detail.work ? 'workday' : 'holiday',
    name: chineseName,
  }
}
