import { describe, it, expect } from 'vitest'
import {
  createShelter,
  deleteShelter,
  getShelterById,
  getShelters,
  updateShelter,
} from './shelterService'

// Sin VITE_API_BASE_URL, todas las llamadas caen al mock local.

describe('shelterService (HU13)', () => {
  it('getShelters retorna la lista de refugios del mock', async () => {
    const list = await getShelters()
    expect(list.length).toBeGreaterThan(0)
    expect(list[0]).toHaveProperty('nit')
    expect(list[0]).toHaveProperty('name')
  })

  it('getShelterById retorna un refugio existente', async () => {
    const shelter = await getShelterById(2)
    expect(shelter.id).toBe(2)
    expect(shelter).toHaveProperty('nit')
  })

  it('getShelterById lanza error 404 si no existe', async () => {
    await expect(getShelterById(999)).rejects.toThrow(/no fue encontrado/)
  })

  it('createShelter registra un refugio válido', async () => {
    const payload = {
      nit: '900777000-9',
      name: 'Refugio Test',
      address: 'Calle Test 123',
      phone: '3100000000',
      capacity: 15,
      email: 'test@refugio.org',
    }
    const created = await createShelter(payload)
    expect(created).toHaveProperty('id')
    expect(created.nit).toBe('900777000-9')
    expect(created.capacity).toBe(15)
  })

  it('createShelter rechaza si el NIT ya existe', async () => {
    await expect(
      createShelter({
        nit: '900123456-1',
        name: 'Duplicado',
        capacity: 10,
      }),
    ).rejects.toThrow(/ya existe un refugio con ese NIT/i)
  })

  it('createShelter rechaza si falta el NIT', async () => {
    await expect(
      createShelter({ nit: '', name: 'Sin NIT', capacity: 10 }),
    ).rejects.toThrow(/NIT es obligatorio/)
  })

  it('createShelter rechaza si falta el nombre', async () => {
    await expect(
      createShelter({ nit: '900111222-3', name: '', capacity: 10 }),
    ).rejects.toThrow(/nombre es obligatorio/)
  })

  it('createShelter rechaza si la capacidad es <= 0', async () => {
    await expect(
      createShelter({ nit: '900333444-5', name: 'Capacidad cero', capacity: 0 }),
    ).rejects.toThrow(/capacidad debe ser un número mayor a 0/)
  })

  it('updateShelter actualiza un refugio existente', async () => {
    const updated = await updateShelter(2, {
      nit: '900987654-2',
      name: 'Patitas del Norte Actualizado',
      address: 'Nueva dirección',
      phone: '3115555678',
      capacity: 30,
      email: 'nuevo@patitas.org',
    })
    expect(updated.id).toBe(2)
    expect(updated.name).toBe('Patitas del Norte Actualizado')
    expect(updated.capacity).toBe(30)
  })

  it('updateShelter lanza error 404 si no existe', async () => {
    await expect(
      updateShelter(999, { nit: '900555666-7', name: 'Inexistente', capacity: 5 }),
    ).rejects.toThrow(/no fue encontrado/)
  })

  it('deleteShelter elimina un refugio sin mascotas asociadas', async () => {
    const result = await deleteShelter(3)
    expect(result).toBeNull()
    const list = await getShelters()
    expect(list.find((s) => s.id === 3)).toBeUndefined()
  })

  it('deleteShelter lanza error 404 si no existe', async () => {
    await expect(deleteShelter(999)).rejects.toThrow(/no fue encontrado/)
  })

  it('deleteShelter rechaza si el refugio tiene mascotas o procesos activos', async () => {
    await expect(deleteShelter(1)).rejects.toThrow(
      /tiene mascotas o procesos activos asociados/,
    )
  })
})