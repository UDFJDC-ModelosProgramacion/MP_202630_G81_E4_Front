import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StarRating from './StarRating'

describe('StarRating', () => {
  it('calls onChange with the selected value', async () => {
    const onChange = vi.fn()
    render(<StarRating value={2} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: '5 de 5' }))
    expect(onChange).toHaveBeenCalledWith(5)
  })

  it('renders without buttons when read only', () => {
    render(<StarRating value={3} readOnly />)
    expect(screen.getByRole('img', { name: '3 de 5' })).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})