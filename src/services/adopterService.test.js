import { beforeEach, describe, it, expect } from 'vitest'
import { resetAdoptionRequests, createAdoptionRequest } from './adoptionRequestService'
import { deleteAdopter, getAdopter, resetAdopters, updateAdopter } from './adopterService'

describe('adopterService', () => {
  beforeEach(() => {
    resetAdopters()
    resetAdoptionRequests()
  })

  it('gets an adopter', async () => {
    const adopter = await getAdopter(12)
    expect(adopter.name).toBe('María Gómez')
  })

  it('reports an adopter that does not exist', async () => {
    await expect(getAdopter(99)).rejects.toThrow('El adoptante con ID 99 no existe.')
  })

  describe('updateAdopter', () => {
    it('saves the new data', async () => {
      const updated = await updateAdopter(12, {
        address: 'Calle 1 # 2-3',
        phone: '300 000 0000',
        occupation: 'Médica',
      })
      expect(updated.occupation).toBe('Médica')
      expect((await getAdopter(12)).address).toBe('Calle 1 # 2-3')
    })

    it('requires the address', async () => {
      await expect(updateAdopter(12, { address: ' ', phone: '300', occupation: '' })).rejects.toThrow(
        'La dirección del adoptante es obligatoria.',
      )
    })

    it('requires the phone', async () => {
      await expect(updateAdopter(12, { address: 'Calle 1', phone: '', occupation: '' })).rejects.toThrow(
        'El teléfono del adoptante es obligatorio.',
      )
    })

    it('reports an adopter that does not exist', async () => {
      await expect(
        updateAdopter(99, { address: 'Calle 1', phone: '300', occupation: '' }),
      ).rejects.toThrow('El adoptante con ID 99 no existe.')
    })
  })

  describe('deleteAdopter', () => {
    it('deletes an adopter without adoptions, requests or reviews', async () => {
      await deleteAdopter(13)
      await expect(getAdopter(13)).rejects.toThrow('El adoptante con ID 13 no existe.')
    })

    it('does not delete an adopter with adoptions', async () => {
      await expect(deleteAdopter(12)).rejects.toThrow(
        'No se puede eliminar un adoptante que tiene adopciones registradas.',
      )
    })

    it('does not delete an adopter with requests', async () => {
      await createAdoptionRequest({ adopterId: 13, petId: 1, dateRequest: '2026-10-25', description: '' })
      await expect(deleteAdopter(13)).rejects.toThrow(
        'No se puede eliminar un adoptante que tiene solicitudes de adopción registradas.',
      )
    })

    it('does not delete an adopter with reviews', async () => {
      await expect(deleteAdopter(14)).rejects.toThrow(
        'No se puede eliminar un adoptante que tiene reseñas registradas.',
      )
    })

    it('reports an adopter that does not exist', async () => {
      await expect(deleteAdopter(99)).rejects.toThrow('El adoptante con ID 99 no existe.')
    })
  })
})
