// Cliente HTTP compartido.
// Cuando el backend esté disponible, define VITE_API_BASE_URL en un .env
// (ej: VITE_API_BASE_URL=http://localhost:8080/api). Si no está definida o
// la petición falla, los servicios usan los datos mock locales para que el
// frontend sea completamente funcional durante el desarrollo.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function request(path, options = {}) {
  if (!BASE_URL) {
    const error = new Error('API base URL no configurada')
    error.code = 'NO_API'
    throw error
  }
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  if (!response.ok) {
    const error = new Error(`Error ${response.status}`)
    error.status = response.status
    throw error
  }
  if (response.status === 204) return null
  return response.json()
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
