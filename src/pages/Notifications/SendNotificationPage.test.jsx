import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SendNotificationPage from './SendNotificationPage'
import { createNotification } from '../../services/notificationService'
import { listUsers } from '../../services/userService'

vi.mock('../../services/notificationService', () => ({
  createNotification: vi.fn(),
}))

vi.mock('../../services/userService', () => ({
  listUsers: vi.fn(),
  userLabel: (user) => user.name,
}))

const users = [
  { id: 5, name: 'Carlos Pérez' },
  { id: 6, name: 'Ana Ruiz' },
]

describe('SendNotificationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading and then the form with the recipients', async () => {
    listUsers.mockResolvedValue(users)
    render(<SendNotificationPage />)

    expect(screen.getByRole('status')).toHaveTextContent('Cargando...')
    expect(await screen.findByRole('heading', { name: 'Enviar notificación' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Carlos Pérez' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Ana Ruiz' })).toBeInTheDocument()
  })

  it('shows an error when the users cannot be loaded', async () => {
    listUsers.mockRejectedValue(new Error('fail'))
    render(<SendNotificationPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar los usuarios.')
  })

  it('sends the notification typed in the form', async () => {
    listUsers.mockResolvedValue(users)
    createNotification.mockResolvedValue({ id: 1 })
    render(<SendNotificationPage />)
    await screen.findByRole('heading', { name: 'Enviar notificación' })

    await userEvent.selectOptions(screen.getByLabelText('Destinatario *'), '6')
    await userEvent.selectOptions(screen.getByLabelText('Canal *'), 'sms')
    await userEvent.type(screen.getByLabelText('Adopción *'), '12')
    await userEvent.type(screen.getByLabelText('Contenido *'), 'Seguimiento mañana')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar notificación' }))

    expect(await screen.findByText('Notificación enviada.')).toBeInTheDocument()
    expect(createNotification).toHaveBeenCalledWith({
      userId: '6',
      adoptionId: '12',
      petId: '',
      channel: 'sms',
      content: 'Seguimiento mañana',
    })
  })
})