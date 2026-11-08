import { describe, it, expect } from 'vitest'
import { CURRENT_USER } from '../config/currentUser'
import { deleteNotification, listNotifications, markAsRead } from './notificationService'

const USER_ID = CURRENT_USER.userId

describe('notificationService', () => {
  it('lists only the notifications of the user', async () => {
    const list = await listNotifications(USER_ID)
    expect(list.length).toBeGreaterThan(0)
    expect(list.every((notification) => notification.userId === USER_ID)).toBe(true)
  })

  it('lists the newest notification first', async () => {
    const list = await listNotifications(USER_ID)
    const dates = list.map((notification) => notification.date)
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)))
  })

  it('returns an empty list for a user without notifications', async () => {
    expect(await listNotifications(-1)).toEqual([])
  })

  it('marks a notification as read', async () => {
    const updated = await markAsRead(1, USER_ID)
    expect(updated.read).toBe(true)
    const list = await listNotifications(USER_ID)
    expect(list.find((notification) => notification.id === 1).read).toBe(true)
  })

  it('rejects marking a notification that does not exist', async () => {
    await expect(markAsRead(999, USER_ID)).rejects.toThrow('Notificación no encontrada')
  })

  it('rejects marking a notification of another user', async () => {
    await expect(markAsRead(5, USER_ID)).rejects.toThrow(
      'Solo el usuario destinatario puede marcar la notificación como leída.',
    )
  })

  it('deletes a read notification', async () => {
    await deleteNotification(4, USER_ID)
    const list = await listNotifications(USER_ID)
    expect(list.some((notification) => notification.id === 4)).toBe(false)
  })

  it('rejects deleting a notification that has not been read', async () => {
    await expect(deleteNotification(2, USER_ID)).rejects.toThrow(
      'Solo se puede eliminar una notificación leída.',
    )
  })

  it('rejects deleting a notification of another user', async () => {
    await expect(deleteNotification(5, USER_ID)).rejects.toThrow(
      'Solo el usuario destinatario puede eliminar la notificación.',
    )
  })

  it('rejects deleting a notification that does not exist', async () => {
    await expect(deleteNotification(999, USER_ID)).rejects.toThrow('Notificación no encontrada')
  })
})