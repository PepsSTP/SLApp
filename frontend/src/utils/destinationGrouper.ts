import { BusStopDataGrouped } from '../types/bus.types';
import { DestinationGroup, STOP_TRANSPORT_FILTERS } from '../config/destinations';

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
 * Groups departures from multiple stops by destination areas
 *
 * @param stops - Array of stop data with grouped departures
 * @param destinationGroups - Configuration of destination groupings
 * @param maxDeparturesPerGroup - Maximum number of departures to show per destination (default: 5)
 * @returns Array of destination groups with merged, sorted departures
 */
export function groupByDestination(
  stops: BusStopDataGrouped[],
  destinationGroups: DestinationGroup[],
  maxDeparturesPerGroup: number = 15
): DestinationGroupResult[] {
  const results: DestinationGroupResult[] = [];

  // Process each destination group
  for (const destinationGroup of destinationGroups) {
    const mergedDepartures: MergedDeparture[] = [];

    // For each stop, find matching departures
    for (const stop of stops) {
      // Apply transport mode filter if configured for this stop
      const allowedModes = STOP_TRANSPORT_FILTERS[stop.stopName];
      const filteredDepartures = allowedModes
        ? stop.groupedDepartures.filter(dep => allowedModes.includes(dep.transportMode))
        : stop.groupedDepartures;

      for (const groupedDeparture of filteredDepartures) {
        // Check if this line + destination + origin matches any route in this destination group
        const matchingRoute = destinationGroup.routes.find(
          route =>
            route.line === groupedDeparture.line &&
            route.destination === groupedDeparture.destination &&
            (!route.originStop || route.originStop === stop.stopName)
        );

        if (matchingRoute) {
          // Add all departures from this line to the merged list
          for (const departure of groupedDeparture.departures) {
            mergedDepartures.push({
              line: groupedDeparture.line,
              destination: groupedDeparture.destination,
              departureTime: departure.departureTime,
              scheduled: departure.scheduled ?? departure.departureTime,
              originStop: stop.stopName,
              transportMode: groupedDeparture.transportMode
            });
          }
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
      departures: limitedDepartures
    });
  }

  return results;
}
