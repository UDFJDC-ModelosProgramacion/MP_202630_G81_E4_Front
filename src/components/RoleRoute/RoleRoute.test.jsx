import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ROLES } from '../../config/currentUser'
import { UserProvider } from '../../context/UserContext'
import RoleRoute from './RoleRoute'

describe('RoleRoute', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('redirects to "/" when the active role is not allowed', () => {
    render(
      <MemoryRouter initialEntries={['/adoption-requests']}>
        <UserProvider initialRole={ROLES.ADOPTER}>
          <Routes>
            <Route path="/" element={<div>Inicio</div>} />
            <Route element={<RoleRoute allowedRoles={[ROLES.SHELTER]} />}>
              <Route path="/adoption-requests" element={<div>Gestión de solicitudes</div>} />
            </Route>
          </Routes>
        </UserProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Inicio')).toBeInTheDocument()
    expect(screen.queryByText('Gestión de solicitudes')).not.toBeInTheDocument()
  })

  it('renders nested outlet routes when the active role is allowed', () => {
    render(
      <MemoryRouter initialEntries={['/adoption-requests']}>
        <UserProvider initialRole={ROLES.SHELTER}>
          <Routes>
            <Route path="/" element={<div>Inicio</div>} />
            <Route element={<RoleRoute allowedRoles={[ROLES.SHELTER]} />}>
              <Route path="/adoption-requests" element={<div>Gestión de solicitudes</div>} />
            </Route>
          </Routes>
        </UserProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Gestión de solicitudes')).toBeInTheDocument()
    expect(screen.queryByText('Inicio')).not.toBeInTheDocument()
  })

  it('renders direct children when provided and role is allowed', () => {
    sessionStorage.setItem('pet_platform_role', ROLES.VET)

    render(
      <MemoryRouter>
        <UserProvider>
          <RoleRoute allowedRoles={[ROLES.VET]}>
            <div>Panel veterinario</div>
          </RoleRoute>
        </UserProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Panel veterinario')).toBeInTheDocument()
  })
})