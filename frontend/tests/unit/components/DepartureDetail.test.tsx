import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DepartureDetail } from '../../../src/components/DepartureDetail';
import { MergedDeparture } from '../../../src/utils/destinationGrouper';

describe('DepartureDetail', () => {
  const baseDeparture: MergedDeparture = {
    line: '144',
    destination: 'Gullmarsplan',
    departureTime: '2099-06-15T10:35:00',
    scheduled: '2099-06-15T10:30:00',
    originStop: 'Helgestavägen (på Årdalavägen)',
    transportMode: 'BUS',
  };

  it('should render line number and transport mode', () => {
    render(<DepartureDetail departure={baseDeparture} onClose={vi.fn()} />);

    expect(screen.getByText('144')).toBeInTheDocument();
    expect(screen.getByText('Bus')).toBeInTheDocument();
  });

  it('should render departure station (origin stop)', () => {
    render(<DepartureDetail departure={baseDeparture} onClose={vi.fn()} />);

    expect(screen.getByText('Helgestavägen (på Årdalavägen)')).toBeInTheDocument();
  });

  it('should render destination', () => {
    render(<DepartureDetail departure={baseDeparture} onClose={vi.fn()} />);

    expect(screen.getByText('Gullmarsplan')).toBeInTheDocument();
  });

  it('should show both scheduled and expected times when they differ', () => {
    render(<DepartureDetail departure={baseDeparture} onClose={vi.fn()} />);

    expect(screen.getByText('Scheduled')).toBeInTheDocument();
    expect(screen.getByText('Expected')).toBeInTheDocument();
    // Both absolute times should be present
    expect(screen.getByText('10:30')).toBeInTheDocument();
    expect(screen.getByText('10:35')).toBeInTheDocument();
  });

  it('should show only one time row when scheduled equals expected', () => {
    const sameTimes: MergedDeparture = {
      ...baseDeparture,
      scheduled: '2099-06-15T10:30:00',
      departureTime: '2099-06-15T10:30:00',
    };

    render(<DepartureDetail departure={sameTimes} onClose={vi.fn()} />);

    expect(screen.getByText('Departure')).toBeInTheDocument();
    expect(screen.queryByText('Scheduled')).not.toBeInTheDocument();
    expect(screen.queryByText('Expected')).not.toBeInTheDocument();
  });

  it('should render metro transport mode label', () => {
    const metro: MergedDeparture = {
      ...baseDeparture,
      line: 'Metro 19',
      transportMode: 'METRO',
    };

    render(<DepartureDetail departure={metro} onClose={vi.fn()} />);

    expect(screen.getByText('19')).toBeInTheDocument();
    expect(screen.getByText('Metro')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<DepartureDetail departure={baseDeparture} onClose={onClose} />);

    fireEvent.click(screen.getByLabelText('Close'));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should call onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(<DepartureDetail departure={baseDeparture} onClose={onClose} />);

    // Click the backdrop (the dialog container itself)
    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should not call onClose when sheet content is clicked', () => {
    const onClose = vi.fn();
    render(<DepartureDetail departure={baseDeparture} onClose={onClose} />);

    // Click on the destination text (inside the sheet)
    fireEvent.click(screen.getByText('Gullmarsplan'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should call onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(<DepartureDetail departure={baseDeparture} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should have correct aria attributes', () => {
    render(<DepartureDetail departure={baseDeparture} onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Departure details');
  });

  it('should show relative countdown for expected time', () => {
    render(<DepartureDetail departure={baseDeparture} onClose={vi.fn()} />);

    // The departure is in 2099, so relative time should show many minutes
    // Just verify some relative time text is present (not "Departed")
    const relativeEl = document.querySelector('.detail-time-relative');
    expect(relativeEl).toBeInTheDocument();
    expect(relativeEl?.textContent).toMatch(/\d+ min/);
  });
});
