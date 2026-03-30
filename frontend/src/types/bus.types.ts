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
 * Journey Planner types
 */

/**
 * A single departure from the Journey Planner API (/api/journeys)
 */
export interface JourneyDeparture {
  line: string;
  destination: string;   // line terminus (what the vehicle sign says)
  departureTime: string; // ISO 8601 UTC — real-time if available, else scheduled
  scheduled: string;     // ISO 8601 UTC — scheduled timetable time
  transportMode: string; // "BUS" | "METRO" | "TRAM" | "TRAIN"
}

/**
 * Response from GET /api/journeys
 */
export interface JourneyResponse {
  origin: string;
  destination: string;
  departures: JourneyDeparture[];
}
