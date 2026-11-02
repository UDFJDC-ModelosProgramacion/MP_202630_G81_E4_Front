
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { adoptionsApi } from './adoptions'

describe('adoptionsApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

 
  it('consulta correctamente la lista de adopciones', async () => {
    const data = [{ id: 'AD-001' }, { id: 'AD-002' }]

    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(data),
    })

    const result = await adoptionsApi.list()

    expect(result).toEqual(data)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch.mock.calls[0][0]).toContain('/adoptions')
    expect(fetch.mock.calls[0][1].headers).toEqual(
      expect.objectContaining({
        'Content-Type': 'application/json',
      }),
    )
  })


  it('consulta una adopción por su identificador', async () => {
    const data = { id: 'AD-001', status: 'ACTIVA' }

    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(data),
    })

    const result = await adoptionsApi.get('AD-001')

    expect(result).toEqual(data)
    expect(fetch.mock.calls[0][0]).toContain('/adoptions/AD-001')
  })


  it('registra una adopción mediante POST', async () => {
    const payload = {
      adoptionId: 'AD-001',
      status: 'ACTIVA',
    }

    const data = { id: 'AD-001' }

    fetch.mockResolvedValue({
      ok: true,
      status: 201,
      json: vi.fn().mockResolvedValue(data),
    })

    const result = await adoptionsApi.create(payload)

    const [url, options] = fetch.mock.calls[0]

    expect(result).toEqual(data)
    expect(url).toContain('/adoptions')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual(payload)
  })


  it('actualiza una adopción mediante PUT', async () => {
    const payload = { status: 'FINALIZADA' }

    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(payload),
    })

    const result = await adoptionsApi.update('AD-001', payload)

    const [url, options] = fetch.mock.calls[0]

    expect(result).toEqual(payload)
    expect(url).toContain('/adoptions/AD-001')
    expect(options.method).toBe('PUT')
    expect(JSON.parse(options.body)).toEqual(payload)
  })


  it('elimina una adopción mediante DELETE', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 204,
      json: vi.fn(),
    })

    const result = await adoptionsApi.delete('AD-001')

    const [url, options] = fetch.mock.calls[0]

    expect(result).toBeNull()
    expect(url).toContain('/adoptions/AD-001')
    expect(options.method).toBe('DELETE')
  })


  it('retorna null cuando el backend responde 204', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 204,
      json: vi.fn(),
    })

    const result = await adoptionsApi.get('AD-001')

    expect(result).toBeNull()
  })

  it('retorna los datos cuando la respuesta es exitosa', async () => {
    const data = { id: 'AD-003', status: 'ACTIVA' }

    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(data),
    })

    const result = await adoptionsApi.list()

    expect(result).toEqual(data)
  })

  it('propaga el error cuando falla la lectura del JSON de una respuesta exitosa', async () => {
    const jsonError = new Error('Error al interpretar JSON')

    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockRejectedValue(jsonError),
    })

    await expect(adoptionsApi.list()).rejects.toThrow(
      'Error al interpretar JSON',
    )
  })


  it('maneja los errores de conexión con el backend', async () => {
    fetch.mockRejectedValue(new Error('Network error'))

    await expect(adoptionsApi.list()).rejects.toThrow(
      'No fue posible conectar con el servidor. Verifica que el backend esté en ejecución.',
    )
  })


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

    await expect(adoptionsApi.list()).rejects.toThrow(
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

    await expect(adoptionsApi.list()).rejects.toThrow(
      'Solicitud inválida',
    )
  })

  it('utiliza el mensaje genérico cuando el JSON no contiene mensajes', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({}),
    })

    await expect(adoptionsApi.list()).rejects.toThrow(
      'Ocurrió un error al procesar la adopción.',
    )
  })

  it('utiliza el mensaje genérico cuando el cuerpo JSON es null', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue(null),
    })

    await expect(adoptionsApi.list()).rejects.toThrow(
      'Ocurrió un error al procesar la adopción.',
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

    await expect(adoptionsApi.list()).rejects.toThrow(
      'Ocurrió un error al procesar la adopción.',
    )
  })

  it('utiliza el mensaje genérico cuando la respuesta de error no es JSON', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
    })

    await expect(adoptionsApi.list()).rejects.toThrow(
      'Ocurrió un error al procesar la adopción.',
    )
  })


  it('muestra un mensaje específico cuando la adopción no existe', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: vi.fn().mockResolvedValue({
        message: 'No encontrada',
      }),
    })

    await expect(adoptionsApi.get('AD-999')).rejects.toThrow(
      'La adopción no fue encontrada.',
    )
  })
})
