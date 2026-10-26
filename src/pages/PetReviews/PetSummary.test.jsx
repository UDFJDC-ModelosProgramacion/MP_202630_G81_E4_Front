import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PetSummary from './PetSummary'

const pet = {
  name: 'Luna',
  breed: 'Labrador',
  age: '2 años',
  sex: 'Hembra',
  size: 'Mediano',
  status: 'Disponible para adopción',
}

describe('PetSummary', () => {
  it('shows the pet data', () => {
    render(<PetSummary pet={pet} />)
    expect(screen.getByText('Luna')).toBeInTheDocument()
    expect(screen.getByText('Labrador · 2 años · Hembra · Mediano')).toBeInTheDocument()
    expect(screen.getByText('Estado: Disponible para adopción')).toBeInTheDocument()
  })
})