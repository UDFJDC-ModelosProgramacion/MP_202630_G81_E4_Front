import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotificationForm from './NotificationForm'

const recipients = [
  { value: '5', label: 'Carlos Pérez' },
  { value: '6', label: 'Ana Ruiz' },
]

async function fillForm({ pet = '' } = {}) {
  await userEvent.selectOptions(screen.getByLabelText('Destinatario *'), '5')
  await userEvent.selectOptions(screen.getByLabelText('Canal *'), 'email')
  await userEvent.type(screen.getByLabelText('Adopción *'), '12')
  if (pet) {
    await userEvent.type(screen.getByLabelText('Mascota (opcional)'), pet)
  }
  await userEvent.type(screen.getByLabelText('Contenido *'), 'Tu solicitud fue aprobada')
}

describe('NotificationForm', () => {
  it('reports the missing fields and does not submit an empty form', async () => {
    const onSubmit = vi.fn()
    render(<NotificationForm recipients={recipients} onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole('button', { name: 'Enviar notificación' }))

    expect(screen.getByText('Selecciona un destinatario.')).toBeInTheDocument()
    expect(screen.getByText('Selecciona un canal válido (correo, SMS o push).')).toBeInTheDocument()
    expect(
      screen.getByText('Indica la adopción asociada con un número entero positivo.'),
    ).toBeInTheDocument()
    expect(screen.getByText('El contenido es obligatorio.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejects a pet that is not a positive integer', async () => {
    const onSubmit = vi.fn()
    render(<NotificationForm recipients={recipients} onSubmit={onSubmit} />)

    await fillForm({ pet: '-3' })
    await userEvent.click(screen.getByRole('button', { name: 'Enviar notificación' }))

    expect(screen.getByText('La mascota debe ser un número entero positivo.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the values, confirms it and clears the form', async () => {
    const onSubmit = vi.fn().mockResolvedValue()
    render(<NotificationForm recipients={recipients} onSubmit={onSubmit} />)

    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Enviar notificación' }))

    expect(onSubmit).toHaveBeenCalledWith({
      userId: '5',
      adoptionId: '12',
      petId: '',
      channel: 'email',
      content: 'Tu solicitud fue aprobada',
    })
    expect(await screen.findByText('Notificación enviada.')).toBeInTheDocument()
    expect(screen.getByLabelText('Contenido *')).toHaveValue('')
  })

  it('submits the pet when one is given', async () => {
    const onSubmit = vi.fn().mockResolvedValue()
    render(<NotificationForm recipients={recipients} onSubmit={onSubmit} />)

    await fillForm({ pet: '2' })
    await userEvent.click(screen.getByRole('button', { name: 'Enviar notificación' }))

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ petId: '2' }))
  })

  it('shows the error reported when sending fails', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('El canal no es válido'))
    render(<NotificationForm recipients={recipients} onSubmit={onSubmit} />)

    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Enviar notificación' }))

    expect(await screen.findByText('El canal no es válido')).toBeInTheDocument()
  })

  it('clears the form when cancelling', async () => {
    render(<NotificationForm recipients={recipients} onSubmit={vi.fn()} />)

    await userEvent.type(screen.getByLabelText('Contenido *'), 'Texto')
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.getByLabelText('Contenido *')).toHaveValue('')
  })
})