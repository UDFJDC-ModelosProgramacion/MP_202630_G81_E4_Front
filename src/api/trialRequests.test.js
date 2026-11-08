
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { trialRequestsApi } from './trialRequests'

describe('trialRequestsApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  // ==========================================
  // GET: listar periodos de prueba
  // ==========================================

  it('consulta correctamente la lista de periodos de prueba', async () => {
    const data = [
      { id: 1, status: 'ACTIVA' },
      { id: 2, status: 'FINALIZADA' },
    ]

    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(data),
    })

    const result = await trialRequestsApi.list()

    expect(result).toEqual(data)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch.mock.calls[0][0]).toContain('/trial-requests')
    expect(fetch.mock.calls[0][1].headers).toEqual(
      expect.objectContaining({
        'Content-Type': 'application/json',
      }),
    )
  })

  it('retorna una lista vacía cuando no existen periodos', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue([]),
    })

    const result = await trialRequestsApi.list()

    expect(result).toEqual([])
  })

  // ==========================================
  // GET: consultar por identificador
  // ==========================================

  it('consulta un periodo de prueba por identificador', async () => {
    const data = {
      id: 1,
      trialId: 'TR-001',
      status: 'ACTIVA',
    }

    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(data),
    })

    const result = await trialRequestsApi.get(1)

    expect(result).toEqual(data)
    expect(fetch.mock.calls[0][0]).toContain('/trial-requests/1')
  })

  it('permite consultar utilizando un identificador de texto', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ trialId: 'TR-001' }),
    })

    const result = await trialRequestsApi.get('TR-001')

    expect(result.trialId).toBe('TR-001')
    expect(fetch.mock.calls[0][0]).toContain('/trial-requests/TR-001')
  })

  // ==========================================
  // POST: crear periodo de prueba
  // ==========================================

  it('crea un periodo de prueba mediante POST', async () => {
    const payload = {
      trialId: 'TR-001',
      date: '2026-11-07T00:00:00-05:00',
      status: 'ACTIVA',
      description: 'Periodo de prueba de 15 días',
      adopter: { id: 12 },
      shelter: { id: 1 },
      pet: { id: 1 },
    }

    const data = { id: 1, ...payload }

    fetch.mockResolvedValue({
      ok: true,
      status: 201,
      json: vi.fn().mockResolvedValue(data),
    })

    const result = await trialRequestsApi.create(payload)

    const [url, options] = fetch.mock.calls[0]

    expect(result).toEqual(data)
    expect(url).toContain('/trial-requests')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual(payload)
  })

  // ==========================================
  // PUT: actualizar periodo de prueba
  // ==========================================

  it('actualiza un periodo mediante PUT', async () => {
    const payload = {
      status: 'FINALIZADA',
      description: 'Periodo de prueba completado',
    }

    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(payload),
    })

    const result = await trialRequestsApi.update(1, payload)

    const [url, options] = fetch.mock.calls[0]

    expect(result).toEqual(payload)
    expect(url).toContain('/trial-requests/1')
    expect(options.method).toBe('PUT')
    expect(JSON.parse(options.body)).toEqual(payload)
  })

  // ==========================================
  // DELETE: eliminar periodo
  // ==========================================

  it('elimina un periodo mediante DELETE', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 204,
      json: vi.fn(),
    })

    const result = await trialRequestsApi.delete(1)

    const [url, options] = fetch.mock.calls[0]

    expect(result).toBeNull()
    expect(url).toContain('/trial-requests/1')
    expect(options.method).toBe('DELETE')
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

    const result = await trialRequestsApi.get(1)

    expect(result).toBeNull()
  })

  it('propaga el error cuando falla la lectura del JSON exitoso', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockRejectedValue(
        new Error('Error al interpretar JSON'),
      ),
    })

    await expect(trialRequestsApi.list()).rejects.toThrow(
      'Error al interpretar JSON',
    )
  })

  // ==========================================
  // ERRORES DE CONEXIÓN
  // ==========================================

  it('maneja errores de conexión al listar', async () => {
    fetch.mockRejectedValue(new Error('Network error'))

    await expect(trialRequestsApi.list()).rejects.toThrow(
      'No fue posible conectar con el servidor. Verifica que el backend esté en ejecución.',
    )
  })

  it('maneja errores de conexión al consultar', async () => {
    fetch.mockRejectedValue(new Error('Network error'))

    await expect(trialRequestsApi.get(1)).rejects.toThrow(
      'No fue posible conectar con el servidor. Verifica que el backend esté en ejecución.',
    )
  })

  it('maneja errores de conexión al crear', async () => {
    fetch.mockRejectedValue(new Error('Network error'))

    await expect(
      trialRequestsApi.create({ trialId: 'TR-001' }),
    ).rejects.toThrow(
      'No fue posible conectar con el servidor. Verifica que el backend esté en ejecución.',
    )
  })

  it('maneja errores de conexión al actualizar', async () => {
    fetch.mockRejectedValue(new Error('Network error'))

    await expect(
      trialRequestsApi.update(1, { status: 'ACTIVA' }),
    ).rejects.toThrow(
      'No fue posible conectar con el servidor. Verifica que el backend esté en ejecución.',
    )
  })

  it('maneja errores de conexión al eliminar', async () => {
    fetch.mockRejectedValue(new Error('Network error'))

    await expect(trialRequestsApi.delete(1)).rejects.toThrow(
      'No fue posible conectar con el servidor. Verifica que el backend esté en ejecución.',
    )
  })

  // ==========================================
  // ERRORES HTTP
  // ==========================================

  it('utiliza el mensaje de apierror.message', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({
        apierror: { message: 'Error de validación' },
        message: 'Otro mensaje',
      }),
    })

    await expect(trialRequestsApi.list()).rejects.toThrow(
      'Error de validación',
    )
  })

  it('utiliza el mensaje alternativo del backend', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({
        apierror: {},
        message: 'Solicitud inválida',
      }),
    })

    await expect(trialRequestsApi.list()).rejects.toThrow(
      'Solicitud inválida',
    )
  })

  it('utiliza el mensaje genérico cuando el JSON no contiene mensajes', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({}),
    })

    await expect(trialRequestsApi.list()).rejects.toThrow(
      'Ocurrió un error al procesar el periodo de prueba.',
    )
  })

  it('utiliza el mensaje genérico cuando el cuerpo JSON es null', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue(null),
    })

    await expect(trialRequestsApi.list()).rejects.toThrow(
      'Ocurrió un error al procesar el periodo de prueba.',
    )
  })

  it('utiliza el mensaje genérico cuando los mensajes están vacíos', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({
        apierror: { message: '' },
        message: '',
      }),
    })

    await expect(trialRequestsApi.list()).rejects.toThrow(
      'Ocurrió un error al procesar el periodo de prueba.',
    )
  })

  it('maneja una respuesta de error que no contiene JSON válido', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
    })

    await expect(trialRequestsApi.list()).rejects.toThrow(
      'Ocurrió un error al procesar el periodo de prueba.',
    )
  })

  // ==========================================
  // ERROR 404
  // ==========================================

  it('muestra un mensaje específico cuando el periodo no existe', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: vi.fn().mockResolvedValue({
        message: 'No encontrado',
      }),
    })

    await expect(trialRequestsApi.get(999)).rejects.toThrow(
      'El periodo de prueba no fue encontrado.',
    )
  })

  it('prioriza el mensaje 404 incluso cuando el backend envía otro mensaje', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: vi.fn().mockResolvedValue({
        message: 'Identificador inexistente',
      }),
    })

    await expect(trialRequestsApi.get(999)).rejects.toThrow(
      'El periodo de prueba no fue encontrado.',
    )
  })

  it('utiliza el mensaje genérico para errores diferentes de 404', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({}),
    })

    await expect(trialRequestsApi.get(1)).rejects.toThrow(
      'Ocurrió un error al procesar el periodo de prueba.',
    )
  })
})
