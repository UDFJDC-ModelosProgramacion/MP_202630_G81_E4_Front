import { describe, it, expect } from 'vitest'
import {
  createFollowUp,
  getActiveAdoptions,
  getFollowUpById,
  getPets,
  getVets,
  updateFollowUp,
} from './followUpService'

// Como no hay VITE_API_BASE_URL configurada en tests, todas las llamadas
// caen al mock local, lo que permite cubrir esas rutas.

describe('followUpService (HU07)', () => {
  it('getActiveAdoptions retorna adopciones activas del mock', async () => {
    const list = await getActiveAdoptions()
    expect(list.length).toBeGreaterThan(0)
    expect(list.every((a) => a.status === 'ACTIVA')).toBe(true)
  })

  it('getPets retorna la lista de mascotas del mock', async () => {
    const list = await getPets()
    expect(list.length).toBeGreaterThan(0)
    expect(list[0]).toHaveProperty('name')
  })

  it('getVets retorna la lista de veterinarios del mock', async () => {
    const list = await getVets()
    expect(list.length).toBeGreaterThan(0)
    expect(list[0]).toHaveProperty('name')
  })

  it('getFollowUpById retorna un seguimiento existente enriquecido', async () => {
    const fu = await getFollowUpById('FU-001')
    expect(fu.id).toBe('FU-001')
    expect(fu).toHaveProperty('petName')
    expect(fu).toHaveProperty('vetName')
    expect(fu).toHaveProperty('adopterName')
  })

  it('getFollowUpById lanza error 404 si no existe', async () => {
    await expect(getFollowUpById('FU-999')).rejects.toThrow(/no fue encontrado/)
  })

  it('createFollowUp registra un seguimiento válido', async () => {
    const payload = {
      adoptionId: 'AD-101',
      petId: 1,
      vetId: 1,
      date: '2026-11-01',
      notes: 'Control de rutina',
      status: 'Programado',
    }
    const created = await createFollowUp(payload)
    expect(created.id).toMatch(/^FU-/)
    expect(created.petName).toBe('Toby')
    expect(created.vetName).toBe('Dr. Juan Parrado')
  })

  it('createFollowUp rechaza si la adopción no es activa o no existe', async () => {
    await expect(
      createFollowUp({
        adoptionId: 'AD-999',
        petId: 1,
        vetId: 1,
        date: '2026-11-01',
      }),
    ).rejects.toThrow(/adopción indicada no existe o no está activa/)
  })

  it('createFollowUp rechaza si la mascota no existe', async () => {
    await expect(
      createFollowUp({
        adoptionId: 'AD-101',
        petId: 999,
        vetId: 1,
        date: '2026-11-01',
      }),
    ).rejects.toThrow(/mascota indicada no fue encontrada/)
  })

  it('createFollowUp rechaza si el veterinario no existe', async () => {
    await expect(
      createFollowUp({
        adoptionId: 'AD-101',
        petId: 1,
        vetId: 999,
        date: '2026-11-01',
      }),
    ).rejects.toThrow(/veterinario indicado no fue encontrado/)
  })

  it('createFollowUp rechaza si falta la fecha obligatoria', async () => {
    await expect(
      createFollowUp({
        adoptionId: 'AD-101',
        petId: 1,
        vetId: 1,
        date: '',
      }),
    ).rejects.toThrow(/fecha de seguimiento es obligatoria/)
  })

  it('updateFollowUp actualiza un seguimiento existente', async () => {
    const updated = await updateFollowUp('FU-002', {
      adoptionId: 'AD-104',
      petId: 4,
      vetId: 2,
      date: '2026-11-02',
      notes: 'Nota actualizada en test',
      status: 'Realizado',
    })
    expect(updated.id).toBe('FU-002')
    expect(updated.notes).toBe('Nota actualizada en test')
    expect(updated.status).toBe('Realizado')
  })

  it('updateFollowUp lanza error 404 si el seguimiento no existe', async () => {
    await expect(
      updateFollowUp('FU-999', { date: '2026-11-02' }),
    ).rejects.toThrow(/no fue encontrado/)
  })
})  