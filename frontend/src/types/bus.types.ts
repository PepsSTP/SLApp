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
}

/**
 * Bus stop data with departures
 */
export interface BusStopData {
  stopName: string;
  buses: Bus[];
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
