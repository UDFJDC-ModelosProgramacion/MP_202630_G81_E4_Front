// MOCK service: data lives in memory. When the Front connects to the Back,
// replace the body of each function with a fetch('/api/users') call and keep
// the same function names, so the pages do not change.
import { api } from './apiClient'

export async function listUsers() {
  const users = await api.get('/users')
  return users.map((user) => ({ id: user.id, name: user.name }))
}

// 'Ana Torres (Refugio Esperanza)' or just 'Carlos Ruiz'
export function userLabel(user) {
  return user.organization ? `${user.name} (${user.organization})` : user.name
}