import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import FollowUpList from '../components/FollowUp/FollowUpList'
import * as service from '../services/followUpService'

vi.mock('../services/followUpService')

const mockItems = [
  {
    id: 'FU-001',
    date: '2026-09-05',
    petName: 'Toby',
    adoptionId: 'AD-101',
    adopterName: 'Carlos Ruiz',
    vetName: 'Dr. Juan Parrado',
    status: 'Realizado',
    notes: 'Seguimiento inicial',
  },
  {
    id: 'FU-002',
    date: '2026-09-10',
    petName: 'Nube',
    adoptionId: 'AD-104',
    adopterName: 'Ana Torres',
    vetName: 'Dr. Juan Parrado',
    status: 'Programado',
    notes: 'Peso adecuado',
  },
]

function renderList() {
  return render(
    <MemoryRouter initialEntries={['/follow-ups']}>
      <Routes>
        <Route path="/follow-ups" element={<FollowUpList />} />
        <Route path="/follow-ups/new" element={<div>Nuevo</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('HU08 - FollowUpList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    service.getFollowUps.mockResolvedValue(mockItems)
  })

  it('muestra la lista de seguimientos cargada', async () => {
    renderList()
    expect(await screen.findByText('FU-001')).toBeInTheDocument()
    expect(screen.getByText('Toby')).toBeInTheDocument()
    expect(screen.getByText('Nube')).toBeInTheDocument()
    expect(screen.getByText('AD-101')).toBeInTheDocument()
  })

  it('muestra mensaje vacío cuando no hay resultados', async () => {
    service.getFollowUps.mockResolvedValueOnce([])
    renderList()
    expect(
      await screen.findByText(/no se encontraron seguimientos/i),
    ).toBeInTheDocument()
  })

  it('muestra error cuando falla la carga', async () => {
    service.getFollowUps.mockRejectedValueOnce(new Error('Error de red'))
    renderList()
    expect(await screen.findByText(/error de red/i)).toBeInTheDocument()
  })

  it('filtra por nombre de mascota al escribir', async () => {
    const user = userEvent.setup()
    renderList()
    await waitFor(() => screen.getByText('FU-001'))

    await user.type(screen.getByLabelText(/buscar por mascota/i), 'Toby')
    await waitFor(() => {
      expect(service.getFollowUps).toHaveBeenLastCalledWith(
        expect.objectContaining({ petName: 'T' }),
      )
    })
  })

  it('limpia los filtros al hacer clic en Limpiar filtros', async () => {
    const user = userEvent.setup()
    renderList()
    await waitFor(() => screen.getByText('FU-001'))

    await user.type(screen.getByLabelText(/filtrar por adopción/i), 'AD-101')
    await user.click(screen.getByRole('button', { name: /limpiar filtros/i }))

    expect(screen.getByLabelText(/filtrar por adopción/i)).toHaveValue('')
    expect(screen.getByLabelText(/buscar por mascota/i)).toHaveValue('')
  })

  it('incluye enlace para ver detalle de cada seguimiento', async () => {
    renderList()
    expect(await screen.findByText('FU-001')).toBeInTheDocument()
    const links = screen.getAllByText(/ver detalle/i)
    expect(links.length).toBe(2)
  })
})
