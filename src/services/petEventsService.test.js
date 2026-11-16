import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api, ApiError } from './apiClient'
import { getPetDetailsAndEvents, savePetEvent } from './petEventsService'

// Se mockea solo 'api' y se conserva la clase real ApiError, porque el
// service usa 'error instanceof ApiError' para traducir el 404.
vi.mock('./apiClient', async () => {
  const actual = await vi.importActual('./apiClient')
  return { ...actual, api: { get: vi.fn(), post: vi.fn() } }
})

const petDto = {
  id: 1,
  name: 'Luna',
  healthStatus: 'Sano',
  events: [
    { id: 10, type: 'Reporte Médico', date: '2026-01-10', description: 'Vacuna aplicada.' },
  ],
}

beforeEach(() => vi.clearAllMocks())

describe('petEventsService', () => {
  it('lee la mascota y sus eventos anidados en GET /pets/{id}', async () => {
    api.get.mockResolvedValue(petDto)

    const data = await getPetDetailsAndEvents(1)

    expect(api.get).toHaveBeenCalledWith('/pets/1')
    expect(data).toEqual({
      pet: { id: 1, name: 'Luna', healthStatus: 'Sano' },
      events: [
        { id: 10, type: 'Reporte Médico', date: '2026-01-10', description: 'Vacuna aplicada.' },
      ],
    })
  })

  it('devuelve una lista de eventos vacía cuando el DTO no los trae', async () => {
    api.get.mockResolvedValue({ ...petDto, events: undefined })

    const data = await getPetDetailsAndEvents(1)

    expect(data.events).toEqual([])
  })

  it('traduce el 404 al mensaje de mascota no encontrada', async () => {
    api.get.mockRejectedValue(new ApiError(404, 'Not found'))

    await expect(getPetDetailsAndEvents(999)).rejects.toThrow(
      'La mascota indicada no fue encontrada.',
    )
  })

  it('deja subir otros errores del back sin traducirlos', async () => {
    api.get.mockRejectedValue(new ApiError(500, 'Error interno del servidor.'))

    await expect(getPetDetailsAndEvents(1)).rejects.toThrow('Error interno del servidor.')
  })

  it('registra un evento con POST /pets/{petId}/events', async () => {
    const event = { type: 'Otro', date: '2026-01-10', description: 'Paseo' }
    api.post.mockResolvedValue({ id: 20, ...event })

    const created = await savePetEvent(1, event)

    expect(api.post).toHaveBeenCalledWith('/pets/1/events', event)
    expect(created).toEqual({ id: 20, ...event })
  })

  it('deja subir el error del back cuando el registro falla', async () => {
    api.post.mockRejectedValue(new ApiError(400, 'Los datos enviados no son válidos.'))

    await expect(
      savePetEvent(1, { type: 'Otro', date: '2026-01-10', description: 'x' }),
    ).rejects.toThrow('Los datos enviados no son válidos.')
  })
})
