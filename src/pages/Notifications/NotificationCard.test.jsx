import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotificationCard from './NotificationCard'

const unread = {
  id: 1,
  channel: 'email',
  content: 'Tu solicitud de adopción de Luna fue aprobada',
  date: new Date().toISOString(),
  read: false,
  adoption: { id: 12 },
  pet: null,
}

const read = {
  id: 3,
  channel: 'sms',
  content: 'Recordatorio: seguimiento veterinario programado',
  date: new Date().toISOString(),
  read: true,
  adoption: null,
  pet: { id: 2, name: 'Max' },
}

function renderCard(notification, handlers = {}) {
  return render(
    <ul>
      <NotificationCard
        notification={notification}
        onMarkAsRead={handlers.onMarkAsRead ?? vi.fn()}
        onDelete={handlers.onDelete ?? vi.fn()}
      />
    </ul>,
  )
}

describe('NotificationCard', () => {
  it('shows an unread notification with its data and a disabled delete button', () => {
    renderCard(unread)

    expect(screen.getByText(unread.content)).toBeInTheDocument()
    expect(screen.getByText('Correo')).toBeInTheDocument()
    expect(screen.getByText('No leída')).toBeInTheDocument()
    expect(screen.getByText('Hace un momento · Adopción #12')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: `Eliminar: ${unread.content}` })).toBeDisabled()
    expect(
      screen.getByText('Solo se puede eliminar una notificación leída'),
    ).toBeInTheDocument()
  })

  it('calls onMarkAsRead with the notification', async () => {
    const onMarkAsRead = vi.fn()
    renderCard(unread, { onMarkAsRead })

    await userEvent.click(
      screen.getByRole('button', { name: `Marcar como leída: ${unread.content}` }),
    )

    expect(onMarkAsRead).toHaveBeenCalledWith(unread)
  })

  it('shows a read notification with an enabled delete button and no mark button', async () => {
    const onDelete = vi.fn()
    renderCard(read, { onDelete })

    expect(screen.getByText('SMS')).toBeInTheDocument()
    expect(screen.getByText('Leída')).toBeInTheDocument()
    expect(screen.getByText('Hace un momento · Mascota: Max')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Marcar como leída/ })).not.toBeInTheDocument()
    expect(
      screen.queryByText('Solo se puede eliminar una notificación leída'),
    ).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: `Eliminar: ${read.content}` }))

    expect(onDelete).toHaveBeenCalledWith(read)
  })

  it('shows an unknown channel as it comes', () => {
    renderCard({ ...unread, channel: 'telegram' })
    expect(screen.getByText('telegram')).toBeInTheDocument()
  })

  it('shows only the time when there is no adoption or pet', () => {
    renderCard({ ...unread, adoption: null, pet: null })
    expect(screen.getByText('Hace un momento')).toBeInTheDocument()
  })
})