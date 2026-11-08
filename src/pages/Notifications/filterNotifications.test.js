import { describe, it, expect } from 'vitest'
import { filterNotifications } from './filterNotifications'

const notifications = [
  { id: 1, read: false, adoption: { id: 12 }, pet: null },
  { id: 2, read: false, adoption: null, pet: { id: 2 } },
  { id: 3, read: true, adoption: { id: 12 }, pet: null },
  { id: 4, read: true, adoption: null, pet: { id: 1 } },
]

const ids = (list) => list.map((notification) => notification.id)

describe('filterNotifications', () => {
  it('returns everything for "all"', () => {
    expect(ids(filterNotifications(notifications, 'all'))).toEqual([1, 2, 3, 4])
  })

  it('returns only the unread ones for "unread"', () => {
    expect(ids(filterNotifications(notifications, 'unread'))).toEqual([1, 2])
  })

  it('returns only those with an adoption for "adoption"', () => {
    expect(ids(filterNotifications(notifications, 'adoption'))).toEqual([1, 3])
  })

  it('returns only those with a pet for "pet"', () => {
    expect(ids(filterNotifications(notifications, 'pet'))).toEqual([2, 4])
  })
})