import { describe, it, expect } from 'vitest'
import { listUsers, userLabel } from './userService'

describe('userService', () => {
  it('lists the users', async () => {
    const users = await listUsers()
    expect(users).toHaveLength(3)
    expect(users[0].name).toBe('María Gómez')
  })

  it('shows the organization next to the name when there is one', () => {
    expect(userLabel({ id: 8, name: 'Ana Torres', organization: 'Refugio Esperanza' })).toBe(
      'Ana Torres (Refugio Esperanza)',
    )
    expect(userLabel({ id: 7, name: 'Carlos Ruiz' })).toBe('Carlos Ruiz')
  })
})
