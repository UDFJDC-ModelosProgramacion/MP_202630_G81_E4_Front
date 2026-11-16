import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createMessage,
  deleteMessage,
  listMessages,
  markAsRead,
  updateMessage,
} from '../../services/messageService'
import { listUsers } from '../../services/userService'
import MessagesPage from './MessagesPage'

// La pantalla ya habla con el back a través de los services: se mockean
// para que la prueba no dependa de que el back esté corriendo.
vi.mock('../../services/messageService', () => ({
  listMessages: vi.fn(),
  createMessage: vi.fn(),
  updateMessage: vi.fn(),
  markAsRead: vi.fn(),
  deleteMessage: vi.fn(),
}))
vi.mock('../../services/userService', async (importOriginal) => ({
  ...(await importOriginal()),
  listUsers: vi.fn(),
}))

// El usuario actual es el 1 (María Gómez).
const USERS = [
  { id: 1, name: 'María Gómez' },
  { id: 2, name: 'Carlos Ruiz' },
  { id: 3, name: 'Ana Torres', organization: 'Refugio Esperanza' },
]

const MESSAGES = [
  { id: 1, senderId: 1, receiverId: 2, content: 'Hola, ¿cómo va la solicitud de Luna?', date: '2026-10-21', read: false },
  { id: 2, senderId: 1, receiverId: 3, content: 'Gracias por la visita al refugio.', date: '2026-10-18', read: true },
  { id: 3, senderId: 1, receiverId: 2, content: 'Confirmo mi asistencia a la cita.', date: '2026-10-10', read: true },
  { id: 4, senderId: 2, receiverId: 1, content: '¿Puedes enviarnos una foto del patio?', date: '2026-10-22', read: false },
  { id: 5, senderId: 3, receiverId: 1, content: 'Te esperamos el sábado en el refugio.', date: '2026-10-19', read: true },
]

function mockBackend() {
  listMessages.mockResolvedValue(MESSAGES.map((message) => ({ ...message })))
  listUsers.mockResolvedValue(USERS)
  markAsRead.mockImplementation(async (id) => ({ ...MESSAGES.find((m) => m.id === id), read: true }))
  updateMessage.mockImplementation(async (id, { content }) => ({
    ...MESSAGES.find((m) => m.id === id),
    content,
  }))
  deleteMessage.mockResolvedValue(null)
}

async function openSentTab() {
  await userEvent.click(await screen.findByRole('button', { name: 'Enviados' }))
}

beforeEach(() => {
  vi.clearAllMocks()
  mockBackend()
})

