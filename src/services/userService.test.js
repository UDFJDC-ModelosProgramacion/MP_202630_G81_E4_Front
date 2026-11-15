import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from './apiClient'
import { listUsers, userLabel } from './userService'

vi.mock('./apiClient', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists the users of the back with their id and name', async () => {
    api.get.mockResolvedValue([
      { id: 1, name: 'María Gómez', phone: '300 000 0000' },
      { id: 2, name: 'Carlos Ruiz', phone: '311 000 0000' },
    ])

    expect(await listUsers()).toEqual([
      { id: 1, name: 'María Gómez' },
      { id: 2, name: 'Carlos Ruiz' },
    ])
    expect(api.get).toHaveBeenCalledWith('/users')
  })

  it('lets the error of the back reach the screen', async () => {
    api.get.mockRejectedValue(new Error('fail'))

    await expect(listUsers()).rejects.toThrow('fail')
  })

  it('shows the organization next to the name when there is one', () => {
    expect(userLabel({ name: 'Ana Torres', organization: 'Refugio Esperanza' })).toBe(
      'Ana Torres (Refugio Esperanza)',
    )
  })

  it('shows only the name when there is no organization', () => {
    expect(userLabel({ name: 'Carlos Ruiz' })).toBe('Carlos Ruiz')
  })
})