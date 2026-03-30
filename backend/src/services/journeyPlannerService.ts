import { getStopId } from '../config/stopIds';
import {
  JourneyPlannerResponse,
  Journey,
  JourneyDeparture,
  JourneyResponse,
} from '../types/journeyPlanner.types';

/**
 * Map Journey Planner product names to transport mode constants.
 */
function toTransportMode(productName: string): string {
  const lower = productName.toLowerCase();
  if (lower.includes('tunnelbana')) return 'METRO';
  if (lower.includes('buss')) return 'BUS';
  if (lower.includes('spårvagn') || lower.includes('tram')) return 'TRAM';
  if (lower.includes('tåg') || lower.includes('pendeltåg') || lower.includes('train')) return 'TRAIN';
  return productName.toUpperCase();
}

/**
 * Journey Planner Service
 * Calls the SL Journey Planner API and returns filtered direct departures.
 */
class JourneyPlannerService {
  private readonly baseUrl = 'https://journeyplanner.integration.sl.se/v2';

  /**
   * Fetch journeys from the SL Journey Planner API.
   */
  async fetchJourneys(originId: string, destinationId: string): Promise<JourneyPlannerResponse> {
    const url = `${this.baseUrl}/trips?type_origin=any&name_origin=${originId}&type_destination=any&name_destination=${destinationId}&calc_number_of_trips=3`;
    console.log(`Fetching journeys from: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      const body = await response.text().catch(() => '<unreadable>');
      console.error('Journey Planner API error', response.status, body);
      throw new Error(`Journey Planner API Error: Failed to fetch journeys (status ${response.status})`);
    }

    const data = (await response.json()) as JourneyPlannerResponse;
    return data;
  }

  /**
   * Check if a journey is direct (single leg, no walking).
   */
  private isDirectJourney(journey: Journey): boolean {
    return journey.legs.length === 1;
  }

  /**
   * Get departures for a given origin, destination, and set of lines.
   */
  async getJourneys(origin: string, destination: string, lines: string[]): Promise<JourneyResponse> {
    const originId = getStopId(origin);
    if (!originId) {
      throw new Error(`Stop "${origin}" not found`);
    }

    const destinationId = getStopId(destination);
    if (!destinationId) {
      throw new Error(`Stop "${destination}" not found`);
    }

    const data = await this.fetchJourneys(originId, destinationId);

    const linesLower = lines.map(l => l.toLowerCase());

    const departures: JourneyDeparture[] = [];

    for (const journey of data.journeys || []) {
      // Only direct journeys — one leg, no interchanges
      if (!this.isDirectJourney(journey)) {
        continue;
      }

      const leg = journey.legs[0];
      const lineNumber = leg.transportation.number;

      // Filter by requested lines
      if (!linesLower.includes(lineNumber.toLowerCase())) {
        continue;
      }

      const transportMode = toTransportMode(leg.transportation.product.name);
      const scheduled = leg.origin.departureTimePlanned;
      const departureTime = leg.origin.departureTimeEstimated || scheduled;

      departures.push({
        line: lineNumber,
        destination: leg.transportation.destination.name,
        departureTime,
        scheduled,
        transportMode,
      });
    }

    return {
      origin,
      destination,
      departures,
    };
  }
}

// Export singleton instance
export default new JourneyPlannerService();
