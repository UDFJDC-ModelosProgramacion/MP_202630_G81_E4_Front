// MOCK service: data lives in memory. When the Front connects to the Back,
// replace the body of each function with a fetch('/api/users') call and keep
// the same function names, so the pages do not change.

const USERS = [
  { id: 12, name: 'María Gómez' },
  { id: 7, name: 'Carlos Ruiz' },
  { id: 8, name: 'Ana Torres', organization: 'Refugio Esperanza' },
]

export async function listUsers() {
  return USERS.map((user) => ({ ...user }))
}

// 'Ana Torres (Refugio Esperanza)' or just 'Carlos Ruiz'
export function userLabel(user) {
  return user.organization ? `${user.name} (${user.organization})` : user.name
}
