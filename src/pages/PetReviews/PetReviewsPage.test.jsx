import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import PetReviewsPage from './PetReviewsPage'
import { createReview, getPet, getReviews } from '../../services/reviewService'

vi.mock('../../services/reviewService', () => ({
  getPet: vi.fn(),
  getReviews: vi.fn(),
  createReview: vi.fn(),
}))

const pet = {
  id: 1,
  name: 'Luna',
  breed: 'Labrador',
  age: '2 años',
  sex: 'Hembra',
  size: 'Mediano',
  status: 'Disponible para adopción',
}

const reviews = [{ id: 1, adopterName: 'María P.', rating: 5, comment: 'Muy cariñosa.' }]

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/pets/1/reviews']}>
      <Routes>
        <Route path="/pets/:petId/reviews" element={<PetReviewsPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PetReviewsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading and then the pet with its reviews', async () => {
    getPet.mockResolvedValue(pet)
    getReviews.mockResolvedValue(reviews)
    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent('Cargando...')
    expect(await screen.findByText('Reseñas de Luna (1)')).toBeInTheDocument()
    expect(screen.getByText('María P.')).toBeInTheDocument()
  })

  it('shows an error when the pet cannot be loaded', async () => {
    getPet.mockRejectedValue(new Error('fail'))
    getReviews.mockResolvedValue([])
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar la mascota.')
  })

  it('adds the new review to the list after sending it', async () => {
    getPet.mockResolvedValue(pet)
    getReviews.mockResolvedValue(reviews)
    createReview.mockResolvedValue({
      id: 2,
      adopterName: 'Carlos D.',
      rating: 4,
      comment: 'Me encantó',
    })
    renderPage()
    await screen.findByText('Reseñas de Luna (1)')

    await userEvent.click(screen.getByRole('button', { name: '4 de 5' }))
    await userEvent.type(screen.getByLabelText('Comentario *'), 'Me encantó')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar reseña' }))

    expect(await screen.findByText('Reseñas de Luna (2)')).toBeInTheDocument()
    expect(createReview).toHaveBeenCalledWith('1', { rating: 4, comment: 'Me encantó' })
  })
})