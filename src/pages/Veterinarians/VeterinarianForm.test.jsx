import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VeterinarianForm from './VeterinarianForm'

async function fillForm() {
  await userEvent.type(screen.getByLabelText('Nombre *'), 'Dra. Ana Torres')
  await userEvent.type(screen.getByLabelText('Licencia *'), 'MV-30412')
  await userEvent.type(screen.getByLabelText('Teléfono *'), '312 555 0178')
}

describe('VeterinarianForm', () => {
  it('reports which fields are missing and does not submit', async () => {
    const onSubmit = vi.fn()
    render(<VeterinarianForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Registrar' }))

    expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument()
    expect(screen.getByText('La licencia es obligatoria.')).toBeInTheDocument()
    expect(screen.getByText('El teléfono es obligatorio.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the typed values', async () => {
    const onSubmit = vi.fn().mockResolvedValue()
    render(<VeterinarianForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Registrar' }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Dra. Ana Torres',
      license: 'MV-30412',
      phone: '312 555 0178',
    })
  })

  it('shows the data of the veterinarian when editing', () => {
    const veterinarian = { id: 1, name: 'Dra. Laura Gómez', license: 'MV-10231', phone: '310 555 0101' }
    render(<VeterinarianForm initialValues={veterinarian} onSubmit={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Editar veterinario' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre *')).toHaveValue('Dra. Laura Gómez')
    expect(screen.getByLabelText('Licencia *')).toHaveValue('MV-10231')
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument()
  })

  it('shows the error reported when sending fails', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Refugio no encontrado'))
    render(<VeterinarianForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Registrar' }))

    expect(await screen.findByText('Refugio no encontrado')).toBeInTheDocument()
  })

  it('calls onCancel when cancelling', async () => {
    const onCancel = vi.fn()
    render(<VeterinarianForm onSubmit={vi.fn()} onCancel={onCancel} />)

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})