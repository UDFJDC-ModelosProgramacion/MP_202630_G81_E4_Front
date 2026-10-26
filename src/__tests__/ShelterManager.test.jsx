import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ShelterManager from '../components/Shelter/ShelterManager'
import * as service from '../services/shelterService'

vi.mock('../services/shelterService')

const MOCK_SHELTERS = [
  {
    id: 1,
    nit: '900123456-1',
    name: 'Huellas Felices',
    address: 'Calle 72 #10-25',
    phone: '3105551234',
    capacity: 40,
    email: 'a@b.org',
  },
  {
    id: 2,
    nit: '900987654-2',
    name: 'Patitas del Norte',
    address: 'Av. Caracas #150-30',
    phone: '3115555678',
    capacity: 25,
    email: 'c@d.org',
  },
]

describe('HU13 - ShelterManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    service.getShelters.mockResolvedValue(MOCK_SHELTERS)
    service.createShelter.mockResolvedValue({ id: 3 })
    service.updateShelter.mockResolvedValue({ id: 1 })
    service.deleteShelter.mockResolvedValue(null)
  })

  function renderManager() {
    return render(
      <MemoryRouter>
        <ShelterManager />
      </MemoryRouter>,
    )
  }

  it('muestra la lista de refugios cargada', async () => {
    renderManager()
    await waitFor(() => {
      expect(screen.getByText('Huellas Felices')).toBeInTheDocument()
    })
    expect(screen.getByText('Patitas del Norte')).toBeInTheDocument()
    expect(screen.getByText('900123456-1')).toBeInTheDocument()
  })

  it('abre el formulario de registro al hacer clic en Registrar refugio', async () => {
    const user = userEvent.setup()
    renderManager()
    await waitFor(() => screen.getByText('Huellas Felices'))

    await user.click(screen.getByRole('button', { name: /registrar refugio/i }))
    expect(await screen.findByText(/registrar nuevo refugio/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/NIT/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/capacidad/i)).toBeInTheDocument()
  })

  it('valida campos obligatorios (NIT, nombre, capacidad)', async () => {
    const user = userEvent.setup()
    renderManager()
    await waitFor(() => screen.getByText('Huellas Felices'))

    await user.click(screen.getByRole('button', { name: /registrar refugio/i }))
    await waitFor(() => screen.getByLabelText(/NIT/i))
    await user.click(screen.getByRole('button', { name: /guardar refugio/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/NIT es obligatorio/i)
    expect(service.createShelter).not.toHaveBeenCalled()
  })

  it('crea un refugio con datos válidos', async () => {
    const user = userEvent.setup()
    renderManager()
    await waitFor(() => screen.getByText('Huellas Felices'))

    await user.click(screen.getByRole('button', { name: /registrar refugio/i }))
    await waitFor(() => screen.getByLabelText(/NIT/i))

    await user.type(screen.getByLabelText(/NIT/i), '900777888-9')
    await user.type(screen.getByLabelText(/nombre/i), 'Refugio Test')
    await user.type(screen.getByLabelText(/capacidad/i), '15')
    await user.click(screen.getByRole('button', { name: /guardar refugio/i }))

    await waitFor(() => {
      expect(service.createShelter).toHaveBeenCalledWith(
        expect.objectContaining({ nit: '900777888-9', name: 'Refugio Test', capacity: 15 }),
      )
    })
  })

  it('carga datos en el formulario al editar', async () => {
    const user = userEvent.setup()
    renderManager()
    await waitFor(() => screen.getByText('Huellas Felices'))

    const editButtons = screen.getAllByRole('button', { name: /actualizar/i })
    await user.click(editButtons[0])

    expect(await screen.findByRole('heading', { name: /actualizar refugio/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/NIT/i)).toHaveValue('900123456-1')
    expect(screen.getByLabelText(/nombre/i)).toHaveValue('Huellas Felices')
  })

  it('muestra error al eliminar un refugio con procesos activos', async () => {
    service.deleteShelter.mockRejectedValueOnce(
      new Error('No se puede eliminar el refugio: tiene mascotas o procesos activos asociados'),
    )
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderManager()
    await waitFor(() => screen.getByText('Huellas Felices'))

    const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i })
    await user.click(deleteButtons[0])

    expect(await screen.findByRole('alert')).toHaveTextContent(/no se puede eliminar/i)
  })

  it('filtra refugios por búsqueda', async () => {
    const user = userEvent.setup()
    renderManager()
    await waitFor(() => screen.getByText('Huellas Felices'))

    await user.type(screen.getByLabelText(/buscar refugios/i), 'Patitas')
    expect(screen.getByText('Patitas del Norte')).toBeInTheDocument()
    expect(screen.queryByText('Huellas Felices')).not.toBeInTheDocument()
  })
})
