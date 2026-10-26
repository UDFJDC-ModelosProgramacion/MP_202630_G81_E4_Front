import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ReviewList from './ReviewList'

const reviews = [
  { id: 1, adopterName: 'María P.', rating: 5, comment: 'Muy cariñosa.' },
  { id: 2, adopterName: 'Julián R.', rating: 4, comment: 'Buena con los niños.' },
]

describe('ReviewList', () => {
  it('shows the total and each review', () => {
    render(<ReviewList petName="Luna" reviews={reviews} />)
    expect(screen.getByText('Reseñas de Luna (2)')).toBeInTheDocument()
    expect(screen.getByText('María P.')).toBeInTheDocument()
    expect(screen.getByText('Buena con los niños.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '5 de 5' })).toBeInTheDocument()
  })

  it('shows an empty message when there are no reviews', () => {
    render(<ReviewList petName="Luna" reviews={[]} />)
    expect(screen.getByText('Reseñas de Luna (0)')).toBeInTheDocument()
    expect(screen.getByText('Aún no hay reseñas para esta mascota.')).toBeInTheDocument()
  })
})