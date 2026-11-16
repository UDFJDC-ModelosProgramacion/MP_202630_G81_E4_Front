import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from './apiClient'
import { createNotification } from './notificationService'

vi.mock('./apiClient', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const data = {
  userId: '5',
  adoptionId: '12',
  petId: '',
  channel: 'email',
  content: '  Tu solicitud fue aprobada ',
}

describe('createNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends the ids nested, as numbers, and trims the content', async () => {
    api.post.mockResolvedValue({ id: 1 })

    await createNotification(data)

    expect(api.post).toHaveBeenCalledWith('/notifications', {
      channel: 'email',
      content: 'Tu solicitud fue aprobada',
      user: { id: 5 },
      adoption: { id: 12 },
    })
  })

  it('includes the pet when one is given', async () => {
    api.post.mockResolvedValue({ id: 1 })

    await createNotification({ ...data, petId: '2' })

    expect(api.post).toHaveBeenCalledWith('/notifications', {
      channel: 'email',
      content: 'Tu solicitud fue aprobada',
      user: { id: 5 },
      adoption: { id: 12 },
      pet: { id: 2 },
    })
  })

  it('lets the error of the back reach the screen', async () => {
    api.post.mockRejectedValue(new Error('El canal no es válido'))

    await expect(createNotification(data)).rejects.toThrow('El canal no es válido')
  })
})