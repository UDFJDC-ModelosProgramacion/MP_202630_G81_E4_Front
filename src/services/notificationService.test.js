import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CURRENT_USER } from '../config/currentUser'
import { api } from './apiClient'
import { deleteNotification, listNotifications, markAsRead } from './notificationService'

// El service ya habla con el back: se mockea apiClient para que la prueba
// no dependa de que el back esté corriendo (Jenkins no tiene Spring Boot).
vi.mock('./apiClient', () => ({
  api: { get: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const USER_ID = CURRENT_USER.userId

const detailDto = {
  id: 1,
  user: { id: USER_ID, name: 'María' },
  channel: 'email',
  content: 'Tu solicitud fue aprobada',
  date: '2026-11-01T10:00:00Z',
  read: false,
  adoption: { id: 7, adoptionId: 'AD-7', status: 'ACTIVA' },
  pet: { id: 3, name: 'Luna', specie: 'perro' },
}

beforeEach(() => vi.clearAllMocks())

describe('notificationService', () => {
  it('lists the notifications of the user and translates the DTO', async () => {
    api.get.mockResolvedValue([detailDto])

    const list = await listNotifications(USER_ID)

    expect(api.get).toHaveBeenCalledWith(`/users/${USER_ID}/notifications`)
    expect(list).toEqual([
      {
        id: 1,
        userId: USER_ID,
        channel: 'email',
        content: 'Tu solicitud fue aprobada',
        date: '2026-11-01T10:00:00Z',
        read: false,
        adoption: { id: 7 },
        pet: { id: 3, name: 'Luna' },
      },
    ])
  })

  it('leaves user, adoption and pet empty when the DTO does not bring them', async () => {
    api.get.mockResolvedValue([{ ...detailDto, user: null, adoption: null, pet: null }])

    const [notification] = await listNotifications(USER_ID)

    expect(notification.userId).toBeNull()
    expect(notification.adoption).toBeNull()
    expect(notification.pet).toBeNull()
  })

  it('returns an empty list for a user without notifications', async () => {
    api.get.mockResolvedValue([])

    expect(await listNotifications(-1)).toEqual([])
  })

  it('lets the error of the back go up when listing fails', async () => {
    api.get.mockRejectedValue(new Error('Usuario no encontrado'))

    await expect(listNotifications(999)).rejects.toThrow('Usuario no encontrado')
  })

  it('marks a notification as read sending the user and an empty body', async () => {
    api.put.mockResolvedValue({
      id: 1,
      channel: 'email',
      content: 'Tu solicitud fue aprobada',
      date: '2026-11-01T10:00:00Z',
      read: true,
      ignored: 'campo extra',
    })

    const updated = await markAsRead(1, USER_ID)

    expect(api.put).toHaveBeenCalledWith('/notifications/1', {}, { userId: USER_ID })
    expect(updated).toEqual({
      id: 1,
      channel: 'email',
      content: 'Tu solicitud fue aprobada',
      date: '2026-11-01T10:00:00Z',
      read: true,
    })
  })

  it('lets the error of the back go up when marking fails', async () => {
    api.put.mockRejectedValue(new Error('Notificación no encontrada'))

    await expect(markAsRead(999, USER_ID)).rejects.toThrow('Notificación no encontrada')
  })

  it('deletes a notification sending the user', async () => {
    api.delete.mockResolvedValue(null)

    await deleteNotification(4, USER_ID)

    expect(api.delete).toHaveBeenCalledWith('/notifications/4', { userId: USER_ID })
  })

  it('lets the business rule error of the back go up when deleting fails', async () => {
    api.delete.mockRejectedValue(new Error('Solo se puede eliminar una notificación leída.'))

    await expect(deleteNotification(2, USER_ID)).rejects.toThrow(
      'Solo se puede eliminar una notificación leída.',
    )
  })
})