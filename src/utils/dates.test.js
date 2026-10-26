import { describe, it, expect } from 'vitest'
import { formatShortDate, todayISO } from './dates'

describe('dates', () => {
  it('formats the local date as YYYY-MM-DD with leading zeros', () => {
    expect(todayISO(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('uses today by default', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('formats an ISO date as short text', () => {
    expect(formatShortDate('2026-10-21')).toBe('21 oct 2026')
    expect(formatShortDate('2026-01-05')).toBe('5 ene 2026')
  })
})
