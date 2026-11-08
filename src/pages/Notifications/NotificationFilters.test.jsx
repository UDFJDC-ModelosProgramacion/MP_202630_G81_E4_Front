import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotificationFilters from './NotificationFilters'

describe('NotificationFilters', () => {
  it('shows the four filters and marks the selected one', () => {
    render(<NotificationFilters value="unread" onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Todas' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'No leídas' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Por adopción' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Por mascota' })).toBeInTheDocument()
  })

  it('calls onChange with the value of the clicked filter', async () => {
    const onChange = vi.fn()
    render(<NotificationFilters value="all" onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'Por mascota' }))

    expect(onChange).toHaveBeenCalledWith('pet')
  })
})