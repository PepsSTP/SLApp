import { SLSite, SLDeparturesResponse, BusStopData, BusStopDataGrouped } from '../types/sl.types';
/**
 * SL Transport API Service
 * Handles all interactions with the Stockholm public transport API
 */
declare class SLService {
    private readonly baseUrl;
    /**
     * Search for transport sites (stops) by name
     */
    searchSites(stopName: string): Promise<SLSite[]>;
    /**
     * Find the best matching site from search results
     * Prioritizes exact matches and aliases
     */
    findBestMatch(sites: SLSite[], searchName: string): SLSite | null;
    /**
     * Get departures for a specific site ID
     */
    getDepartures(siteId: number): Promise<SLDeparturesResponse>;
    /**
     * Get bus stop data with departures
     * High-level method that orchestrates the full search and fetch flow
     */
    getBusStopData(stopName: string, maxResults?: number): Promise<BusStopData>;
    /**
     * Get bus stop data with departures grouped by line
     * High-level method that groups departures by line and limits to maxPerLine per line
     */
    getBusStopDataGrouped(stopName: string, maxPerLine?: number): Promise<BusStopDataGrouped>;
}
declare const _default: SLService;
export default _default;
//# sourceMappingURL=slService.d.ts.map