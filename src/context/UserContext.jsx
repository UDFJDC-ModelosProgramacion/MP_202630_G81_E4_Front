import { useState } from 'react'
import { CURRENT_USER, ROLES } from '../config/currentUser'
import { UserContext } from './useCurrentUser'

const VALID_ROLES = Object.values(ROLES)
const STORAGE_KEY = 'pet_platform_role'

export function UserProvider({ children, initialRole }) {
  const [role, setRoleState] = useState(() => {
    if (initialRole && VALID_ROLES.includes(initialRole)) {
      return initialRole
    }
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved && VALID_ROLES.includes(saved)) {
        return saved
      }
    } catch {
      // Ignorar si sessionStorage no está disponible
    }
    return CURRENT_USER.role
  })

  function setRole(nextRole) {
    if (!VALID_ROLES.includes(nextRole)) return
    setRoleState(nextRole)
    try {
      sessionStorage.setItem(STORAGE_KEY, nextRole)
    } catch {
      // Ignorar si sessionStorage no está disponible
    }
  }

  const user = { ...CURRENT_USER, role }

  return (
    <UserContext.Provider value={{ user, role, setRole }}>
      {children}
    </UserContext.Provider>
  )
}