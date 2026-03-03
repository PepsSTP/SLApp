import { FormattedDeparture } from '../types/sl.types';
import { sortDeparturesByTime } from './departureFormatter';

/**
 * Grouped departure interface
 * Represents departures for a single line
 */
export interface GroupedDeparture {
  line: string;
  transportMode: string;
  destination: string;
  departures: FormattedDeparture[];
}

/**
 * Extracts transport mode from a formatted line label
 * Examples:
 * - "Metro 1" -> "METRO"
 * - "Train 20" -> "TRAIN"
 * - "4" -> "BUS" (default)
 */
function extractTransportMode(lineLabel: string): string {
  if (lineLabel.startsWith('Metro ')) return 'METRO';
  if (lineLabel.startsWith('Train ')) return 'TRAIN';
  if (lineLabel.startsWith('Tram ')) return 'TRAM';
  return 'BUS';
}

/**
 * Creates a unique key for grouping departures
 * Groups by line and destination to handle cases where same line
 * goes to different destinations
 */
function createGroupKey(departure: FormattedDeparture): string {
  return `${departure.line}|${departure.destination}`;
}

/**
 * Groups departures by line and destination, limiting to maxPerLine departures
 *
 * @param departures - Array of formatted departures
 * @param maxPerLine - Maximum number of departures to include per line (default: 3)
 * @returns Array of grouped departures, sorted by earliest departure time
 */
export function groupDeparturesByLine(
  departures: FormattedDeparture[],
  maxPerLine: number = 3
): GroupedDeparture[] {
  // Sort all departures by time first
  const sortedDepartures = sortDeparturesByTime(departures);

  // Group departures by line and destination
  const groups = new Map<string, FormattedDeparture[]>();

  for (const departure of sortedDepartures) {
    const key = createGroupKey(departure);

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    const group = groups.get(key)!;

    // Only add if we haven't reached the max per line
    if (group.length < maxPerLine) {
      group.push(departure);
    }
  }

  // Convert map to array of GroupedDeparture objects
  const groupedDepartures: GroupedDeparture[] = [];

  for (const [, groupDepartures] of groups.entries()) {
    if (groupDepartures.length > 0) {
      const firstDeparture = groupDepartures[0];
      groupedDepartures.push({
        line: firstDeparture.line,
        transportMode: extractTransportMode(firstDeparture.line),
        destination: firstDeparture.destination,
        departures: groupDepartures
      });
    }
  }

  // Sort groups by their earliest departure time
  return groupedDepartures.sort((a, b) => {
    const timeA = new Date(a.departures[0].departureTime).getTime();
    const timeB = new Date(b.departures[0].departureTime).getTime();
    return timeA - timeB;
  });
}
