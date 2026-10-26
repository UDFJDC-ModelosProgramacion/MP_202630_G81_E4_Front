import { beforeEach, describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { resetMessages } from '../../services/messageService'
import MessagesPage from './MessagesPage'

async function openSentTab() {
  await userEvent.click(await screen.findByRole('button', { name: 'Enviados' }))
}

describe('MessagesPage (HU17)', () => {
  beforeEach(() => resetMessages())

  it('shows the received messages first', async () => {
    render(<MessagesPage />)
    expect(await screen.findByRole('button', { name: /De: Carlos Ruiz/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /De: Ana Torres/ })).toBeInTheDocument()
    expect(screen.getByText('Selecciona un mensaje de la lista para leerlo.')).toBeInTheDocument()
  })

  it('marks a received message as read when it is opened', async () => {
    render(<MessagesPage />)
    await userEvent.click(await screen.findByRole('button', { name: /De: Carlos Ruiz.*No leído/ }))
    expect(screen.getByText(/foto del patio/, { selector: 'p' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /De: Carlos Ruiz.*Leído/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeEnabled()
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
  })

  it('shows the sent messages', async () => {
    render(<MessagesPage />)
    await openSentTab()
    expect(screen.getAllByRole('button', { name: /Para: Carlos Ruiz/ })).toHaveLength(2)
    expect(screen.getByRole('button', { name: /Para: Ana Torres/ })).toBeInTheDocument()
  })

  it('does not allow deleting a sent message that has not been read', async () => {
    render(<MessagesPage />)
    await openSentTab()
    await userEvent.click(screen.getByRole('button', { name: /Para: Carlos Ruiz.*No leído/ }))
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Editar' })).toBeEnabled()
    expect(
      screen.getByText('Solo se puede eliminar un mensaje después de que haya sido leído.'),
    ).toBeInTheDocument()
  })

  it('edits a message that has not been read', async () => {
    render(<MessagesPage />)
    await openSentTab()
    await userEvent.click(screen.getByRole('button', { name: /Para: Carlos Ruiz.*No leído/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))
    const textarea = screen.getByLabelText('Editar contenido del mensaje')
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'Texto corregido')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Mensaje actualizado.')
    expect(screen.getByText('Texto corregido', { selector: 'p' })).toBeInTheDocument()
  })

  it('does not save an edited message without content', async () => {
    render(<MessagesPage />)
    await openSentTab()
    await userEvent.click(screen.getByRole('button', { name: /Para: Carlos Ruiz.*No leído/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))
    await userEvent.clear(screen.getByLabelText('Editar contenido del mensaje'))
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El contenido del mensaje es obligatorio.',
    )
  })

  it('cancels the edition', async () => {
    render(<MessagesPage />)
    await openSentTab()
    await userEvent.click(screen.getByRole('button', { name: /Para: Carlos Ruiz.*No leído/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByLabelText('Editar contenido del mensaje')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
  })

  it('does not allow editing a message that was read, but allows deleting it', async () => {
    render(<MessagesPage />)
    await openSentTab()
    await userEvent.click(screen.getByRole('button', { name: /Para: Ana Torres/ }))
    expect(screen.getByRole('button', { name: 'Editar' })).toBeDisabled()
    expect(screen.getByText('Un mensaje leído ya no se puede editar.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Mensaje eliminado.')
    expect(screen.queryByRole('button', { name: /Para: Ana Torres/ })).not.toBeInTheDocument()
  })

  it('shows an empty state when the tray has no messages', async () => {
    render(<MessagesPage />)
    for (const name of [/De: Carlos Ruiz/, /De: Ana Torres/]) {
      await userEvent.click(await screen.findByRole('button', { name }))
      await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    }
    expect(await screen.findByText('No hay mensajes en esta bandeja.')).toBeInTheDocument()
  })

  it('sends a new message and shows it in the sent tray', async () => {
    render(<MessagesPage />)
    await userEvent.selectOptions(await screen.findByLabelText(/Para/), '8')
    await userEvent.type(screen.getByLabelText(/Contenido/), 'Hola Ana, ¿sigue la visita del sábado?')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Mensaje enviado.')
    expect(screen.getByLabelText(/Contenido/)).toHaveValue('')
    expect(screen.getByRole('button', { name: /Para: Ana Torres.*sigue la visita/ })).toBeInTheDocument()
  })

  it('does not send a message without content', async () => {
    render(<MessagesPage />)
    await userEvent.selectOptions(await screen.findByLabelText(/Para/), '8')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El contenido del mensaje es obligatorio.',
    )
  })

  it('does not send a message without receiver', async () => {
    render(<MessagesPage />)
    await userEvent.type(await screen.findByLabelText(/Contenido/), 'Hola')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('El mensaje debe tener un destinatario.')
  })

  it('does not offer the current user as receiver', async () => {
    render(<MessagesPage />)
    await screen.findByLabelText(/Para/)
    expect(screen.queryByRole('option', { name: 'María Gómez' })).not.toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Ana Torres (Refugio Esperanza)' })).toBeInTheDocument()
  })
})
