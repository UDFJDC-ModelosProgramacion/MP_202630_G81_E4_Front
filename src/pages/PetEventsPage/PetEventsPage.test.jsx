import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PetEventsPage from './PetEventsPage';
import {
  getPetDetailsAndEvents,
  savePetEvent,
} from '../../services/petEventsService';

vi.mock('../../services/petEventsService', () => ({
  getPetDetailsAndEvents: vi.fn(),
  savePetEvent: vi.fn(),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <PetEventsPage />
    </MemoryRouter>,
  );

describe('HU11 - Registrar evento', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Muestra la bitácora de eventos existentes', async () => {
    getPetDetailsAndEvents.mockResolvedValue({
      pet: { healthStatus: 'Sano' },
      events: [{ type: 'Reporte Médico', date: '2026-01-10', description: 'Vacuna aplicada.' }],
    });
    renderPage();

    expect(await screen.findByText('Vacuna aplicada.')).toBeInTheDocument();
  });

  it('Valida que la fecha no sea futura en incidentes', async () => {
    getPetDetailsAndEvents.mockResolvedValue({
      pet: { healthStatus: 'Sano' },
      events: [],
    });
    renderPage();

    await waitFor(() => screen.getByText('Registrar evento'));

    fireEvent.change(screen.getByLabelText('Tipo *'), { target: { value: 'Reporte Médico' } });
    fireEvent.change(screen.getByLabelText('Fecha *'), { target: { value: '2099-12-31' } });
    fireEvent.change(screen.getByLabelText('Descripción *'), { target: { value: 'Prueba futura' } });
    fireEvent.click(screen.getByText('Registrar'));

    expect(
      await screen.findByText('La fecha no puede ser futura para reportes médicos o incidentes.'),
    ).toBeInTheDocument();
    expect(savePetEvent).not.toHaveBeenCalled();
  });

  it('No permite registrar a mascota fallecida', async () => {
    getPetDetailsAndEvents.mockResolvedValue({
      pet: { healthStatus: 'Fallecido' },
      events: [],
    });
    renderPage();

    await waitFor(() => screen.getByText('Registrar evento'));
    fireEvent.click(screen.getByText('Registrar'));

    expect(
      await screen.findByText("No se pueden asociar eventos a una mascota con estado 'Fallecido'."),
    ).toBeInTheDocument();
    expect(savePetEvent).not.toHaveBeenCalled();
  });

  it('Registra un evento válido llamando al servicio', async () => {
    getPetDetailsAndEvents.mockResolvedValue({
      pet: { healthStatus: 'Sano' },
      events: [],
    });
    savePetEvent.mockResolvedValue({ id: 1 });
    renderPage();

    await waitFor(() => screen.getByText('Registrar evento'));

    fireEvent.change(screen.getByLabelText('Tipo *'), { target: { value: 'Otro' } });
    fireEvent.change(screen.getByLabelText('Fecha *'), { target: { value: '2026-01-10' } });
    fireEvent.change(screen.getByLabelText('Descripción *'), { target: { value: 'Paseo' } });
    fireEvent.click(screen.getByText('Registrar'));

    await waitFor(() => expect(savePetEvent).toHaveBeenCalled());
    expect(await screen.findByText('Paseo')).toBeInTheDocument();
  });
});
