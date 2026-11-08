import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PetEventsPage from './PetEventsPage';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('HU11 - Registrar evento', () => {
  it('Valida que la fecha no sea futura en incidentes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, json: async () => ({ pet: { healthStatus: 'Sano' }, events: [] })
    }));
    render(<MemoryRouter><PetEventsPage /></MemoryRouter>);
    
    await waitFor(() => screen.getByText('Registrar evento'));
    
    fireEvent.change(screen.getByLabelText('Tipo *'), { target: { value: 'Incidente' } });
    fireEvent.change(screen.getByLabelText('Fecha *'), { target: { value: '2099-12-31' } });
    fireEvent.change(screen.getByLabelText('Descripción *'), { target: { value: 'Prueba futura' } });
    fireEvent.click(screen.getByText('Registrar'));
    
    await waitFor(() => {
      expect(screen.getByText('La fecha no puede ser futura para reportes médicos o incidentes.')).toBeInTheDocument();
    });
  });

  it('No permite registrar a mascota fallecida', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, json: async () => ({ pet: { healthStatus: 'Fallecido' }, events: [] })
    }));
    render(<MemoryRouter><PetEventsPage /></MemoryRouter>);
    
    await waitFor(() => screen.getByText('Registrar evento'));
    fireEvent.click(screen.getByText('Registrar'));
    
    await waitFor(() => {
      expect(screen.getByText("No se pueden asociar eventos a una mascota con estado 'Fallecido'.")).toBeInTheDocument();
    });
  });
});