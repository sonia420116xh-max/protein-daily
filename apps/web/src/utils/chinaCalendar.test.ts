import { describe, expect, it } from 'vitest'
import { getChinaCalendarDay } from './chinaCalendar'

describe('Chinese statutory calendar', () => {
  it('marks Spring Festival and National Day holidays', () => {
    expect(getChinaCalendarDay('2026-02-17')).toEqual({ status: 'holiday', name: '春节' })
    expect(getChinaCalendarDay('2026-10-01')).toEqual({ status: 'holiday', name: '国庆节' })
  })

  it('marks weekend makeup workdays with their related holiday', () => {
    expect(getChinaCalendarDay('2026-02-28')).toEqual({ status: 'workday', name: '春节' })
    expect(getChinaCalendarDay('2026-10-10')).toEqual({ status: 'workday', name: '国庆节' })
  })

  it('does not label an ordinary weekend as a statutory holiday', () => {
    expect(getChinaCalendarDay('2026-10-11')).toEqual({ status: null, name: '' })
  })
})
