import { SLDeparture, FormattedDeparture, TransportMode } from '../types/sl.types';

/**
 * Formats a line label based on transport mode
 */
function formatLineLabel(designation: string, mode: string): string {
  const modeUpper = mode.toUpperCase();

  switch (modeUpper) {
    case TransportMode.METRO:
      return `Metro ${designation}`;
    case TransportMode.TRAIN:
      return `Train ${designation}`;
    case TransportMode.TRAM:
      return `Tram ${designation}`;
    case TransportMode.BUS:
    default:
      return designation;
  }
}

/**
 * Extracts line information from SL departure data
 */
function extractLineInfo(departure: SLDeparture): { designation: string; mode: string } {
  if (typeof departure.line === 'object' && departure.line !== null) {
    const designation = departure.line.designation || departure.line.name || '';
    const mode = departure.line.transport_mode || '';
    return { designation, mode };
  }

  // Fallback if line is a string or missing
  const designation = typeof departure.line === 'string' ? departure.line : '';
  return { designation, mode: '' };
}

/**
 * Extracts destination from SL departure data
 */
function extractDestination(departure: SLDeparture): string {
  return departure.destination || departure.direction || '';
}

/**
 * Extracts departure time from SL departure data
 */
function extractDepartureTime(departure: SLDeparture): string {
  return departure.expected || departure.scheduled || departure.display || '';
}

/**
 * Formats a single SL departure into a standardized format
 */
export function formatDeparture(departure: SLDeparture): FormattedDeparture {
  const { designation, mode } = extractLineInfo(departure);
  const lineLabel = formatLineLabel(designation, mode);
  const destination = extractDestination(departure);
  const departureTime = extractDepartureTime(departure);

  return {
    line: lineLabel,
    destination,
    departureTime
  };
}

/**
 * Formats an array of SL departures
 */
export function formatDepartures(departures: SLDeparture[]): FormattedDeparture[] {
  return departures.map(formatDeparture);
}

/**
 * Sorts departures by departure time
 */
export function sortDeparturesByTime(departures: FormattedDeparture[]): FormattedDeparture[] {
  return [...departures].sort((a, b) => {
    const timeA = new Date(a.departureTime).getTime();
    const timeB = new Date(b.departureTime).getTime();
    return timeA - timeB;
  });
}
