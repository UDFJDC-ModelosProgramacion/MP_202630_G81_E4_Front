import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import FollowUpDetail from '../components/FollowUp/FollowUpDetail'
import * as service from '../services/followUpService'

vi.mock('../services/followUpService')

const mockDetail = {
  id: 'FU-001',
  date: '2026-09-05',
  petName: 'Toby',
  adoptionId: 'AD-101',
  adopterName: 'Carlos Ruiz',
  vetName: 'Dr. Juan Parrado',
  status: 'Realizado',
  notes: 'Seguimiento inicial aprobado sin alertas',
}

function renderDetail(id = 'FU-001') {
  return render(
    <MemoryRouter initialEntries={[`/follow-ups/${id}`]}>
      <Routes>
        <Route path="/follow-ups/:id" element={<FollowUpDetail />} />
        <Route path="/follow-ups" element={<div>Lista</div>} />
        <Route path="/follow-ups/:id/edit" element={<div>Editar</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('HU08 - FollowUpDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    service.getFollowUpById.mockResolvedValue(mockDetail)
  })

  it('carga y muestra el detalle del seguimiento por ID', async () => {
    renderDetail('FU-001')
    await waitFor(() => {
      expect(service.getFollowUpById).toHaveBeenCalledWith('FU-001')
    })
    expect(await screen.findByText(/detalle del seguimiento FU-001/i)).toBeInTheDocument()
    expect(screen.getByText('Toby')).toBeInTheDocument()
    expect(screen.getByText('AD-101')).toBeInTheDocument()
    expect(screen.getByText('Dr. Juan Parrado')).toBeInTheDocument()
    expect(screen.getByText('Realizado')).toBeInTheDocument()
    expect(screen.getByText(/Seguimiento inicial aprobado sin alertas/i)).toBeInTheDocument()
  })

  it('muestra mensaje de error cuando el seguimiento no existe', async () => {
    service.getFollowUpById.mockRejectedValueOnce(
      new Error('Seguimiento FU-999 no fue encontrado'),
    )
    renderDetail('FU-999')
    expect(await screen.findByRole('alert')).toHaveTextContent(/no fue encontrado/i)
    expect(screen.getByRole('button', { name: /volver a la lista/i })).toBeInTheDocument()
  })

  it('muestra "Sin notas registradas" cuando no hay notas', async () => {
    service.getFollowUpById.mockResolvedValueOnce({ ...mockDetail, notes: '' })
    renderDetail('FU-001')
    expect(await screen.findByText(/sin notas registradas/i)).toBeInTheDocument()
  })

  it('incluye botón para editar el seguimiento', async () => {
    renderDetail('FU-001')
    expect(
      await screen.findByRole('button', { name: /editar seguimiento/i }),
    ).toBeInTheDocument()
  })
})
