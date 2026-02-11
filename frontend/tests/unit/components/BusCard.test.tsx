import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BusCard } from '../../../src/components/BusCard';
import { Bus } from '../../../src/types/bus.types';

describe('BusCard', () => {
  const mockBus: Bus = {
    line: '4',
    destination: 'Gullmarsplan',
    departureTime: '2024-01-15T10:30:00',
  };

  it('should render bus line', () => {
    render(<BusCard bus={mockBus} />);

    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('should render bus destination', () => {
    render(<BusCard bus={mockBus} />);

    expect(screen.getByText('Gullmarsplan')).toBeInTheDocument();
  });

  it('should render departure time', () => {
    render(<BusCard bus={mockBus} />);

    expect(screen.getByText('2024-01-15T10:30:00')).toBeInTheDocument();
  });

  it('should render metro line with prefix', () => {
    const metroBus: Bus = {
      line: 'Metro 1',
      destination: 'Fruängen',
      departureTime: '2024-01-15T10:25:00',
    };

    render(<BusCard bus={metroBus} />);

    expect(screen.getByText('Metro 1')).toBeInTheDocument();
  });

  it('should have correct CSS classes', () => {
    const { container } = render(<BusCard bus={mockBus} />);

    expect(container.querySelector('.bus-card')).toBeInTheDocument();
    expect(container.querySelector('.bus-line')).toBeInTheDocument();
    expect(container.querySelector('.bus-info')).toBeInTheDocument();
    expect(container.querySelector('.bus-destination')).toBeInTheDocument();
    expect(container.querySelector('.bus-time')).toBeInTheDocument();
  });

  it('should render empty strings gracefully', () => {
    const emptyBus: Bus = {
      line: '',
      destination: '',
      departureTime: '',
    };

    const { container } = render(<BusCard bus={emptyBus} />);

    expect(container.querySelector('.bus-card')).toBeInTheDocument();
  });
});
