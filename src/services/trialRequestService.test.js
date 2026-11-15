import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from './apiClient'
import { createTrialRequest, listTrialRequests, updateTrialRequest } from './trialRequestService'

vi.mock('./apiClient', () => ({ api: { get: vi.fn(), post: vi.fn(), put: vi.fn() } }))

beforeEach(() => vi.clearAllMocks())

describe('trialRequestService', () => {
  it('lista los periodos de prueba', async () => {
    api.get.mockResolvedValue([{ id: 1 }])
    expect(await listTrialRequests()).toEqual([{ id: 1 }])
    expect(api.get).toHaveBeenCalledWith('/trial-requests')
  })

  it('crea mandando las asociaciones solo con id', async () => {
    api.post.mockResolvedValue({ id: 5 })
    await createTrialRequest({ status: 'ACTIVA', adopter: { id: 12 }, shelter: { id: 2 }, pet: { id: 1 } })
    expect(api.post).toHaveBeenCalledWith('/trial-requests', {
      status: 'ACTIVA', adopter: { id: 12 }, shelter: { id: 2 }, pet: { id: 1 },
    })
  })

  it('actualiza sin mandar el DetailDTO completo', async () => {
    api.put.mockResolvedValue({})
    await updateTrialRequest(1, {
      id: 1, status: 'FINALIZADA',
      adopter: { id: 12, name: 'Carlos' }, pet: { id: 1, name: 'Rocky' },
    })
    expect(api.put).toHaveBeenCalledWith('/trial-requests/1', {
      id: 1, status: 'FINALIZADA', adopter: { id: 12 }, pet: { id: 1 },
    })
  })

  it('deja subir el error del back', async () => {
    api.get.mockRejectedValue(new Error('No encontrado'))
    await expect(listTrialRequests()).rejects.toThrow('No encontrado')
  })
})