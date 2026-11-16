import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

vi.mock('./services/shelterService', () => ({
  getShelters: vi.fn().mockResolvedValue([]),
}))

vi.mock('./services/reviewService', () => ({
  getReviews: vi.fn().mockResolvedValue([]),
}))

describe('App', () => {
  it('shows the navbar and the home page of the current route', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByText('Pet Adoption Platform')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: /encuentra a tu próximo compañero de vida/i,
      }),
    ).toBeInTheDocument()
    await screen.findByText('No hay refugios registrados todavía.')
  })
})
