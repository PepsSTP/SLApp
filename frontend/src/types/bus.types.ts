/**
 * Bus and Transport Type Definitions
 */

/**
 * Individual bus/transport departure
 */
export interface Bus {
  line: string;
  destination: string;
  departureTime: string;
  scheduled: string;
}

/**
 * Bus stop data with departures
 */
export interface BusStopData {
  stopName: string;
  buses: Bus[];
}

/**
 * Grouped departure by line and destination
 */
export interface GroupedDeparture {
  line: string;
  transportMode: string;
  destination: string;
  departures: Bus[];
}

/**
 * Bus stop data with grouped departures
 */
export interface BusStopDataGrouped {
  stopName: string;
  groupedDepartures: GroupedDeparture[];
}

/**
 * API error response structure
 */
export interface ApiErrorResponse {
  error: string;
  message: string;
  details?: string;
}

/**
 * Bus search state
 */
export interface BusSearchState {
  data: BusStopData | null;
  loading: boolean;
  error: string | null;
}

/**
 * A single journey departure from the Journey Planner API
 */
export interface JourneyDeparture {
  line: string;
  transportMode: string;
  origin: string;
  destination: string;
  departureTime: string;  // ISO 8601
  arrivalTime: string;    // ISO 8601
  scheduled: string;      // ISO 8601 — scheduled (timetable) departure time
}

/**
 * Response from GET /api/journeys
 */
export interface JourneyResponse {
  origin: string;
  destination: string;
  journeys: JourneyDeparture[];
}
