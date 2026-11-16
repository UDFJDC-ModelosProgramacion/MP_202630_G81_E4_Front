import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import {
  createAdoptionRequest,
  listAdoptionRequests,
  listPets,
} from '../../services/adoptionRequestService'
import AdoptionRequestPage from './AdoptionRequestPage'

// La pantalla ya habla con el back a través del service: se mockea el service
// para que la prueba no dependa de que el back esté corriendo.
vi.mock('../../services/adoptionRequestService', () => ({
  REQUEST_STATUS: { PENDING: 'PENDIENTE', APPROVED: 'APROBADO', CANCELLED: 'CANCELADO' },
  listPets: vi.fn(),
  listAdoptionRequests: vi.fn(),
  createAdoptionRequest: vi.fn(),
}))

const PETS = [
  { id: 1, name: 'Luna', breed: 'Labrador', age: 2, shelter: 'Bogotá', adoptionStatus: 'DISPONIBLE' },
  { id: 2, name: 'Max', breed: 'Beagle', age: 4, shelter: 'Cali', adoptionStatus: 'ADOPTADA' },
  { id: 3, name: 'Nala', breed: 'Criollo', age: 1, shelter: 'Medellín', adoptionStatus: 'DISPONIBLE' },
  { id: 4, name: 'Toby', breed: 'Poodle', age: 3, shelter: 'Bogotá', adoptionStatus: '' },
]

const REQUESTS = [
  { id: 1, adopterId: 1, petId: 1, dateRequest: '2026-10-21', status: 'PENDIENTE', description: '', pet: { id: 1, name: 'Luna' } },
  { id: 2, adopterId: 1, petId: 2, dateRequest: '2026-09-30', status: 'APROBADO', description: '', pet: { id: 2, name: 'Max' } },
  { id: 3, adopterId: 1, petId: 3, dateRequest: '2026-09-12', status: 'CANCELADO', description: '', pet: { id: 3, name: 'Nala' } },
]

function renderPage(path = '/adoptions/new') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/adoptions/new" element={<AdoptionRequestPage />} />
        <Route path="/adoptions" element={<p>Pantalla de adopciones</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  listPets.mockResolvedValue(PETS)
  listAdoptionRequests.mockResolvedValue(REQUESTS)
})

describe('AdoptionRequestPage (HU02)', () => {
  it('shows the form with the adopter and the pending status', async () => {
    renderPage()
    expect(await screen.findByLabelText('Adoptante')).toHaveValue('María Gómez (ID 1)')
    expect(screen.getByLabelText('Estado')).toHaveValue('PENDIENTE')
    expect(screen.getByLabelText(/Mascota/)).toHaveValue('')
    expect(listAdoptionRequests).toHaveBeenCalledWith(1)
  })

  it('shows the pets with their breed, age, shelter and adoption status', async () => {
    renderPage()
    expect(
      await screen.findByRole('option', { name: 'Luna · Labrador · 2 años · Bogotá · Disponible' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Max · Beagle · 4 años · Cali · Adoptada' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Toby · Poodle · 3 años · Bogotá · Sin estado' }),
    ).toBeInTheDocument()
  })

  it('shows the error when the data cannot be loaded', async () => {
    listPets.mockRejectedValue(new Error('No hay conexión con el servidor.'))
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('Ocurrió un error')
  })

  it('lists the requests of the adopter with their status', async () => {
    renderPage()
    await screen.findByRole('heading', { name: 'Mis solicitudes' })
    expect(screen.getByText('PENDIENTE')).toBeInTheDocument()
    expect(screen.getByText('APROBADO')).toBeInTheDocument()
    expect(screen.getByText('CANCELADO')).toBeInTheDocument()
  })

  it('tells when the adopter has no requests yet', async () => {
    listAdoptionRequests.mockResolvedValue([])
    renderPage()
    expect(await screen.findByText('Aún no tienes solicitudes.')).toBeInTheDocument()
  })

  it('preselects the pet received in the address', async () => {
    renderPage('/adoptions/new?petId=3')
    expect(await screen.findByLabelText(/Mascota/)).toHaveValue('3')
  })

  it('registers a request and shows it in the list', async () => {
    createAdoptionRequest.mockResolvedValue({
      id: 9,
      adopterId: 1,
      petId: 4,
      dateRequest: '2026-11-15',
      status: 'PENDIENTE',
      description: 'Tengo un patio cercado.',
      pet: { id: 4, name: 'Toby' },
    })
    renderPage()
    await userEvent.selectOptions(await screen.findByLabelText(/Mascota/), '4')
    await userEvent.type(screen.getByLabelText('Descripción'), 'Tengo un patio cercado.')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }))
    expect(createAdoptionRequest).toHaveBeenCalledWith({
      adopterId: 1,
      petId: 4,
      dateRequest: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      description: 'Tengo un patio cercado.',
    })
    expect(await screen.findByRole('status')).toHaveTextContent('Solicitud registrada para Toby.')
    expect(screen.getByText('Toby', { selector: 'strong' })).toBeInTheDocument()
    expect(screen.getByLabelText(/Mascota/)).toHaveValue('')
  })

  it('sends no pet when none is selected and shows the reason', async () => {
    createAdoptionRequest.mockRejectedValue(
      new Error('No se pudo registrar la solicitud: debes seleccionar una mascota válida.'),
    )
    renderPage()
    await userEvent.click(await screen.findByRole('button', { name: 'Enviar solicitud' }))
    expect(createAdoptionRequest).toHaveBeenCalledWith(expect.objectContaining({ petId: null }))
    expect(await screen.findByRole('alert')).toHaveTextContent('debes seleccionar una mascota válida')
  })

  it('shows the reason when the pet was already adopted', async () => {
    createAdoptionRequest.mockRejectedValue(
      new Error('No se pudo registrar la solicitud porque la mascota ya fue adoptada.'),
    )
    renderPage()
    await userEvent.selectOptions(await screen.findByLabelText(/Mascota/), '2')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('la mascota ya fue adoptada')
  })

  it('shows the reason when the date is missing', async () => {
    createAdoptionRequest.mockRejectedValue(
      new Error('No se pudo registrar la solicitud: la fecha de solicitud es obligatoria.'),
    )
    renderPage()
    await userEvent.selectOptions(await screen.findByLabelText(/Mascota/), '4')
    fireEvent.change(screen.getByLabelText(/Fecha de solicitud/), { target: { value: '' } })
    await userEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }))
    expect(createAdoptionRequest).toHaveBeenCalledWith(expect.objectContaining({ dateRequest: '' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('la fecha de solicitud es obligatoria')
  })

  it('shows the reason when there is already a pending request for the pet', async () => {
    createAdoptionRequest.mockRejectedValue(
      new Error(
        'No se pudo registrar la solicitud porque ya tienes una solicitud pendiente para esta mascota.',
      ),
    )
    renderPage()
    await userEvent.selectOptions(await screen.findByLabelText(/Mascota/), '1')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'ya tienes una solicitud pendiente para esta mascota',
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('goes back to adoptions when the user cancels', async () => {
    renderPage()
    await userEvent.click(await screen.findByRole('button', { name: 'Cancelar' }))
    expect(screen.getByText('Pantalla de adopciones')).toBeInTheDocument()
  })
})
