import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VeterinarianTable from './VeterinarianTable'

const veterinarians = [
  { id: 1, name: 'Dra. Laura Gómez', license: 'MV-10231', phone: '310 555 0101' },
  { id: 2, name: 'Dr. Carlos Ruiz', license: 'MV-20877', phone: '311 555 0144' },
]

describe('VeterinarianTable', () => {
  it('shows one row per veterinarian', () => {
    render(<VeterinarianTable veterinarians={veterinarians} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Dra. Laura Gómez')).toBeInTheDocument()
    expect(screen.getByText('MV-20877')).toBeInTheDocument()
    expect(screen.getByText('311 555 0144')).toBeInTheDocument()
  })

  it('calls onEdit with the selected veterinarian', async () => {
    const onEdit = vi.fn()
    render(<VeterinarianTable veterinarians={veterinarians} onEdit={onEdit} onDelete={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Editar a Dr. Carlos Ruiz' }))
    expect(onEdit).toHaveBeenCalledWith(veterinarians[1])
  })

  it('calls onDelete with the selected veterinarian', async () => {
    const onDelete = vi.fn()
    render(<VeterinarianTable veterinarians={veterinarians} onEdit={vi.fn()} onDelete={onDelete} />)
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar a Dra. Laura Gómez' }))
    expect(onDelete).toHaveBeenCalledWith(veterinarians[0])
  })

  it('shows an empty message when there are no veterinarians', () => {
    render(<VeterinarianTable veterinarians={[]} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(
      screen.getByText('Este refugio aún no tiene veterinarios registrados.'),
    ).toBeInTheDocument()
  })
})