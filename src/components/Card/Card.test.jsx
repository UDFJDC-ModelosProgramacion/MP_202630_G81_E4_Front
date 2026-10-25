import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card from './Card'

describe('Card', () => {
  it('shows the title and the content', () => {
    render(
      <Card title="Reseñas">
        <p>Contenido</p>
      </Card>,
    )
    expect(screen.getByRole('heading', { name: 'Reseñas' })).toBeInTheDocument()
    expect(screen.getByText('Contenido')).toBeInTheDocument()
  })

  it('works without a title', () => {
    render(
      <Card>
        <p>Solo contenido</p>
      </Card>,
    )
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })
})