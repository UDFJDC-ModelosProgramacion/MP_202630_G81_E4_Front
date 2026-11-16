import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from './apiClient'
import { getAdoptionRequests, updateAdoptionRequest } from './adoptionRequestsService'
import { createAdoption } from './adoptionService'
import { toBackDate } from '../utils/backDate'

vi.mock('./apiClient', () => ({ api: { get: vi.fn(), post: vi.fn(), put: vi.fn() } }))

beforeEach(() => vi.clearAllMocks())

describe('servicios de adopción', () => {
  it('lista las solicitudes de adopción', async () => {
    api.get.mockResolvedValue([])
    await getAdoptionRequests()
    expect(api.get).toHaveBeenCalledWith('/adoption-requests')
  })

  it('actualiza una solicitud', async () => {
    api.put.mockResolvedValue({})
    await updateAdoptionRequest(3, { id: 3, status: 'APROBADO' })
    expect(api.put).toHaveBeenCalledWith('/adoption-requests/3', { id: 3, status: 'APROBADO' })
  })

  it('registra una adopción', async () => {
    api.post.mockResolvedValue({ id: 9 })
    await createAdoption({ adoptionId: 'AD-1' })
    expect(api.post).toHaveBeenCalledWith('/adoptions', { adoptionId: 'AD-1' })
  })

  it('convierte la fecha al formato del back', () => {
    expect(toBackDate('2026-11-01')).toBe('2026-11-01T00:00:00.000Z')
  })
})