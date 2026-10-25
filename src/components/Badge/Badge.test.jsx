import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from './Badge'

describe('Badge', () => {
  it('shows its content', () => {
    render(<Badge tone="success">Leída</Badge>)
    expect(screen.getByText('Leída')).toBeInTheDocument()
  })

  it('uses the neutral tone by default', () => {
    render(<Badge>Correo</Badge>)
    expect(screen.getByText('Correo')).toBeInTheDocument()
  })
})