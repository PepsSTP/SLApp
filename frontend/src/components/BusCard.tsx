import { Bus } from '../types/bus.types';

interface BusCardProps {
  bus: Bus;
}

/**
 * Bus Card Component
 * Displays information about a single bus departure
 */
export function BusCard({ bus }: BusCardProps) {
  return (
    <div className="bus-card">
      <div className="bus-line">{bus.line}</div>
      <div className="bus-info">
        <p className="bus-destination">{bus.destination}</p>
        <p className="bus-time">{bus.departureTime}</p>
      </div>
    </div>
  );
}