describe('MessagesPage (HU17)', () => {
  it('shows the received messages first', async () => {
    render(<MessagesPage />)
    expect(await screen.findByRole('button', { name: /De: Carlos Ruiz/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /De: Ana Torres/ })).toBeInTheDocument()
    expect(screen.getByText('Selecciona un mensaje de la lista para leerlo.')).toBeInTheDocument()
  })

  it('shows the error when the messages cannot be loaded', async () => {
    listMessages.mockRejectedValue(new Error('No hay conexión con el servidor.'))
    render(<MessagesPage />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Ocurrió un error')
  })

  it('marks a received message as read when it is opened', async () => {
    render(<MessagesPage />)
    await userEvent.click(await screen.findByRole('button', { name: /De: Carlos Ruiz.*No leído/ }))
    expect(markAsRead).toHaveBeenCalledWith(4, 1)
    expect(screen.getByText(/foto del patio/, { selector: 'p' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /De: Carlos Ruiz.*Leído/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeEnabled()
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
  })

  it('does not ask the back to mark as read a message that was already read', async () => {
    render(<MessagesPage />)
    await userEvent.click(await screen.findByRole('button', { name: /De: Ana Torres/ }))
    expect(markAsRead).not.toHaveBeenCalled()
  })

  it('shows the reason when the message cannot be marked as read', async () => {
    markAsRead.mockRejectedValue(new Error('Solo el destinatario puede marcar un mensaje como leído.'))
    render(<MessagesPage />)
    await userEvent.click(await screen.findByRole('button', { name: /De: Carlos Ruiz/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Solo el destinatario puede marcar un mensaje como leído.',
    )
  })

  it('shows the sent messages', async () => {
    render(<MessagesPage />)
    await openSentTab()
    expect(screen.getAllByRole('button', { name: /Para: Carlos Ruiz/ })).toHaveLength(2)
    expect(screen.getByRole('button', { name: /Para: Ana Torres/ })).toBeInTheDocument()
  })

  it('does not allow deleting a sent message that has not been read', async () => {
    render(<MessagesPage />)
    await openSentTab()
    await userEvent.click(screen.getByRole('button', { name: /Para: Carlos Ruiz.*No leído/ }))
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Editar' })).toBeEnabled()
    expect(
      screen.getByText('Solo se puede eliminar un mensaje después de que haya sido leído.'),
    ).toBeInTheDocument()
  })

  it('edits a message that has not been read', async () => {
    render(<MessagesPage />)
    await openSentTab()
    await userEvent.click(screen.getByRole('button', { name: /Para: Carlos Ruiz.*No leído/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))
    const textarea = screen.getByLabelText('Editar contenido del mensaje')
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'Texto corregido')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(updateMessage).toHaveBeenCalledWith(1, { content: 'Texto corregido' })
    expect(await screen.findByRole('status')).toHaveTextContent('Mensaje actualizado.')
    expect(screen.getByText('Texto corregido', { selector: 'p' })).toBeInTheDocument()
  })

  it('shows the reason of the back when the edited message cannot be saved', async () => {
    updateMessage.mockRejectedValue(new Error('El contenido del mensaje es obligatorio.'))
    render(<MessagesPage />)
    await openSentTab()
    await userEvent.click(screen.getByRole('button', { name: /Para: Carlos Ruiz.*No leído/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))
    await userEvent.clear(screen.getByLabelText('Editar contenido del mensaje'))
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El contenido del mensaje es obligatorio.',
    )
  })

  it('cancels the edition', async () => {
    render(<MessagesPage />)
    await openSentTab()
    await userEvent.click(screen.getByRole('button', { name: /Para: Carlos Ruiz.*No leído/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByLabelText('Editar contenido del mensaje')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
    expect(updateMessage).not.toHaveBeenCalled()
  })

  it('does not allow editing a message that was read, but allows deleting it', async () => {
    render(<MessagesPage />)
    await openSentTab()
    await userEvent.click(screen.getByRole('button', { name: /Para: Ana Torres/ }))
    expect(screen.getByRole('button', { name: 'Editar' })).toBeDisabled()
    expect(screen.getByText('Un mensaje leído ya no se puede editar.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(deleteMessage).toHaveBeenCalledWith(2)
    expect(await screen.findByRole('status')).toHaveTextContent('Mensaje eliminado.')
    expect(screen.queryByRole('button', { name: /Para: Ana Torres/ })).not.toBeInTheDocument()
  })

  it('shows the reason of the back when the message cannot be deleted', async () => {
    deleteMessage.mockRejectedValue(
      new Error('No se puede eliminar un mensaje que aún no ha sido leído por el destinatario.'),
    )
    render(<MessagesPage />)
    await openSentTab()
    await userEvent.click(screen.getByRole('button', { name: /Para: Ana Torres/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('aún no ha sido leído')
    expect(screen.getByRole('button', { name: /Para: Ana Torres/ })).toBeInTheDocument()
  })

  it('shows an empty state when the tray has no messages', async () => {
    render(<MessagesPage />)
    for (const name of [/De: Carlos Ruiz/, /De: Ana Torres/]) {
      await userEvent.click(await screen.findByRole('button', { name }))
      await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    }
    expect(await screen.findByText('No hay mensajes en esta bandeja.')).toBeInTheDocument()
  })

  it('sends a new message and shows it in the sent tray', async () => {
    createMessage.mockResolvedValue({
      id: 6,
      senderId: 1,
      receiverId: 3,
      content: 'Hola Ana, ¿sigue la visita del sábado?',
      date: '2026-11-15',
      read: false,
    })
    render(<MessagesPage />)
    await userEvent.selectOptions(await screen.findByLabelText(/Para/), '3')
    await userEvent.type(screen.getByLabelText(/Contenido/), 'Hola Ana, ¿sigue la visita del sábado?')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
    expect(createMessage).toHaveBeenCalledWith({
      senderId: 1,
      receiverId: 3,
      content: 'Hola Ana, ¿sigue la visita del sábado?',
    })
    expect(await screen.findByRole('status')).toHaveTextContent('Mensaje enviado.')
    expect(screen.getByLabelText(/Contenido/)).toHaveValue('')
    expect(screen.getByRole('button', { name: /Para: Ana Torres.*sigue la visita/ })).toBeInTheDocument()
  })

  it('shows the reason of the back when the content is missing', async () => {
    createMessage.mockRejectedValue(new Error('El contenido del mensaje es obligatorio.'))
    render(<MessagesPage />)
    await userEvent.selectOptions(await screen.findByLabelText(/Para/), '3')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El contenido del mensaje es obligatorio.',
    )
  })

  it('sends no receiver when none is selected and shows the reason of the back', async () => {
    createMessage.mockRejectedValue(new Error('El mensaje debe tener un destinatario.'))
    render(<MessagesPage />)
    await userEvent.type(await screen.findByLabelText(/Contenido/), 'Hola')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
    expect(createMessage).toHaveBeenCalledWith({ senderId: 1, receiverId: null, content: 'Hola' })
    expect(await screen.findByRole('alert')).toHaveTextContent('El mensaje debe tener un destinatario.')
  })

  it('does not offer the current user as receiver', async () => {
    render(<MessagesPage />)
    await screen.findByLabelText(/Para/)
    expect(screen.queryByRole('option', { name: 'María Gómez' })).not.toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Ana Torres (Refugio Esperanza)' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Carlos Ruiz' })).toBeInTheDocument()
  })

  it('shows a generic name when the sender is not in the list of users', async () => {
    listUsers.mockResolvedValue([USERS[0]])
    render(<MessagesPage />)
    expect(await screen.findByRole('button', { name: /De: Usuario 2/ })).toBeInTheDocument()
  })
})
