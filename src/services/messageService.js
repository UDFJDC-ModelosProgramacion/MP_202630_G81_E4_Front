// MOCK service for HU17: data lives in memory. When the Front connects to the
// Back, replace each body with a fetch('/api/messages...') call and keep the
// same function names. The error texts are the ones the Back returns.
import { todayISO } from '../utils/dates'

const USER_IDS = [12, 7, 8]

const INITIAL_MESSAGES = [
  {
    id: 1,
    senderId: 12,
    receiverId: 7,
    content:
      'Hola, ¿cómo va la solicitud de adopción de Luna? Quedo atenta a cualquier documento adicional que necesiten.',
    date: '2026-10-21',
    read: false,
  },
  {
    id: 2,
    senderId: 12,
    receiverId: 8,
    content: 'Gracias por la visita al refugio. Fue muy lindo conocer a todos los peluditos.',
    date: '2026-10-18',
    read: true,
  },
  {
    id: 3,
    senderId: 12,
    receiverId: 7,
    content: 'Confirmo mi asistencia a la cita del sábado a las 10:00 a. m.',
    date: '2026-10-10',
    read: true,
  },
  {
    id: 4,
    senderId: 7,
    receiverId: 12,
    content: 'Hola María, recibimos tu solicitud. ¿Puedes enviarnos una foto del patio donde vivirá Luna?',
    date: '2026-10-22',
    read: false,
  },
  {
    id: 5,
    senderId: 8,
    receiverId: 12,
    content: 'Te esperamos el sábado en el refugio. Recuerda traer tu documento de identidad.',
    date: '2026-10-19',
    read: true,
  },
]

let messages = INITIAL_MESSAGES.map((message) => ({ ...message }))
let nextId = 6

// Only for tests: puts the in-memory data back to its initial state.
export function resetMessages() {
  messages = INITIAL_MESSAGES.map((message) => ({ ...message }))
  nextId = 6
}

function findMessage(id) {
  const message = messages.find((item) => item.id === id)
  if (!message) {
    throw new Error(`El mensaje con ID ${id} no existe.`)
  }
  return message
}

function validateContent(content) {
  if (!content || content.trim() === '') {
    throw new Error('El contenido del mensaje es obligatorio.')
  }
}

export async function listMessages() {
  return messages.map((message) => ({ ...message }))
}

export async function createMessage({ senderId, receiverId, content, date = todayISO() }) {
  validateContent(content)
  if (!senderId) {
    throw new Error('El mensaje debe tener un remitente.')
  }
  if (!receiverId) {
    throw new Error('El mensaje debe tener un destinatario.')
  }
  if (senderId === receiverId) {
    throw new Error('Un usuario no puede enviarse un mensaje a sí mismo.')
  }
  if (!USER_IDS.includes(senderId)) {
    throw new Error(`El usuario remitente con ID ${senderId} no existe.`)
  }
  if (!USER_IDS.includes(receiverId)) {
    throw new Error(`El usuario destinatario con ID ${receiverId} no existe.`)
  }

  const message = { id: nextId, senderId, receiverId, content, date, read: false }
  nextId += 1
  messages.push(message)
  return { ...message }
}

export async function updateMessage(id, { content }) {
  const message = findMessage(id)
  if (message.read) {
    throw new Error('No se puede modificar un mensaje que ya fue leído.')
  }
  validateContent(content)
  message.content = content
  return { ...message }
}

// Only the receiver can mark a message as read (business rule of the wiki).
export async function markAsRead(id, userId) {
  const message = findMessage(id)
  if (message.receiverId !== userId) {
    throw new Error('Solo el destinatario puede marcar un mensaje como leído.')
  }
  message.read = true
  return { ...message }
}

export async function deleteMessage(id, userId) {
  const message = findMessage(id)
  if (message.senderId !== userId && message.receiverId !== userId) {
    throw new Error('Solo el remitente o el destinatario pueden eliminar el mensaje.')
  }
  if (!message.read) {
    throw new Error('No se puede eliminar un mensaje que aún no ha sido leído por el destinatario.')
  }
  messages = messages.filter((item) => item.id !== id)
}
