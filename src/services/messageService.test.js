import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from './apiClient'
import {
  createMessage,
  deleteMessage,
  listMessages,
  markAsRead,
  updateMessage,
} from './messageService'

// El service ya habla con el back: se mockea apiClient para que la prueba
// no dependa de que el back esté corriendo (Jenkins no tiene Spring Boot).
vi.mock('./apiClient', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const unreadDto = {
  id: 1,
  content: 'Hola, ¿cómo va la solicitud?',
  date: '2026-10-21',
  read: false,
  sender: { id: 1, name: 'María Gómez', email: 'maria@example.com' },
  receiver: { id: 2, name: 'Carlos Ruiz', email: 'carlos@example.com' },
}

beforeEach(() => vi.clearAllMocks())

describe('messageService', () => {
  describe('listMessages', () => {
    it('lists the messages and translates the DTO to the shape of the screen', async () => {
      api.get.mockResolvedValue([unreadDto])

      const list = await listMessages()

      expect(api.get).toHaveBeenCalledWith('/messages')
      expect(list).toEqual([
        {
          id: 1,
          senderId: 1,
          receiverId: 2,
          content: 'Hola, ¿cómo va la solicitud?',
          date: '2026-10-21',
          read: false,
        },
      ])
    })

    it('keeps only the day of the date and tolerates missing users or date', async () => {
      api.get.mockResolvedValue([
        { ...unreadDto, date: '2026-10-21T05:00:00.000+00:00' },
        { ...unreadDto, id: 2, date: null, sender: null, receiver: null },
      ])

      const [first, second] = await listMessages()

      expect(first.date).toBe('2026-10-21')
      expect(second).toMatchObject({ date: '', senderId: null, receiverId: null })
    })

    it('lets the error of the back go up when listing fails', async () => {
      api.get.mockRejectedValue(new Error('No hay conexión con el servidor.'))

      await expect(listMessages()).rejects.toThrow('No hay conexión con el servidor.')
    })
  })

  describe('createMessage', () => {
    it('sends the message as unread with sender, receiver and today by default', async () => {
      api.post.mockResolvedValue({ ...unreadDto, id: 7 })

      const created = await createMessage({ senderId: 1, receiverId: 2, content: 'Hola' })

      const [path, body] = api.post.mock.calls[0]
      expect(path).toBe('/messages')
      expect(body).toEqual({
        content: 'Hola',
        date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        read: false,
        sender: { id: 1 },
        receiver: { id: 2 },
      })
      expect(created.id).toBe(7)
    })

    it('uses the date that it receives', async () => {
      api.post.mockResolvedValue(unreadDto)

      await createMessage({ senderId: 1, receiverId: 2, content: 'Hola', date: '2026-11-01' })

      expect(api.post.mock.calls[0][1].date).toBe('2026-11-01')
    })

    it('does not send the receiver when there is none so the back explains it', async () => {
      api.post.mockRejectedValue(new Error('El mensaje debe tener un destinatario.'))

      await expect(createMessage({ senderId: 1, receiverId: null, content: 'Hola' })).rejects.toThrow(
        'El mensaje debe tener un destinatario.',
      )
      expect(api.post.mock.calls[0][1].receiver).toBeUndefined()
    })

    it('does not send the sender when there is none', async () => {
      api.post.mockRejectedValue(new Error('El mensaje debe tener un remitente.'))

      await expect(createMessage({ receiverId: 2, content: 'Hola' })).rejects.toThrow(
        'El mensaje debe tener un remitente.',
      )
      expect(api.post.mock.calls[0][1].sender).toBeUndefined()
    })

    it('lets the business rule error of the back go up when the content is empty', async () => {
      api.post.mockRejectedValue(new Error('El contenido del mensaje es obligatorio.'))

      await expect(createMessage({ senderId: 1, receiverId: 2, content: ' ' })).rejects.toThrow(
        'El contenido del mensaje es obligatorio.',
      )
    })

    it('lets the business rule error of the back go up when it is a message to oneself', async () => {
      api.post.mockRejectedValue(new Error('Un usuario no puede enviarse un mensaje a sí mismo.'))

      await expect(createMessage({ senderId: 1, receiverId: 1, content: 'Hola' })).rejects.toThrow(
        'Un usuario no puede enviarse un mensaje a sí mismo.',
      )
    })
  })

  describe('updateMessage', () => {
    it('sends the whole message with the new content, because the PUT replaces it', async () => {
      api.get.mockResolvedValue(unreadDto)
      api.put.mockResolvedValue({ ...unreadDto, content: 'Texto nuevo' })

      const updated = await updateMessage(1, { content: 'Texto nuevo' })

      expect(api.get).toHaveBeenCalledWith('/messages/1')
      expect(api.put).toHaveBeenCalledWith('/messages/1', {
        content: 'Texto nuevo',
        date: '2026-10-21',
        read: false,
        sender: { id: 1 },
        receiver: { id: 2 },
      })
      expect(updated.content).toBe('Texto nuevo')
    })

    it('lets the business rule error of the back go up when the message was read', async () => {
      api.get.mockResolvedValue({ ...unreadDto, read: true })
      api.put.mockRejectedValue(new Error('No se puede modificar un mensaje que ya fue leído.'))

      await expect(updateMessage(1, { content: 'Otro' })).rejects.toThrow(
        'No se puede modificar un mensaje que ya fue leído.',
      )
    })

    it('lets the not found error of the back go up when the message does not exist', async () => {
      api.get.mockRejectedValue(new Error('El mensaje con ID 99 no existe.'))

      await expect(updateMessage(99, { content: 'Hola' })).rejects.toThrow(
        'El mensaje con ID 99 no existe.',
      )
      expect(api.put).not.toHaveBeenCalled()
    })
  })

  describe('markAsRead', () => {
    it('marks the message as read keeping the rest of its fields', async () => {
      api.get.mockResolvedValue(unreadDto)
      api.put.mockResolvedValue({ ...unreadDto, read: true })

      const updated = await markAsRead(1, 2)

      expect(api.put).toHaveBeenCalledWith('/messages/1', {
        content: 'Hola, ¿cómo va la solicitud?',
        date: '2026-10-21',
        read: true,
        sender: { id: 1 },
        receiver: { id: 2 },
      })
      expect(updated.read).toBe(true)
    })

    it('does not let anyone but the receiver mark it as read', async () => {
      api.get.mockResolvedValue(unreadDto)

      await expect(markAsRead(1, 1)).rejects.toThrow(
        'Solo el destinatario puede marcar un mensaje como leído.',
      )
      expect(api.put).not.toHaveBeenCalled()
    })

    it('does nothing when the message was already read', async () => {
      api.get.mockResolvedValue({ ...unreadDto, read: true })

      const message = await markAsRead(1, 2)

      expect(message.read).toBe(true)
      expect(api.put).not.toHaveBeenCalled()
    })
  })

  describe('deleteMessage', () => {
    it('deletes the message', async () => {
      api.delete.mockResolvedValue(null)

      await deleteMessage(4)

      expect(api.delete).toHaveBeenCalledWith('/messages/4')
    })

    it('lets the business rule error of the back go up when the message was not read', async () => {
      api.delete.mockRejectedValue(
        new Error('No se puede eliminar un mensaje que aún no ha sido leído por el destinatario.'),
      )

      await expect(deleteMessage(1)).rejects.toThrow(
        'No se puede eliminar un mensaje que aún no ha sido leído por el destinatario.',
      )
    })
  })
})
