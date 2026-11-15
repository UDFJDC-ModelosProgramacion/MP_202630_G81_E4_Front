// Con el proxy de Vite basta '/api'. VITE_API_BASE_URL queda opcional (.env)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
export class ApiError extends Error {
  constructor(status, message, code) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}
const DEFAULT_MESSAGES = {
  400: 'Los datos enviados no son válidos.',
  404: 'No se encontró el recurso solicitado.',
  412: 'La operación no está permitida.',
  500: 'Error interno del servidor.',
}
async function readBody(response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}
function extractMessage(body, status) {
  if (typeof body === 'string' && body.trim()) return body
  if (body && typeof body === 'object') {
        // El back envuelve los errores en { apierror: { message } }
        return body.apierror?.message || body.message || body.error || DEFAULT_MESSAGES[status]
  }
  return DEFAULT_MESSAGES[status] ?? `Error inesperado (${status})`
}
export async function request(path, { method = 'GET', body, params } = {}) {
  let url = `${BASE_URL}${path}`
  if (params) {
    const qs = new URLSearchParams(params).toString()
    if (qs) url += `?${qs}`
  }
  let response
  try {
    response = await fetch(url, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'No hay conexión con el servidor. Verifica que el backend esté corriendo.', 'NETWORK')
  }
  const data = await readBody(response)
  if (!response.ok) throw new ApiError(response.status, extractMessage(data, response.status))
  return data
}
export const api = {
  get: (path, params) => request(path, { params }),
  post: (path, body, params) => request(path, { method: 'POST', body, params }),
  put: (path, body, params) => request(path, { method: 'PUT', body, params }),
  delete: (path, params) => request(path, { method: 'DELETE', params }),
}