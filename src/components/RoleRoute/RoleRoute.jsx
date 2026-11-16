import { Navigate, Outlet } from 'react-router-dom'
import { useCurrentUser } from '../../context/useCurrentUser'

export default function RoleRoute({ allowedRoles, children }) {
  const { role } = useCurrentUser()

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />
  }

  return children ?? <Outlet />
}