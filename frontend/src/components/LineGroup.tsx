import { GroupedDeparture } from '../types/bus.types';

interface LineGroupProps {
  groupedDeparture: GroupedDeparture;
}

/**
 * Helper function to format relative time from ISO timestamp
 * @param isoTime - ISO 8601 timestamp string
 * @returns Relative time string like "2 min", "Now", or absolute time if in past
 */
function formatRelativeTime(isoTime: string): string {
  try {
    const departureDate = new Date(isoTime);
    const now = new Date();
    const diffMs = departureDate.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 0) {
      return 'Departed';
    } else if (diffMinutes === 0) {
      return 'Now';
    } else if (diffMinutes === 1) {
      return '1 min';
    } else {
      return `${diffMinutes} min`;
    }
  } catch {
    return '';
  }
}

/**
 * Helper function to format absolute time from ISO timestamp
 * @param isoTime - ISO 8601 timestamp string
 * @returns Time string like "10:30"
 */
function formatAbsoluteTime(isoTime: string): string {
  try {
    const date = new Date(isoTime);
    return date.toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch {
    return '';
  }
}

/**
 * LineGroup Component
 * Displays a single line with its next 3 departures
 */
export function LineGroup({ groupedDeparture }: LineGroupProps) {
  const { line, destination, departures } = groupedDeparture;

  return (
    <div className="line-group">
      <div className="line-group-header">
        <span className="bus-line">{line}</span>
        <span className="bus-destination">{destination}</span>
      </div>
      <ul className="departure-list">
        {departures.map((departure, index) => {
          const relativeTime = formatRelativeTime(departure.departureTime);
          const absoluteTime = formatAbsoluteTime(departure.departureTime);

          return (
            <li key={index} className="departure-time">
              {relativeTime} ({absoluteTime})
            </li>
          );
        })}
      </ul>
    </div>
  );
}
