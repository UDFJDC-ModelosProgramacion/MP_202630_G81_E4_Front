import { api } from './apiClient'
import { todayISO } from '../utils/dates'

// El back devuelve MessageDTO con sender y receiver como usuarios anidados.
// Se traduce a la forma que ya usa la pantalla.
const toMessage = (dto) => ({
  id: dto.id,
  senderId: dto.sender?.id ?? null,
  receiverId: dto.receiver?.id ?? null,
  content: dto.content,
  date: dto.date ? String(dto.date).slice(0, 10) : '',
  read: dto.read,
})

// El PUT del back reemplaza el mensaje completo (no es parcial), así que
// siempre se envían todos los campos aunque solo cambie uno.
const toBody = ({ content, date, read, senderId, receiverId }) => ({
  content,
  date,
  read,
  sender: senderId ? { id: senderId } : undefined,
  receiver: receiverId ? { id: receiverId } : undefined,
})

const fetchMessage = async (id) => toMessage(await api.get(`/messages/${id}`))

// El back no filtra por usuario: la pantalla filtra recibidos y enviados.
export const listMessages = async () => {
  const data = await api.get('/messages')
  return data.map(toMessage)
}

// El back valida contenido, remitente, destinatario, que no sea a sí mismo
// y que ambos usuarios existan; su mensaje llega a la pantalla.
export const createMessage = async ({ senderId, receiverId, content, date = todayISO() }) =>
  toMessage(
    await api.post(
      '/messages',
      toBody({ content, date, read: false, senderId, receiverId }),
    ),
  )

// El back rechaza editar un mensaje que ya fue leído.
export const updateMessage = async (id, { content }) => {
  const current = await fetchMessage(id)
  return toMessage(await api.put(`/messages/${id}`, toBody({ ...current, content })))
}

// El back no valida quién marca como leído, así que la regla
// "solo el destinatario" se verifica aquí.
export const markAsRead = async (id, userId) => {
  const current = await fetchMessage(id)
  if (current.receiverId !== userId) {
    throw new Error('Solo el destinatario puede marcar un mensaje como leído.')
  }
  if (current.read) return current
  return toMessage(await api.put(`/messages/${id}`, toBody({ ...current, read: true })))
}

// El back rechaza eliminar un mensaje que aún no ha sido leído.
export const deleteMessage = (id) => api.delete(`/messages/${id}`)
