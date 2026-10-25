import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ScreenState from './ScreenState'

describe('ScreenState', () => {
  it('shows the loading message', () => {
    render(<ScreenState state="loading" />)
    expect(screen.getByRole('status')).toHaveTextContent('Cargando...')
  })

  it('announces the error as an alert', () => {
    render(<ScreenState state="error" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('allows a custom message in the empty state', () => {
    render(<ScreenState state="empty" message="Aún no hay reseñas" />)
    expect(screen.getByText('Aún no hay reseñas')).toBeInTheDocument()
  })
})