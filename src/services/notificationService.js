import { api } from './apiClient'

// GET devuelve NotificationDetailDTO (user, adoption y pet anidados).
// Se traduce a la forma que ya usa la pantalla.
const toNotification = (dto) => ({
  id: dto.id,
  userId: dto.user?.id ?? null,
  channel: dto.channel,
  content: dto.content,
  date: dto.date,
  read: dto.read,
  adoption: dto.adoption ? { id: dto.adoption.id } : null,
  pet: dto.pet ? { id: dto.pet.id, name: dto.pet.name } : null,
})

export const listNotifications = async (userId) => {
  const data = await api.get(`/users/${userId}/notifications`)
  return data.map(toNotification)
}

// PUT devuelve el DTO básico (sin user/adoption/pet), así que solo
// se devuelven esos campos. El body se ignora en el back, pero se manda {}.
export const markAsRead = async (notificationId, userId) => {
  const dto = await api.put(`/notifications/${notificationId}`, {}, { userId })
  return {
    id: dto.id,
    channel: dto.channel,
    content: dto.content,
    date: dto.date,
    read: dto.read,
  }
}

export const deleteNotification = (notificationId, userId) =>
  api.delete(`/notifications/${notificationId}`, { userId })