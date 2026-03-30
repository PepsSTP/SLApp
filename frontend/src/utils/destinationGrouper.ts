import { JourneyDeparture } from '../types/bus.types';

/**
 * Represents a single merged departure with origin stop information
 */
export interface MergedDeparture {
  line: string;
  destination: string;
  departureTime: string; // ISO timestamp
  scheduled: string; // ISO timestamp — scheduled (timetable) time
  originStop: string; // Which stop this departure is from
  transportMode: string;
}

/**
 * Represents a destination group with merged departures from all stops
 */
export interface DestinationGroupResult {
  displayName: string;
  departures: MergedDeparture[];
}

/**
 * Merges journey departures from multiple origin→destination pairs
 * into a single sorted list for a destination group.
 *
 * @param displayName - The display name for this group
 * @param journeys - Array of journey departures from all requests for this group
 * @param maxDepartures - Maximum number of departures to include (default: 30)
 * @returns A destination group result with merged, sorted departures
 */
export function mergeJourneys(
  displayName: string,
  journeys: JourneyDeparture[],
  maxDepartures: number = 30
): DestinationGroupResult {
  const departures: MergedDeparture[] = journeys.map(j => ({
    line: j.line,
    destination: j.destination,
    departureTime: j.departureTime,
    scheduled: j.scheduled ?? j.departureTime,
    originStop: j.origin,
    transportMode: j.transportMode,
  }));

  // Sort by departure time (earliest first)
  departures.sort((a, b) => {
    const timeA = new Date(a.departureTime).getTime();
    const timeB = new Date(b.departureTime).getTime();
    return timeA - timeB;
  });

  return {
    displayName,
    departures: departures.slice(0, maxDepartures),
  };
}
