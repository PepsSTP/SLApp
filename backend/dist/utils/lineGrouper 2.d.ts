import { FormattedDeparture } from '../types/sl.types';
/**
 * Grouped departure interface
 * Represents departures for a single line
 */
export interface GroupedDeparture {
    line: string;
    transportMode: string;
    destination: string;
    departures: FormattedDeparture[];
}
/**
 * Groups departures by line and destination, limiting to maxPerLine departures
 *
 * @param departures - Array of formatted departures
 * @param maxPerLine - Maximum number of departures to include per line (default: 3)
 * @returns Array of grouped departures, sorted by earliest departure time
 */
export declare function groupDeparturesByLine(departures: FormattedDeparture[], maxPerLine?: number): GroupedDeparture[];
//# sourceMappingURL=lineGrouper%202.d.ts.map