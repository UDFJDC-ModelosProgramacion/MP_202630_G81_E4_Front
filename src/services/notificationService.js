import { CURRENT_USER } from '../config/currentUser'

// Sample data. When the back is connected, replace each function body
// with a fetch to /api/... and keep the same signatures.
const NOT_FOUND = 'Notificación no encontrada'
const NOT_RECIPIENT_READ = 'Solo el usuario destinatario puede marcar la notificación como leída.'
const NOT_RECIPIENT_DELETE = 'Solo el usuario destinatario puede eliminar la notificación.'
const NOT_READ = 'Solo se puede eliminar una notificación leída.'

const OTHER_USER_ID = CURRENT_USER.userId + 1

const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60 * 1000).toISOString()

let notifications = [
  {
    id: 1,
    userId: CURRENT_USER.userId,
    channel: 'email',
    content: 'Tu solicitud de adopción de Luna fue aprobada',
    date: minutesAgo(10),
    read: false,
    adoption: { id: 12 },
    pet: null,
  },
  {
    id: 2,
    userId: CURRENT_USER.userId,
    channel: 'push',
    content: 'Tu periodo de prueba con Max finaliza mañana',
    date: minutesAgo(180),
    read: false,
    adoption: null,
    pet: { id: 2, name: 'Max' },
  },
  {
    id: 3,
    userId: CURRENT_USER.userId,
    channel: 'sms',
    content: 'Recordatorio: seguimiento veterinario programado',
    date: minutesAgo(26 * 60),
    read: true,
    adoption: { id: 12 },
    pet: null,
  },
  {
    id: 4,
    userId: CURRENT_USER.userId,
    channel: 'push',
    content: 'Se registró tu reseña de Luna',
    date: minutesAgo(50 * 60),
    read: true,
    adoption: null,
    pet: { id: 1, name: 'Luna' },
  },
  {
    id: 5,
    userId: OTHER_USER_ID,
    channel: 'email',
    content: 'Notificación de otro usuario',
    date: minutesAgo(30),
    read: false,
    adoption: null,
    pet: null,
  },
]

const respond = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 300))

const fail = (message) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(message)), 300))

export function listNotifications(userId) {
  const own = notifications
    .filter((notification) => notification.userId === userId)
    .sort((a, b) => b.date.localeCompare(a.date))
  return respond(own)
}

export function markAsRead(notificationId, userId) {
  const notification = notifications.find((item) => item.id === notificationId)
  if (!notification) {
    return fail(NOT_FOUND)
  }
  if (notification.userId !== userId) {
    return fail(NOT_RECIPIENT_READ)
  }
  const updated = { ...notification, read: true }
  notifications = notifications.map((item) => (item.id === notificationId ? updated : item))
  return respond(updated)
}

export function deleteNotification(notificationId, userId) {
  const notification = notifications.find((item) => item.id === notificationId)
  if (!notification) {
    return fail(NOT_FOUND)
  }
  if (notification.userId !== userId) {
    return fail(NOT_RECIPIENT_DELETE)
  }
  if (!notification.read) {
    return fail(NOT_READ)
  }
  notifications = notifications.filter((item) => item.id !== notificationId)
  return respond()
}