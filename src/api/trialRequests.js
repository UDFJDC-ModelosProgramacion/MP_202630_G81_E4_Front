
const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

async function request(path, options = {}) {
  let response

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
  } catch {
    throw new Error(
      'No fue posible conectar con el servidor. Verifica que el backend esté en ejecución.',
    )
  }

  if (!response.ok) {
    let message = 'Ocurrió un error al procesar el periodo de prueba.'

    try {
      const body = await response.json()
      message = body?.apierror?.message || body?.message || message
    } catch {
      // La respuesta puede no incluir un cuerpo JSON.
    }

    if (response.status === 404) {
      throw new Error('El periodo de prueba no fue encontrado.')
    }

    throw new Error(message)
  }

  if (response.status === 204) return null

  return response.json()
}

export const trialRequestsApi = {
  list: () => request('/trial-requests'),

  get: (id) => request(`/trial-requests/${id}`),

  create: (payload) =>
    request('/trial-requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id, payload) =>
    request(`/trial-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  delete: (id) =>
    request(`/trial-requests/${id}`, {
      method: 'DELETE',
    }),
}
