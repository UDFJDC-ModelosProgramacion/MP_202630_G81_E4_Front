import { describe, it, expect } from 'vitest'
import {
  createVeterinarian,
  deleteVeterinarian,
  getShelterSummary,
  listVeterinarians,
  updateVeterinarian,
} from './veterinarianService'

const data = { name: 'Dr. Nuevo', license: 'MV-99999', phone: '300 000 0000' }

describe('veterinarianService', () => {
  it('returns the shelter summary', async () => {
    const shelter = await getShelterSummary('1')
    expect(shelter.name).toBe('Huellitas del Norte')
  })

  it('rejects the summary of a shelter that does not exist', async () => {
    await expect(getShelterSummary('999')).rejects.toThrow('Refugio no encontrado')
  })

  it('lists the veterinarians of a shelter', async () => {
    const list = await listVeterinarians('1')
    expect(list.length).toBeGreaterThanOrEqual(3)
  })

  it('rejects listing the veterinarians of a shelter that does not exist', async () => {
    await expect(listVeterinarians('999')).rejects.toThrow('Refugio no encontrado')
  })

  it('creates a veterinarian and trims its fields', async () => {
    const created = await createVeterinarian('1', { ...data, name: '  Dr. Nuevo  ' })
    expect(created.name).toBe('Dr. Nuevo')
    const list = await listVeterinarians('1')
    expect(list.some((vet) => vet.id === created.id)).toBe(true)
  })

  it('does not create a veterinarian in a shelter that does not exist', async () => {
    await expect(createVeterinarian('999', data)).rejects.toThrow('Refugio no encontrado')
  })

  it('updates a veterinarian', async () => {
    const created = await createVeterinarian('1', data)
    const updated = await updateVeterinarian('1', created.id, { ...data, name: 'Dr. Cambiado' })
    expect(updated.name).toBe('Dr. Cambiado')
    const list = await listVeterinarians('1')
    expect(list.find((vet) => vet.id === created.id).name).toBe('Dr. Cambiado')
  })

  it('rejects updating a veterinarian that does not exist', async () => {
    await expect(updateVeterinarian('1', 999, data)).rejects.toThrow('Veterinario no encontrado')
  })

  it('rejects updating in a shelter that does not exist', async () => {
    await expect(updateVeterinarian('999', 1, data)).rejects.toThrow('Refugio no encontrado')
  })

  it('deletes a veterinarian', async () => {
    const created = await createVeterinarian('1', data)
    await deleteVeterinarian('1', created.id)
    const list = await listVeterinarians('1')
    expect(list.some((vet) => vet.id === created.id)).toBe(false)
  })

  it('rejects deleting a veterinarian that does not exist', async () => {
    await expect(deleteVeterinarian('1', 999)).rejects.toThrow('Veterinario no encontrado')
  })

  it('rejects deleting in a shelter that does not exist', async () => {
    await expect(deleteVeterinarian('999', 1)).rejects.toThrow('Refugio no encontrado')
  })
})