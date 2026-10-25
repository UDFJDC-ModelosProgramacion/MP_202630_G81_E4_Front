import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from './Button'

describe('Button', () => {
  it('shows its text and reacts to clicks', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Guardar</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not react to clicks when disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Eliminar
      </Button>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('accepts a different variant', () => {
    render(<Button variant="danger">Eliminar</Button>)
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument()
  })
})