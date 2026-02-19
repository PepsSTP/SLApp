import { SLDeparture, FormattedDeparture } from '../types/sl.types';
/**
 * Formats a single SL departure into a standardized format
 */
export declare function formatDeparture(departure: SLDeparture): FormattedDeparture;
/**
 * Formats an array of SL departures
 */
export declare function formatDepartures(departures: SLDeparture[]): FormattedDeparture[];
/**
 * Sorts departures by departure time
 */
export declare function sortDeparturesByTime(departures: FormattedDeparture[]): FormattedDeparture[];
//# sourceMappingURL=departureFormatter.d.ts.map