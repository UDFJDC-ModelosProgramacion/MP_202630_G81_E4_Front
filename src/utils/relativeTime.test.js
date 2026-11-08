import { describe, it, expect } from 'vitest'
import { formatRelativeTime } from './relativeTime'

const now = new Date('2026-11-07T12:00:00.000Z')
const ago = (milliseconds) => new Date(now.getTime() - milliseconds).toISOString()
const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE

describe('formatRelativeTime', () => {
  it('says "Hace un momento" for less than a minute', () => {
    expect(formatRelativeTime(ago(20 * 1000), now)).toBe('Hace un momento')
  })

  it('uses minutes under an hour', () => {
    expect(formatRelativeTime(ago(10 * MINUTE), now)).toBe('Hace 10 min')
  })

  it('uses singular for one hour', () => {
    expect(formatRelativeTime(ago(HOUR), now)).toBe('Hace 1 hora')
  })

  it('uses plural for several hours', () => {
    expect(formatRelativeTime(ago(3 * HOUR), now)).toBe('Hace 3 horas')
  })

  it('says "Ayer" for one day', () => {
    expect(formatRelativeTime(ago(26 * HOUR), now)).toBe('Ayer')
  })

  it('uses days for several days', () => {
    expect(formatRelativeTime(ago(50 * HOUR), now)).toBe('Hace 2 días')
  })

  it('treats a future date as just now', () => {
    expect(formatRelativeTime(ago(-5 * MINUTE), now)).toBe('Hace un momento')
  })
})