import { BusStopDataGrouped } from '../types/bus.types';
import { LineGroup } from './LineGroup';

interface StationCardProps {
  stopData: BusStopDataGrouped;
  error?: string;
}

/**
 * StationCard Component
 * Displays a single station with all its grouped lines and departures
 */
export function StationCard({ stopData, error }: StationCardProps) {
  const { stopName, groupedDepartures } = stopData;

  return (
    <div className="station-card">
      <div className="station-header">
        <h2>{stopName}</h2>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {!error && groupedDepartures.length === 0 && (
        <div className="no-departures">
          <p>No upcoming departures found</p>
        </div>
      )}

      {!error && groupedDepartures.length > 0 && (
        <div className="line-groups">
          {groupedDepartures.map((group, index) => (
            <LineGroup key={index} groupedDeparture={group} />
          ))}
        </div>
      )}
    </div>
  );
}
