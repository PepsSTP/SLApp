import { BusStopData } from '../types/bus.types';
import { BusCard } from './BusCard';

interface BusResultsProps {
  data: BusStopData;
}

/**
 * Bus Results Component
 * Displays a list of bus departures for a stop
 */
export function BusResults({ data }: BusResultsProps) {
  return (
    <div className="bus-results">
      <h3>{data.stopName}</h3>
      {data.buses.length > 0 ? (
        <div className="buses-list">
          {data.buses.map((bus, index) => (
            <BusCard key={index} bus={bus} />
          ))}
        </div>
      ) : (
        <p className="no-buses">No buses found for this stop</p>
      )}
    </div>
  );
}
