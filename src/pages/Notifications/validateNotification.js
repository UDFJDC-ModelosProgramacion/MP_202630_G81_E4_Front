import { CHANNELS } from './channels'

const isBlank = (value) => !value || String(value).trim() === ''
const isPositiveInteger = (value) => /^[1-9]\d*$/.test(String(value).trim())

export function validateNotification({ userId, adoptionId, petId, channel, content }) {
  const errors = {}
  if (isBlank(userId)) {
    errors.userId = 'Selecciona un destinatario.'
  }
  if (!CHANNELS.some((option) => option.value === channel)) {
    errors.channel = 'Selecciona un canal válido (correo, SMS o push).'
  }
  if (!isPositiveInteger(adoptionId)) {
    errors.adoptionId = 'Indica la adopción asociada con un número entero positivo.'
  }
  if (!isBlank(petId) && !isPositiveInteger(petId)) {
    errors.petId = 'La mascota debe ser un número entero positivo.'
  }
  if (isBlank(content)) {
    errors.content = 'El contenido es obligatorio.'
  }
  return errors
}