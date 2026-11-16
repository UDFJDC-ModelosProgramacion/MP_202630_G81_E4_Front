import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { UserProvider } from '../../context/UserContext'
import Navbar from './Navbar'

describe('Navbar', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('shows the platform name and the adopter links by default', () => {
    render(
      <MemoryRouter>
        <UserProvider>
          <Navbar />
        </UserProvider>
      </MemoryRouter>,
    )
    expect(screen.getByText('Pet Adoption Platform')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mascotas' })).toHaveAttribute('href', '/pets')
    expect(screen.getByRole('link', { name: 'Solicitar adopción' })).toHaveAttribute(
      'href',
      '/adoptions/new',
    )
    expect(screen.getByRole('link', { name: 'Solicitar periodo de prueba' })).toHaveAttribute(
      'href',
      '/trial-requests/new',
    )
    expect(screen.getByRole('link', { name: 'Notificaciones' })).toHaveAttribute(
      'href',
      '/notifications',
    )
    expect(screen.queryByRole('link', { name: 'Refugios' })).not.toBeInTheDocument()
  })

  it('shows the links to messages and the adopter profile', () => {
    render(
      <MemoryRouter>
        <UserProvider>
          <Navbar />
        </UserProvider>
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Mensajes' })).toHaveAttribute('href', '/messages')
    expect(screen.getByRole('link', { name: 'Mi perfil' })).toHaveAttribute('href', '/profile')
  })

  it('updates navigation links when switching to shelter or vet roles', () => {
    render(
      <MemoryRouter>
        <UserProvider>
          <Navbar />
        </UserProvider>
      </MemoryRouter>,
    )

    const roleSelect = screen.getByLabelText('Rol')

    fireEvent.change(roleSelect, { target: { value: 'SHELTER' } })
    expect(screen.getByRole('link', { name: 'Solicitudes' })).toHaveAttribute(
      'href',
      '/adoption-requests',
    )
    expect(screen.getByRole('link', { name: 'Gestionar periodos' })).toHaveAttribute(
      'href',
      '/trial-requests',
    )
    expect(screen.getByRole('link', { name: 'Refugios' })).toHaveAttribute('href', '/shelters')
    expect(screen.getByRole('link', { name: 'Enviar notificación' })).toHaveAttribute(
      'href',
      '/notifications/new',
    )
    expect(screen.queryByRole('link', { name: 'Mi perfil' })).not.toBeInTheDocument()

    fireEvent.change(roleSelect, { target: { value: 'VET' } })
    expect(screen.getByRole('link', { name: 'Mascotas' })).toHaveAttribute('href', '/pets')
    expect(screen.getByRole('link', { name: 'Seguimientos' })).toHaveAttribute(
      'href',
      '/follow-ups',
    )
    expect(screen.queryByRole('link', { name: 'Refugios' })).not.toBeInTheDocument()
  })
})