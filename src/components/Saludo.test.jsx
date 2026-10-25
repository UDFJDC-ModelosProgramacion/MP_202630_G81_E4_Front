import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Saludo from './Saludo'

describe('Saludo', () => {
  it('muestra el nombre recibido', () => {
    render(<Saludo nombre="Sergio" />)
    expect(screen.getByText('Hola, Sergio')).toBeInTheDocument()
  })
})