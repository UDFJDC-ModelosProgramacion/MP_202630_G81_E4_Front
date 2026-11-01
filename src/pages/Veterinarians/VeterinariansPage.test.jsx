import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import VeterinariansPage from './VeterinariansPage'
import {
  createVeterinarian,
  deleteVeterinarian,
  getShelterSummary,
  listVeterinarians,
  updateVeterinarian,
} from '../../services/veterinarianService'

vi.mock('../../services/veterinarianService', () => ({
  getShelterSummary: vi.fn(),
  listVeterinarians: vi.fn(),
  createVeterinarian: vi.fn(),
  updateVeterinarian: vi.fn(),
  deleteVeterinarian: vi.fn(),
}))

const shelter = { id: 1, name: 'Huellitas del Norte' }
const veterinarians = [
  { id: 1, name: 'Dra. Laura Gómez', license: 'MV-10231', phone: '310 555 0101' },
  { id: 2, name: 'Dr. Carlos Ruiz', license: 'MV-20877', phone: '311 555 0144' },
]

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/shelters/1/veterinarians']}>
      <Routes>
        <Route path="/shelters/:shelterId/veterinarians" element={<VeterinariansPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

async function renderLoadedPage() {
  getShelterSummary.mockResolvedValue(shelter)
  listVeterinarians.mockResolvedValue(veterinarians)
  renderPage()
  await screen.findByText('Refugio: Huellitas del Norte')
}

describe('VeterinariansPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading and then the shelter with its veterinarians', async () => {
    getShelterSummary.mockResolvedValue(shelter)
    listVeterinarians.mockResolvedValue(veterinarians)
    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent('Cargando...')
    expect(await screen.findByText('Refugio: Huellitas del Norte')).toBeInTheDocument()
    expect(screen.getByText('Dra. Laura Gómez')).toBeInTheDocument()
    expect(screen.getByText('Dr. Carlos Ruiz')).toBeInTheDocument()
  })

  it('reports that the shelter was not found', async () => {
    getShelterSummary.mockRejectedValue(new Error('Refugio no encontrado'))
    listVeterinarians.mockResolvedValue([])
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('Refugio no encontrado')
  })

  it('registers a veterinarian and shows it in the list', async () => {
    await renderLoadedPage()
    createVeterinarian.mockResolvedValue({
      id: 3,
      name: 'Dra. Ana Torres',
      license: 'MV-30412',
      phone: '312 555 0178',
    })

    await userEvent.type(screen.getByLabelText('Nombre *'), 'Dra. Ana Torres')
    await userEvent.type(screen.getByLabelText('Licencia *'), 'MV-30412')
    await userEvent.type(screen.getByLabelText('Teléfono *'), '312 555 0178')
    await userEvent.click(screen.getByRole('button', { name: 'Registrar' }))

    expect(await screen.findByText('Veterinario registrado.')).toBeInTheDocument()
    expect(screen.getByText('Dra. Ana Torres')).toBeInTheDocument()
    expect(createVeterinarian).toHaveBeenCalledWith('1', {
      name: 'Dra. Ana Torres',
      license: 'MV-30412',
      phone: '312 555 0178',
    })
    expect(screen.getByLabelText('Nombre *')).toHaveValue('')
  })

  it('edits a veterinarian and shows the changes', async () => {
    await renderLoadedPage()
    updateVeterinarian.mockResolvedValue({ ...veterinarians[0], name: 'Dra. Laura G.' })

    await userEvent.click(screen.getByRole('button', { name: 'Editar a Dra. Laura Gómez' }))
    expect(screen.getByRole('heading', { name: 'Editar veterinario' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre *')).toHaveValue('Dra. Laura Gómez')

    await userEvent.clear(screen.getByLabelText('Nombre *'))
    await userEvent.type(screen.getByLabelText('Nombre *'), 'Dra. Laura G.')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText('Veterinario actualizado.')).toBeInTheDocument()
    expect(screen.getByText('Dra. Laura G.')).toBeInTheDocument()
    expect(updateVeterinarian).toHaveBeenCalledWith('1', 1, {
      name: 'Dra. Laura G.',
      license: 'MV-10231',
      phone: '310 555 0101',
    })
    expect(screen.getByRole('heading', { name: 'Registrar veterinario' })).toBeInTheDocument()
  })

  it('goes back to the register form when cancelling an edit', async () => {
    await renderLoadedPage()

    await userEvent.click(screen.getByRole('button', { name: 'Editar a Dr. Carlos Ruiz' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.getByRole('heading', { name: 'Registrar veterinario' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre *')).toHaveValue('')
  })

  it('asks for confirmation and then deletes the veterinarian', async () => {
    await renderLoadedPage()
    deleteVeterinarian.mockResolvedValue()

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar a Dr. Carlos Ruiz' }))
    expect(screen.getByText('¿Eliminar a Dr. Carlos Ruiz?')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar eliminación' }))

    expect(await screen.findByText('Veterinario eliminado.')).toBeInTheDocument()
    expect(screen.queryByText('Dr. Carlos Ruiz')).not.toBeInTheDocument()
    expect(deleteVeterinarian).toHaveBeenCalledWith('1', 2)
  })

  it('keeps the veterinarian when the deletion is not confirmed', async () => {
    await renderLoadedPage()

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar a Dr. Carlos Ruiz' }))
    await userEvent.click(screen.getByRole('button', { name: 'Conservar' }))

    expect(screen.queryByText('¿Eliminar a Dr. Carlos Ruiz?')).not.toBeInTheDocument()
    expect(screen.getByText('Dr. Carlos Ruiz')).toBeInTheDocument()
    expect(deleteVeterinarian).not.toHaveBeenCalled()
  })

  it('shows the error when the deletion fails', async () => {
    await renderLoadedPage()
    deleteVeterinarian.mockRejectedValue(new Error('Veterinario no encontrado'))

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar a Dr. Carlos Ruiz' }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar eliminación' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Veterinario no encontrado')
    expect(screen.getByText('Dr. Carlos Ruiz')).toBeInTheDocument()
  })

  it('goes back to the register form when deleting the veterinarian being edited', async () => {
    await renderLoadedPage()
    deleteVeterinarian.mockResolvedValue()

    await userEvent.click(screen.getByRole('button', { name: 'Editar a Dra. Laura Gómez' }))
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar a Dra. Laura Gómez' }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar eliminación' }))

    expect(await screen.findByText('Veterinario eliminado.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Registrar veterinario' })).toBeInTheDocument()
  })
})