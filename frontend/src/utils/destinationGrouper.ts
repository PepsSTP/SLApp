import { JourneyResponse } from '../types/bus.types';
import { DestinationGroup } from '../config/destinations';

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
 * Key used to group routes by unique origin + destination pair
 */
export function pairKey(origin: string, destination: string): string {
  return `${origin}|||${destination}`;
}

/**
 * Groups journey responses into destination groups, merging and sorting by time.
 *
 * @param journeysByPair - Map of "origin|||destination" → JourneyResponse
 * @param destinationGroups - Configuration of destination groupings
 * @param maxDeparturesPerGroup - Maximum number of departures per group (default: 30)
 * @returns Array of destination groups with merged, sorted departures
 */
export function groupByDestination(
  journeysByPair: Map<string, JourneyResponse>,
  destinationGroups: DestinationGroup[],
  maxDeparturesPerGroup: number = 30
): DestinationGroupResult[] {
  const results: DestinationGroupResult[] = [];

  for (const destinationGroup of destinationGroups) {
    const mergedDepartures: MergedDeparture[] = [];

    // Collect allowed lines per origin+destination pair for this group
    const linesByPair = new Map<string, Set<string>>();
    for (const route of destinationGroup.routes) {
      const key = pairKey(route.originStop, route.destinationStop);
      if (!linesByPair.has(key)) {
        linesByPair.set(key, new Set());
      }
      linesByPair.get(key)!.add(route.line);
    }

    // For each origin+destination pair used by this group, extract matching journeys
    for (const [key, allowedLines] of linesByPair) {
      const response = journeysByPair.get(key);
      if (!response) continue;

      for (const departure of response.departures) {
        if (allowedLines.has(departure.line)) {
          mergedDepartures.push({
            line: departure.line,
            destination: departure.destination,
            departureTime: departure.departureTime,
            scheduled: departure.scheduled ?? departure.departureTime,
            originStop: response.origin,
            transportMode: departure.transportMode,
          });
        }
      }
    }

    // Sort merged departures by time (earliest first)
    mergedDepartures.sort((a, b) => {
      const timeA = new Date(a.departureTime).getTime();
      const timeB = new Date(b.departureTime).getTime();
      return timeA - timeB;
    });

    // Take only the first N departures
    const limitedDepartures = mergedDepartures.slice(0, maxDeparturesPerGroup);

    results.push({
      displayName: destinationGroup.displayName,
      departures: limitedDepartures,
    });
  }

  return results;
}
