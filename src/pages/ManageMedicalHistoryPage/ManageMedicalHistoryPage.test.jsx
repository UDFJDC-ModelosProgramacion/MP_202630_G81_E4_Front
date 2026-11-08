import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ManageMedicalHistoryPage from './ManageMedicalHistoryPage';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('HU10 - Gestionar historial médico', () => {
  it('Valida que no se puede desesterilizar una mascota', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, json: async () => ({ history: { isSterilized: true } })
    }));
    render(<MemoryRouter><ManageMedicalHistoryPage /></MemoryRouter>);
    
    await waitFor(() => screen.getByDisplayValue('Sí'));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'No' } });
    fireEvent.click(screen.getByText('Guardar'));
    
    await waitFor(() => {
      expect(screen.getByText('Una mascota esterilizada no puede pasar a no esterilizada.')).toBeInTheDocument();
    });
  });

  it('Valida que el tratamiento es obligatorio si hay enfermedad', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    render(<MemoryRouter><ManageMedicalHistoryPage /></MemoryRouter>);
    
    fireEvent.change(screen.getByLabelText('Enfermedad'), { target: { value: 'Gripe' } });
    fireEvent.click(screen.getByText('Guardar'));
    
    await waitFor(() => {
      expect(screen.getByText('Falta el tratamiento: es obligatorio al agregar una enfermedad nueva.')).toBeInTheDocument();
    });
  });
});