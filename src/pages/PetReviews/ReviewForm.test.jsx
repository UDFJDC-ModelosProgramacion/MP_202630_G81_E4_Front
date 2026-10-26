import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReviewForm from './ReviewForm'

describe('ReviewForm', () => {
  it('shows validation errors and does not submit an empty form', async () => {
    const onSubmit = vi.fn()
    render(<ReviewForm petName="Luna" onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole('button', { name: 'Enviar reseña' }))

    expect(
      screen.getByText('La calificación debe ser un número entero entre 1 y 5.'),
    ).toBeInTheDocument()
    expect(screen.getByText('El comentario es obligatorio.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits a valid review and clears the form', async () => {
    const onSubmit = vi.fn().mockResolvedValue()
    render(<ReviewForm petName="Luna" onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole('button', { name: '4 de 5' }))
    await userEvent.type(screen.getByLabelText('Comentario *'), 'Muy buena compañera')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar reseña' }))

    expect(onSubmit).toHaveBeenCalledWith({ rating: 4, comment: 'Muy buena compañera' })
    expect(await screen.findByText('Reseña enviada. ¡Gracias!')).toBeInTheDocument()
    expect(screen.getByLabelText('Comentario *')).toHaveValue('')
  })

  it('shows an error message when sending fails', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('fail'))
    render(<ReviewForm petName="Luna" onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole('button', { name: '3 de 5' }))
    await userEvent.type(screen.getByLabelText('Comentario *'), 'Hola')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar reseña' }))

    expect(
      await screen.findByText('No se pudo enviar la reseña. Inténtalo de nuevo.'),
    ).toBeInTheDocument()
  })

  it('clears the form when cancelling', async () => {
    render(<ReviewForm petName="Luna" onSubmit={vi.fn()} />)

    await userEvent.type(screen.getByLabelText('Comentario *'), 'Texto')
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.getByLabelText('Comentario *')).toHaveValue('')
  })
})