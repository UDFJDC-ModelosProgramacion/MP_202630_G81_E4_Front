import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  deleteAdopter,
  getAdopter,
  getAdopterSummary,
  updateAdopter,
} from '../../services/adopterService'
import ProfilePage from './ProfilePage'

// La pantalla ya habla con el back a través del service: se mockea el service
// para que la prueba no dependa de que el back esté corriendo.
vi.mock('../../services/adopterService', () => ({
  getAdopter: vi.fn(),
  updateAdopter: vi.fn(),
  deleteAdopter: vi.fn(),
  getAdopterSummary: vi.fn(),
}))

const ADOPTER = {
  id: 1,
  address: 'Carrera 7 # 40-10, Bogotá',
  phone: '310 555 6677',
  occupation: 'Ingeniera',
}
const WITH_RECORDS = { requestsCount: 3, adoptionsCount: 1, reviewsCount: 2 }
const WITHOUT_RECORDS = { requestsCount: 0, adoptionsCount: 0, reviewsCount: 0 }

function renderLoaded(summary = WITH_RECORDS, adopterId) {
  getAdopter.mockResolvedValue(ADOPTER)
  getAdopterSummary.mockResolvedValue(summary)
  return render(<ProfilePage adopterId={adopterId} />)
}

beforeEach(() => vi.clearAllMocks())

describe('ProfilePage (HU12)', () => {
  it('shows the data of the adopter and the name of the current user', async () => {
    renderLoaded()
    expect(await screen.findByRole('heading', { name: 'María Gómez' })).toBeInTheDocument()
    expect(screen.getByText('Adoptante · ID 1')).toBeInTheDocument()
    expect(screen.getByText('MG')).toBeInTheDocument()
    expect(screen.getByLabelText(/Dirección/)).toHaveValue('Carrera 7 # 40-10, Bogotá')
    expect(screen.getByLabelText(/Teléfono/)).toHaveValue('310 555 6677')
    expect(screen.getByLabelText(/Ocupación/)).toHaveValue('Ingeniera')
    expect(getAdopter).toHaveBeenCalledWith(1)
    expect(getAdopterSummary).toHaveBeenCalledWith(1)
  })

  it('shows the counters of requests, adoptions and reviews', async () => {
    renderLoaded()
    await screen.findByRole('heading', { name: 'María Gómez' })
    expect(screen.getByText('Solicitudes').previousSibling).toHaveTextContent('3')
    expect(screen.getByText('Adopciones').previousSibling).toHaveTextContent('1')
    expect(screen.getByText('Reseñas').previousSibling).toHaveTextContent('2')
  })

  it('saves the changes', async () => {
    updateAdopter.mockResolvedValue({ ...ADOPTER, occupation: 'Médica' })
    renderLoaded()
    const occupation = await screen.findByLabelText(/Ocupación/)
    await userEvent.clear(occupation)
    await userEvent.type(occupation, 'Médica')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Cambios guardados.')
    expect(updateAdopter).toHaveBeenCalledWith(1, {
      address: 'Carrera 7 # 40-10, Bogotá',
      phone: '310 555 6677',
      occupation: 'Médica',
    })
    expect(screen.getByLabelText(/Ocupación/)).toHaveValue('Médica')
  })

  it('shows the reason of the back when the address is missing', async () => {
    updateAdopter.mockRejectedValue(new Error('La dirección del adoptante es obligatoria.'))
    renderLoaded()
    await userEvent.clear(await screen.findByLabelText(/Dirección/))
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'La dirección del adoptante es obligatoria.',
    )
  })

  it('shows the reason of the back when the phone is missing', async () => {
    updateAdopter.mockRejectedValue(new Error('El teléfono del adoptante es obligatorio.'))
    renderLoaded()
    await userEvent.clear(await screen.findByLabelText(/Teléfono/))
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El teléfono del adoptante es obligatorio.',
    )
  })

  it('shows the reason of the back when the address cannot be changed', async () => {
    updateAdopter.mockRejectedValue(
      new Error('No se puede modificar la dirección de un adoptante con solicitudes pendientes.'),
    )
    renderLoaded()
    await userEvent.click(await screen.findByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('solicitudes pendientes')
  })

  it('discards the unsaved changes', async () => {
    renderLoaded()
    const phone = await screen.findByLabelText(/Teléfono/)
    await userEvent.clear(phone)
    await userEvent.type(phone, '999')
    await userEvent.click(screen.getByRole('button', { name: 'Descartar' }))
    expect(screen.getByLabelText(/Teléfono/)).toHaveValue('310 555 6677')
    expect(updateAdopter).not.toHaveBeenCalled()
  })

  it('does not allow deleting an adopter that has records', async () => {
    renderLoaded()
    expect(await screen.findByText(/No disponible: tienes adopciones/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eliminar mi registro' })).toBeDisabled()
  })

  it('deletes an adopter that has no records', async () => {
    deleteAdopter.mockResolvedValue(null)
    renderLoaded(WITHOUT_RECORDS)
    const deleteButton = await screen.findByRole('button', { name: 'Eliminar mi registro' })
    expect(deleteButton).toBeEnabled()
    await userEvent.click(deleteButton)
    expect(deleteAdopter).toHaveBeenCalledWith(1)
    expect(await screen.findByText('Tu registro de adoptante fue eliminado.')).toBeInTheDocument()
  })

  it('shows the reason of the back when the deletion is rejected', async () => {
    deleteAdopter.mockRejectedValue(
      new Error('No se puede eliminar un adoptante que tiene reseñas registradas.'),
    )
    renderLoaded(WITHOUT_RECORDS)
    await userEvent.click(await screen.findByRole('button', { name: 'Eliminar mi registro' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('tiene reseñas registradas')
  })

  it('shows the error when the adopter does not exist', async () => {
    getAdopter.mockRejectedValue(new Error('El adoptante con ID 999 no existe.'))
    getAdopterSummary.mockResolvedValue(WITHOUT_RECORDS)
    render(<ProfilePage adopterId={999} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('El adoptante con ID 999 no existe.')
  })

  it('asks the back for the adopter that it receives by property', async () => {
    renderLoaded(WITHOUT_RECORDS, 7)
    await screen.findByLabelText(/Dirección/)
    expect(getAdopter).toHaveBeenCalledWith(7)
  })
})
