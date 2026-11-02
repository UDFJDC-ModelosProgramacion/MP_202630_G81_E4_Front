
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { adoptionRequestsApi } from './adoptionRequests'

describe('adoptionRequestsApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  // ==========================================
  // GET: listar solicitudes
  // ==========================================

  it('consulta correctamente la lista de solicitudes', async () => {
    const data = [
      { id: 1, status: 'PENDIENTE' },
      { id: 2, status: 'APROBADO' },
    ]

    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(data),
    })

    const result = await adoptionRequestsApi.list()

    expect(result).toEqual(data)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch.mock.calls[0][0]).toContain('/adoption-requests')
    expect(fetch.mock.calls[0][1].headers).toEqual(
      expect.objectContaining({
        'Content-Type': 'application/json',
      }),
    )
  })

  it('retorna una lista vacía cuando el backend responde con ella', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue([]),
    })

    const result = await adoptionRequestsApi.list()

    expect(result).toEqual([])
  })

  // ==========================================
  // GET: consultar solicitud por ID
  // ==========================================

  it('consulta una solicitud por su identificador', async () => {
    const data = {
      id: 1,
      status: 'PENDIENTE',
    }

    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(data),
    })

    const result = await adoptionRequestsApi.get(1)

    expect(result).toEqual(data)
    expect(fetch.mock.calls[0][0]).toContain('/adoption-requests/1')
  })

  it('permite consultar una solicitud usando un identificador de texto', async () => {
    const data = { id: 'REQ-001' }

    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(data),
    })

    const result = await adoptionRequestsApi.get('REQ-001')

    expect(result).toEqual(data)
    expect(fetch.mock.calls[0][0]).toContain(
      '/adoption-requests/REQ-001',
    )
  })

  // ==========================================
  // PUT: actualizar solicitud
  // ==========================================

  it('actualiza una solicitud mediante PUT', async () => {
    const payload = {
      status: 'APROBADO',
    }

    const data = {
      id: 1,
      status: 'APROBADO',
    }

    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(data),
    })

    const result = await adoptionRequestsApi.update(1, payload)

    const [url, options] = fetch.mock.calls[0]

    expect(result).toEqual(data)
    expect(url).toContain('/adoption-requests/1')
    expect(options.method).toBe('PUT')
    expect(JSON.parse(options.body)).toEqual(payload)
    expect(options.headers).toEqual(
      expect.objectContaining({
        'Content-Type': 'application/json',
      }),
    )
  })

  it('actualiza una solicitud con diferentes campos del payload', async () => {
    const payload = {
      status: 'CANCELADO',
      observations: 'Solicitud cancelada',
    }

    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(payload),
    })

    const result = await adoptionRequestsApi.update(2, payload)

    expect(result).toEqual(payload)
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual(payload)
  })

  // ==========================================
  // RESPUESTAS HTTP
  // ==========================================

  it('retorna null cuando el backend responde 204', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 204,
      json: vi.fn(),
    })

    const result = await adoptionRequestsApi.get(1)

    expect(result).toBeNull()
  })

  it('retorna null cuando una actualización responde 204', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 204,
      json: vi.fn(),
    })

    const result = await adoptionRequestsApi.update(1, {
      status: 'APROBADO',
    })

    expect(result).toBeNull()
  })

  it('propaga el error cuando falla la lectura del JSON exitoso', async () => {
    const jsonError = new Error('Error al interpretar JSON')

    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockRejectedValue(jsonError),
    })

    await expect(adoptionRequestsApi.list()).rejects.toThrow(
      'Error al interpretar JSON',
    )
  })

  // ==========================================
  // ERRORES DE CONEXIÓN
  // ==========================================

  it('maneja los errores de conexión con el backend', async () => {
    fetch.mockRejectedValue(new Error('Network error'))

    await expect(adoptionRequestsApi.list()).rejects.toThrow(
      'No fue posible conectar con el servidor. Verifica que el backend esté en ejecución.',
    )
  })

  it('maneja errores de conexión al consultar una solicitud', async () => {
    fetch.mockRejectedValue(new Error('Network error'))

    await expect(adoptionRequestsApi.get(1)).rejects.toThrow(
      'No fue posible conectar con el servidor. Verifica que el backend esté en ejecución.',
    )
  })

  it('maneja errores de conexión al actualizar una solicitud', async () => {
    fetch.mockRejectedValue(new Error('Network error'))

    await expect(
      adoptionRequestsApi.update(1, { status: 'APROBADO' }),
    ).rejects.toThrow(
      'No fue posible conectar con el servidor. Verifica que el backend esté en ejecución.',
    )
  })

  // ==========================================
  // ERRORES HTTP
  // ==========================================

  it('utiliza el mensaje enviado por apierror.message', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({
        apierror: {
          message: 'Error de validación',
        },
        message: 'Otro mensaje',
      }),
    })

    await expect(adoptionRequestsApi.list()).rejects.toThrow(
      'Error de validación',
    )
  })

  it('utiliza el mensaje del cuerpo cuando apierror no tiene mensaje', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({
        apierror: {},
        message: 'Solicitud inválida',
      }),
    })

    await expect(adoptionRequestsApi.list()).rejects.toThrow(
      'Solicitud inválida',
    )
  })

  it('utiliza el mensaje genérico cuando el JSON no contiene mensajes', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({}),
    })

    await expect(adoptionRequestsApi.list()).rejects.toThrow(
      'Ocurrió un error al procesar la solicitud.',
    )
  })

  it('utiliza el mensaje genérico cuando el cuerpo JSON es null', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue(null),
    })

    await expect(adoptionRequestsApi.list()).rejects.toThrow(
      'Ocurrió un error al procesar la solicitud.',
    )
  })

  it('utiliza el mensaje genérico cuando apierror y message están vacíos', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({
        apierror: { message: '' },
        message: '',
      }),
    })

    await expect(adoptionRequestsApi.list()).rejects.toThrow(
      'Ocurrió un error al procesar la solicitud.',
    )
  })

  it('utiliza el mensaje genérico cuando la respuesta de error no es JSON', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
    })

    await expect(adoptionRequestsApi.list()).rejects.toThrow(
      'Ocurrió un error al procesar la solicitud.',
    )
  })

  // ==========================================
  // ERROR 404
  // ==========================================

  it('muestra un mensaje específico cuando la solicitud no existe', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: vi.fn().mockResolvedValue({
        message: 'No encontrada',
      }),
    })

    await expect(adoptionRequestsApi.get(999)).rejects.toThrow(
      'La solicitud de adopción no fue encontrada.',
    )
  })

  it('muestra el mensaje específico 404 al actualizar una solicitud inexistente', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: vi.fn().mockResolvedValue({
        message: 'No encontrada',
      }),
    })

    await expect(
      adoptionRequestsApi.update(999, { status: 'APROBADO' }),
    ).rejects.toThrow(
      'La solicitud de adopción no fue encontrada.',
    )
  })

  it('utiliza el mensaje genérico para errores diferentes de 404', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({}),
    })

    await expect(adoptionRequestsApi.get(1)).rejects.toThrow(
      'Ocurrió un error al procesar la solicitud.',
    )
  })
})
