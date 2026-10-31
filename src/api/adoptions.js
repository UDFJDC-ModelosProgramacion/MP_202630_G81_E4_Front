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
    let message = 'Ocurrió un error al procesar la adopción.'

    try {
      const body = await response.json()
      message = body?.apierror?.message || body?.message || message
    } catch {
      // La respuesta puede no incluir un cuerpo JSON.
    }

    throw new Error(
      response.status === 404
        ? 'La adopción no fue encontrada.'
        : message,
    )
  }

  if (response.status === 204) return null

  return response.json()
}

export const adoptionsApi = {
  list: () => request('/adoptions'),

  get: (id) => request(`/adoptions/${id}`),

  create: (payload) =>
    request('/adoptions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id, payload) =>
    request(`/adoptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  delete: (id) =>
    request(`/adoptions/${id}`, {
      method: 'DELETE',
    }),
}