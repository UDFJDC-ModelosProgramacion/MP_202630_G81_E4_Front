import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from './HomePage'
import { getShelters } from '../../services/shelterService'
import { getReviews } from '../../services/reviewService'

vi.mock('../../services/shelterService', () => ({
  getShelters: vi.fn(),
}))

vi.mock('../../services/reviewService', () => ({
  getReviews: vi.fn(),
}))

const MOCK_SHELTERS = [
  {
    id: 1,
    nit: '900123456-1',
    name: 'Huellas Felices',
    address: 'Calle 72 #10-25, Bogotá',
    phone: '3105551234',
    capacity: 40,
    email: 'contacto@huellasfelices.org',
  },
  {
    id: 2,
    nit: '900987654-2',
    name: 'Patitas del Norte',
    address: 'Av. Caracas #150-30, Bogotá',
    phone: '3115555678',
    capacity: 25,
    email: 'info@patitasnorte.org',
  },
  {
    id: 3,
    nit: '900555111-3',
    name: 'Refugio Esperanza',
    address: 'Calle 100 #15-40, Bogotá',
    phone: '3205559012',
    capacity: 60,
    email: 'esperanza@refugio.org',
  },
]

const MOCK_REVIEWS = [
  {
    id: 1,
    adopterName: 'María P.',
    rating: 5,
    comment: 'Muy cariñosa y tranquila. Se adaptó rápido a casa.',
  },
  {
    id: 2,
    adopterName: 'Julián R.',
    rating: 4,
    comment: 'Buena con los niños, solo necesita paseos largos.',
  },
  {
    id: 3,
    adopterName: 'Sofía M.',
    rating: 5,
    comment: 'La mejor decisión. Totalmente recomendada.',
  },
]

function renderHome() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getShelters.mockResolvedValue([])
    getReviews.mockResolvedValue([])
  })

  it('muestra el mensaje principal y los accesos rápidos', async () => {
    renderHome()

    expect(
      screen.getByRole('heading', {
        name: /encuentra a tu próximo compañero de vida/i,
      }),
    ).toBeInTheDocument()

    const hrefs = screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'))

    expect(hrefs).toContain('/pets')
    expect(hrefs).toContain('/adoptions/new')
    expect(hrefs).toContain('/shelters')
    expect(hrefs).toContain('/adoption-requests')
    expect(hrefs).toContain('/trial-requests/new')
    expect(hrefs).toContain('/follow-ups')

    await screen.findByText('No hay refugios registrados todavía.')
    await screen.findByText('Aún no hay reseñas publicadas.')
  })

  it('carga y muestra los refugios destacados', async () => {
    getShelters.mockResolvedValue(MOCK_SHELTERS)
    renderHome()

    await waitFor(() => {
      expect(screen.getByText('Huellas Felices')).toBeInTheDocument()
    })
    expect(screen.getByText('Patitas del Norte')).toBeInTheDocument()
    expect(screen.getByText('Refugio Esperanza')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /ver todos los refugios/i }),
    ).toHaveAttribute('href', '/shelters')
  })

  it('carga y muestra las reseñas de los adoptantes', async () => {
    getReviews.mockResolvedValue(MOCK_REVIEWS)
    renderHome()

    await waitFor(() => {
      expect(screen.getByText('María P.')).toBeInTheDocument()
    })
    expect(screen.getByText('Julián R.')).toBeInTheDocument()
    expect(screen.getAllByLabelText('5 de 5').length).toBeGreaterThan(0)
    expect(
      screen.getByRole('link', { name: /ver reseñas de la mascota/i }),
    ).toHaveAttribute('href', '/pets/1/reviews')
  })

  it('muestra un estado de error cuando falla la carga de refugios', async () => {
    getShelters.mockRejectedValue(
      new Error('No fue posible conectar con el servidor.'),
    )
    renderHome()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No fue posible conectar con el servidor.',
    )
    await screen.findByText('Aún no hay reseñas publicadas.')
  })
})
