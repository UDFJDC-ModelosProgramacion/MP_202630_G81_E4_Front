import { createContext, useContext } from 'react'
import { CURRENT_USER } from '../config/currentUser'

const DEFAULT_CONTEXT = {
  user: CURRENT_USER,
  role: CURRENT_USER.role,
  setRole: () => {},
}

export const UserContext = createContext(DEFAULT_CONTEXT)

export function useCurrentUser() {
  return useContext(UserContext)
}