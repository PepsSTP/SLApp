/**
 * Destination grouping configuration for the Stockholm Transport Dashboard
 *
 * Defines how departures should be grouped by destination areas,
 * mapping specific line + destination combinations to user-friendly destination groups.
 */

export interface RouteMatch {
  line: string;
  destination: string; // The final destination of the line (e.g., "Fruängen", "Skärholmen")
  originStop?: string; // Optional: specify which stop this route should come from (for To Home view)
}

export interface DestinationGroup {
  displayName: string; // User-friendly name (e.g., "To Älvsjö")
  routes: RouteMatch[]; // List of line + destination combinations that belong to this group
}

/**
 * FROM HOME VIEW DESTINATIONS
 * Groups departures from home stops by where they're going
 */
export const FROM_HOME_DESTINATIONS: DestinationGroup[] = [
  {
    displayName: "To Älvsjö Station",
    routes: [
      { line: "144", destination: "Fruängen" },
      { line: "144", destination: "Älvsjö station" }, // short-turn trips that terminate at Älvsjö
      { line: "173", destination: "Skärholmen" },
      { line: "161", destination: "Gröndal" },
      { line: "163", destination: "Bredäng" } // passes through Älvsjö station en route
    ]
  },
  {
    displayName: "To Enskede",
    routes: [
      { line: "163", destination: "Kärrtorp" },
      { line: "161", destination: "Bagarmossen" }
    ]
  },
  {
    displayName: "To Gullmarsplan",
    routes: [
      { line: "144", destination: "Gullmarsplan" },
      { line: "Metro 19", destination: "Hässelby strand" }, // full service westbound
      { line: "Metro 19", destination: "Vällingby" },       // short-turn westbound, still passes Gullmarsplan
      { line: "Metro 19", destination: "Alvik" }            // short-turn westbound, still passes Gullmarsplan
    ]
  }
];

/**
 * TO HOME VIEW DESTINATIONS
 * Groups departures from destination stops back home
 * originStop is specified to prevent mixing departures from different return locations
 */
export const TO_HOME_DESTINATIONS: DestinationGroup[] = [
  {
    displayName: "From Gullmarsplan",
    routes: [
      { line: "144", destination: "Fruängen", originStop: "Gullmarsplan" },
      { line: "144", destination: "Älvsjö station", originStop: "Gullmarsplan" },
      { line: "Metro 19", destination: "Hagsätra", originStop: "Gullmarsplan" }
    ]
  },
  {
    displayName: "From Älvsjö Station",
    routes: [
      { line: "144", destination: "Gullmarsplan", originStop: "Älvsjö" },
      { line: "173", destination: "Skarpnäck", originStop: "Älvsjö" },
      { line: "163", destination: "Kärrtorp", originStop: "Älvsjö" },
      { line: "161", destination: "Bagarmossen", originStop: "Älvsjö" },
      { line: "161", destination: "Gröndal", originStop: "Älvsjö" }
    ]
  },
  {
    displayName: "From Enskede",
    routes: [
      { line: "163", destination: "Kärrtorp", originStop: "Sockenplan" },
      { line: "163", destination: "Bredäng", originStop: "Sockenplan" },
      { line: "161", destination: "Gröndal", originStop: "Murklevägen" }
    ]
  }
];

/**
 * HOME STOPS
 * The stops near home that we depart from
 */
export const HOME_STOPS = [
  'Helgestavägen (på Årdalavägen)',
  'Bandhagen',
  'Juliaborg'
];

/**
 * RETURN STOPS
 * Destination stops we want to get back home from
 */
export const RETURN_STOPS = [
  'Gullmarsplan',
  'Älvsjö station',
  'Sockenplan',
  'Murklevägen'
];

/**
 * STOP TRANSPORT FILTERS
 * Specify which transport modes to include for specific stops
 * If a stop is not listed, all transport modes are included
 */
export const STOP_TRANSPORT_FILTERS: { [stopName: string]: string[] } = {
  'Bandhagen': ['METRO'] // Only show Metro from Bandhagen, ignore buses
};
