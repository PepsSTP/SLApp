/**
 * SL (Stockholms Lokaltrafik) API Type Definitions
 */
/**
 * Transport mode types
 */
export declare enum TransportMode {
    BUS = "BUS",
    METRO = "METRO",
    TRAIN = "TRAIN",
    TRAM = "TRAM",
    FERRY = "FERRY",
    SHIP = "SHIP"
}
/**
 * SL Transport API Site (stop) structure
 */
export interface SLSite {
    id: number;
    name: string;
    alias?: string[];
    type?: string;
}
/**
 * SL Transport API Line information
 */
export interface SLLine {
    designation?: string;
    name?: string;
    transport_mode?: string;
}
/**
 * SL Transport API Departure structure
 */
export interface SLDeparture {
    line?: SLLine | string;
    destination?: string;
    direction?: string;
    expected?: string;
    scheduled?: string;
    display?: string;
}
/**
 * SL Transport API Departures Response
 */
export interface SLDeparturesResponse {
    departures: SLDeparture[];
}
/**
 * Formatted bus departure for API response
 */
export interface FormattedDeparture {
    line: string;
    destination: string;
    departureTime: string;
}
/**
 * Bus stop data response
 */
export interface BusStopData {
    stopName: string;
    buses: FormattedDeparture[];
}
/**
 * Grouped departure by line and destination
 */
export interface GroupedDeparture {
    line: string;
    transportMode: string;
    destination: string;
    departures: FormattedDeparture[];
}
/**
 * Bus stop data with grouped departures
 */
export interface BusStopDataGrouped {
    stopName: string;
    groupedDepartures: GroupedDeparture[];
}
//# sourceMappingURL=sl.types.d.ts.map