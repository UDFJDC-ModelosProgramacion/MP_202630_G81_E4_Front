import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from './Navbar'

describe('Navbar', () => {
  it('shows the platform name and the main links', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    )
    expect(screen.getByText('Pet Adoption Platform')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mascotas' })).toHaveAttribute('href', '/pets')
    expect(screen.getByRole('link', { name: 'Adopciones' })).toHaveAttribute('href', '/adoptions')
    expect(screen.getByRole('link', { name: 'Refugios' })).toHaveAttribute('href', '/shelters')
    expect(screen.getByRole('link', { name: 'Notificaciones' })).toHaveAttribute(
      'href',
      '/notifications',
    )
  })

  it('shows the links to messages and the adopter profile', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Mensajes' })).toHaveAttribute('href', '/messages')
    expect(screen.getByRole('link', { name: 'Mi perfil' })).toHaveAttribute('href', '/profile')
  })
})