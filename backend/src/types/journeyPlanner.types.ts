/**
 * SL Journey Planner API Type Definitions
 */

/**
 * Journey Planner API response — top level
 */
export interface JourneyPlannerResponse {
  journeys: Journey[];
}

/**
 * A single journey returned by the Journey Planner API
 */
export interface Journey {
  legs: Leg[];
}

/**
 * A single leg within a journey
 */
export interface Leg {
  transportation: {
    number: string;         // full name, e.g. "Buss 163", "tunnelbanans gröna linje 19"
    disassembledName: string; // short identifier, e.g. "163", "19"
    product: {
      name: string; // e.g. "Tunnelbana", "Buss"
    };
    destination: {
      name: string; // line terminus
    };
  };
  origin: {
    departureTimePlanned: string; // ISO 8601 UTC
    departureTimeEstimated?: string; // ISO 8601 UTC, real-time
  };
}

/**
 * Response shape for GET /api/journeys
 */
export interface JourneyResponse {
  origin: string;
  destination: string;
  departures: JourneyDeparture[];
}

/**
 * A single departure in the journey response
 */
export interface JourneyDeparture {
  line: string;
  destination: string;   // line terminus (what the vehicle sign says)
  departureTime: string; // ISO 8601 UTC — real-time if available, else scheduled
  scheduled: string;     // ISO 8601 UTC — scheduled timetable time
  transportMode: string; // "BUS" | "METRO" | "TRAM" | "TRAIN"
}
