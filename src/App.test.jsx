import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

describe('App', () => {
  it('shows the navbar and the page of the current route', () => {
    render(
      <MemoryRouter initialEntries={['/notifications']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByText('Pet Adoption Platform')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Notificaciones (pendiente)' })).toBeInTheDocument()
  })
})