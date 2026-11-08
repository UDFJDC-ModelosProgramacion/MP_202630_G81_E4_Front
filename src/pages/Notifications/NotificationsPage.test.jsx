import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotificationsPage from './NotificationsPage'
import { CURRENT_USER } from '../../config/currentUser'
import {
  deleteNotification,
  listNotifications,
  markAsRead,
} from '../../services/notificationService'

vi.mock('../../services/notificationService', () => ({
  listNotifications: vi.fn(),
  markAsRead: vi.fn(),
  deleteNotification: vi.fn(),
}))

const DATE = '2026-01-01T10:00:00.000Z'

const notifications = [
  {
    id: 1,
    channel: 'email',
    content: 'Solicitud aprobada',
    date: DATE,
    read: false,
    adoption: { id: 12 },
    pet: null,
  },
  {
    id: 2,
    channel: 'push',
    content: 'Periodo de prueba por finalizar',
    date: DATE,
    read: false,
    adoption: null,
    pet: { id: 2, name: 'Max' },
  },
  {
    id: 3,
    channel: 'sms',
    content: 'Seguimiento programado',
    date: DATE,
    read: true,
    adoption: { id: 12 },
    pet: null,
  },
  {
    id: 4,
    channel: 'push',
    content: 'Reseña registrada',
    date: DATE,
    read: true,
    adoption: null,
    pet: { id: 1, name: 'Luna' },
  },
]

async function renderLoadedPage(list = notifications) {
  listNotifications.mockResolvedValue(list)
  render(<NotificationsPage />)
  await screen.findByText('HU16 · Mis notificaciones')
}

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading and then the notifications of the current user', async () => {
    listNotifications.mockResolvedValue(notifications)
    render(<NotificationsPage />)

    expect(screen.getByRole('status')).toHaveTextContent('Cargando...')
    expect(await screen.findByText('Solicitud aprobada')).toBeInTheDocument()
    expect(screen.getByText('Reseña registrada')).toBeInTheDocument()
    expect(listNotifications).toHaveBeenCalledWith(CURRENT_USER.userId)
  })

  it('shows an error when the notifications cannot be loaded', async () => {
    listNotifications.mockRejectedValue(new Error('fail'))
    render(<NotificationsPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudieron cargar las notificaciones.',
    )
  })

  it('shows a message when there are no notifications', async () => {
    await renderLoadedPage([])
    expect(screen.getByText('No hay notificaciones en esta vista.')).toBeInTheDocument()
  })

  it('filters the unread notifications', async () => {
    await renderLoadedPage()

    await userEvent.click(screen.getByRole('button', { name: 'No leídas' }))

    expect(screen.getByText('Solicitud aprobada')).toBeInTheDocument()
    expect(screen.getByText('Periodo de prueba por finalizar')).toBeInTheDocument()
    expect(screen.queryByText('Seguimiento programado')).not.toBeInTheDocument()
    expect(screen.queryByText('Reseña registrada')).not.toBeInTheDocument()
  })

  it('filters the notifications associated to an adoption', async () => {
    await renderLoadedPage()

    await userEvent.click(screen.getByRole('button', { name: 'Por adopción' }))

    expect(screen.getByText('Solicitud aprobada')).toBeInTheDocument()
    expect(screen.getByText('Seguimiento programado')).toBeInTheDocument()
    expect(screen.queryByText('Periodo de prueba por finalizar')).not.toBeInTheDocument()
  })

  it('filters the notifications associated to a pet', async () => {
    await renderLoadedPage()

    await userEvent.click(screen.getByRole('button', { name: 'Por mascota' }))

    expect(screen.getByText('Periodo de prueba por finalizar')).toBeInTheDocument()
    expect(screen.getByText('Reseña registrada')).toBeInTheDocument()
    expect(screen.queryByText('Solicitud aprobada')).not.toBeInTheDocument()
  })

  it('shows an empty message when the filter has no results', async () => {
    await renderLoadedPage([notifications[2], notifications[3]])

    await userEvent.click(screen.getByRole('button', { name: 'No leídas' }))

    expect(screen.getByText('No hay notificaciones en esta vista.')).toBeInTheDocument()
  })

  it('marks a notification as read', async () => {
    await renderLoadedPage()
    markAsRead.mockResolvedValue({ ...notifications[0], read: true })

    await userEvent.click(
      screen.getByRole('button', { name: 'Marcar como leída: Solicitud aprobada' }),
    )

    expect(await screen.findByText('Notificación marcada como leída.')).toBeInTheDocument()
    expect(markAsRead).toHaveBeenCalledWith(1, CURRENT_USER.userId)
    expect(
      screen.queryByRole('button', { name: 'Marcar como leída: Solicitud aprobada' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eliminar: Solicitud aprobada' })).toBeEnabled()
  })

  it('shows the error when marking as read fails', async () => {
    await renderLoadedPage()
    markAsRead.mockRejectedValue(
      new Error('Solo el usuario destinatario puede marcar la notificación como leída.'),
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Marcar como leída: Solicitud aprobada' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Solo el usuario destinatario puede marcar la notificación como leída.',
    )
  })

  it('deletes a read notification', async () => {
    await renderLoadedPage()
    deleteNotification.mockResolvedValue()

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar: Seguimiento programado' }))

    expect(await screen.findByText('Notificación eliminada.')).toBeInTheDocument()
    expect(screen.queryByText('Seguimiento programado')).not.toBeInTheDocument()
    expect(deleteNotification).toHaveBeenCalledWith(3, CURRENT_USER.userId)
  })

  it('shows the error when deleting fails', async () => {
    await renderLoadedPage()
    deleteNotification.mockRejectedValue(new Error('Notificación no encontrada'))

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar: Seguimiento programado' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Notificación no encontrada')
    expect(screen.getByText('Seguimiento programado')).toBeInTheDocument()
  })

  it('clears the message when changing the filter', async () => {
    await renderLoadedPage()
    deleteNotification.mockResolvedValue()

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar: Seguimiento programado' }))
    await screen.findByText('Notificación eliminada.')
    await userEvent.click(screen.getByRole('button', { name: 'Por mascota' }))

    expect(screen.queryByText('Notificación eliminada.')).not.toBeInTheDocument()
  })
})