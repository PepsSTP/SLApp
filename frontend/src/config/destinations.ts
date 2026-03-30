/**
 * Destination grouping configuration for the Stockholm Transport Dashboard
 *
 * Defines how departures should be grouped by destination areas,
 * mapping specific origin→destination pairs to user-friendly destination groups.
 */

export interface RouteMatch {
  line: string;
  originStop: string;       // The stop we depart from
  destinationStop: string;  // The stop we want to reach
}

export interface DestinationGroup {
  displayName: string; // User-friendly name (e.g., "To Älvsjö Station")
  routes: RouteMatch[]; // List of origin→destination pairs that belong to this group
}

/**
 * FROM HOME VIEW DESTINATIONS
 * Groups departures from home stops by where they're going
 */
export const FROM_HOME_DESTINATIONS: DestinationGroup[] = [
  {
    displayName: "To Älvsjö Station",
    routes: [
      { line: "161", originStop: "Helgestavägen (på Årdalavägen)", destinationStop: "Älvsjö station" },
      { line: "144", originStop: "Juliaborg", destinationStop: "Älvsjö station" },
      { line: "173", originStop: "Juliaborg", destinationStop: "Älvsjö station" },
      { line: "163", originStop: "Juliaborg", destinationStop: "Älvsjö station" },
      { line: "803", originStop: "Juliaborg", destinationStop: "Älvsjö station" },
    ]
  },
  {
    displayName: "To Enskede",
    routes: [
      { line: "161", originStop: "Helgestavägen (på Årdalavägen)", destinationStop: "Murklevägen" },
      { line: "163", originStop: "Juliaborg", destinationStop: "Sockenplan" },
      { line: "Metro 19", originStop: "Bandhagen", destinationStop: "Sockenplan" },
    ]
  },
  {
    displayName: "To Gullmarsplan",
    routes: [
      { line: "144", originStop: "Juliaborg", destinationStop: "Gullmarsplan" },
      { line: "Metro 19", originStop: "Bandhagen", destinationStop: "Gullmarsplan" },
    ]
  },
];

/**
 * TO HOME VIEW DESTINATIONS
 * Groups departures from destination stops back home
 */
export const TO_HOME_DESTINATIONS: DestinationGroup[] = [
  {
    displayName: "From Gullmarsplan",
    routes: [
      { line: "Metro 19", originStop: "Gullmarsplan", destinationStop: "Bandhagen" },
      { line: "144", originStop: "Gullmarsplan", destinationStop: "Juliaborg" },
    ]
  },
  {
    displayName: "From Älvsjö Station",
    routes: [
      { line: "161", originStop: "Älvsjö station", destinationStop: "Helgestavägen (på Årdalavägen)" },
      { line: "163", originStop: "Älvsjö station", destinationStop: "Juliaborg" },
      { line: "144", originStop: "Älvsjö station", destinationStop: "Juliaborg" },
      { line: "173", originStop: "Älvsjö station", destinationStop: "Juliaborg" },
      { line: "803", originStop: "Älvsjö station", destinationStop: "Juliaborg" },
    ]
  },
  {
    displayName: "From Enskede",
    routes: [
      { line: "163", originStop: "Sockenplan", destinationStop: "Juliaborg" },
      { line: "Metro 19", originStop: "Sockenplan", destinationStop: "Bandhagen" },
      { line: "161", originStop: "Murklevägen", destinationStop: "Helgestavägen (på Årdalavägen)" },
    ]
  },
];
