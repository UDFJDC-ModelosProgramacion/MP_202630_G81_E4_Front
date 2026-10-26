import { beforeEach, describe, it, expect } from 'vitest'
import {
  createMessage,
  deleteMessage,
  listMessages,
  markAsRead,
  resetMessages,
  updateMessage,
} from './messageService'

describe('messageService', () => {
  beforeEach(() => resetMessages())

  it('lists the messages', async () => {
    expect(await listMessages()).toHaveLength(5)
  })

  describe('createMessage', () => {
    it('creates an unread message', async () => {
      const created = await createMessage({ senderId: 12, receiverId: 8, content: 'Hola' })
      expect(created.read).toBe(false)
      expect(created.id).toBe(6)
      expect(await listMessages()).toHaveLength(6)
    })

    it('rejects an empty content', async () => {
      await expect(createMessage({ senderId: 12, receiverId: 8, content: '  ' })).rejects.toThrow(
        'El contenido del mensaje es obligatorio.',
      )
    })

    it('rejects a missing sender', async () => {
      await expect(createMessage({ receiverId: 8, content: 'Hola' })).rejects.toThrow(
        'El mensaje debe tener un remitente.',
      )
    })

    it('rejects a missing receiver', async () => {
      await expect(createMessage({ senderId: 12, content: 'Hola' })).rejects.toThrow(
        'El mensaje debe tener un destinatario.',
      )
    })

    it('rejects a message to oneself', async () => {
      await expect(createMessage({ senderId: 12, receiverId: 12, content: 'Hola' })).rejects.toThrow(
        'Un usuario no puede enviarse un mensaje a sí mismo.',
      )
    })

    it('rejects a sender that does not exist', async () => {
      await expect(createMessage({ senderId: 99, receiverId: 8, content: 'Hola' })).rejects.toThrow(
        'El usuario remitente con ID 99 no existe.',
      )
    })

    it('rejects a receiver that does not exist', async () => {
      await expect(createMessage({ senderId: 12, receiverId: 99, content: 'Hola' })).rejects.toThrow(
        'El usuario destinatario con ID 99 no existe.',
      )
    })
  })

  describe('updateMessage', () => {
    it('edits an unread message', async () => {
      const updated = await updateMessage(1, { content: 'Texto nuevo' })
      expect(updated.content).toBe('Texto nuevo')
    })

    it('does not edit a message that was already read', async () => {
      await expect(updateMessage(2, { content: 'Texto nuevo' })).rejects.toThrow(
        'No se puede modificar un mensaje que ya fue leído.',
      )
    })

    it('does not accept an empty content', async () => {
      await expect(updateMessage(1, { content: '' })).rejects.toThrow(
        'El contenido del mensaje es obligatorio.',
      )
    })

    it('reports a message that does not exist', async () => {
      await expect(updateMessage(99, { content: 'Hola' })).rejects.toThrow(
        'El mensaje con ID 99 no existe.',
      )
    })
  })

  describe('markAsRead', () => {
    it('lets the receiver mark the message as read', async () => {
      const updated = await markAsRead(4, 12)
      expect(updated.read).toBe(true)
    })

    it('does not let anyone else mark it as read', async () => {
      await expect(markAsRead(1, 12)).rejects.toThrow(
        'Solo el destinatario puede marcar un mensaje como leído.',
      )
    })
  })

  describe('deleteMessage', () => {
    it('deletes a message that was read', async () => {
      await deleteMessage(2, 12)
      expect(await listMessages()).toHaveLength(4)
    })

    it('does not delete a message that was not read yet', async () => {
      await expect(deleteMessage(1, 12)).rejects.toThrow(
        'No se puede eliminar un mensaje que aún no ha sido leído por el destinatario.',
      )
    })

    it('does not let someone who is not part of the conversation delete it', async () => {
      await expect(deleteMessage(2, 7)).rejects.toThrow(
        'Solo el remitente o el destinatario pueden eliminar el mensaje.',
      )
    })

    it('reports a message that does not exist', async () => {
      await expect(deleteMessage(99, 12)).rejects.toThrow('El mensaje con ID 99 no existe.')
    })
  })
})
