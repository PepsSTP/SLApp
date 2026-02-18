import { SLSite, SLDeparturesResponse, BusStopData, FormattedDeparture, BusStopDataGrouped } from '../types/sl.types';
import { formatDepartures, sortDeparturesByTime } from '../utils/departureFormatter';
import { groupDeparturesByLine } from '../utils/lineGrouper';

/**
 * SL Transport API Service
 * Handles all interactions with the Stockholm public transport API
 */
class SLService {
  private readonly baseUrl = 'https://transport.integration.sl.se/v1';

  /**
   * Search for transport sites (stops) by name
   */
  async searchSites(stopName: string): Promise<SLSite[]> {
    const searchUrl = `${this.baseUrl}/sites?name=${encodeURIComponent(stopName)}`;
    console.log(`Fetching sites from: ${searchUrl}`);

    const response = await fetch(searchUrl);

    if (!response.ok) {
      const body = await response.text().catch(() => '<unreadable>');
      console.error('SL transport sites API error', response.status, body);
      throw new Error(`SL API Error: Failed to search for stop (status ${response.status})`);
    }

    const sites = (await response.json()) as SLSite[];
    return sites;
  }

  /**
   * Find the best matching site from search results
   * Prioritizes exact matches and aliases
   */
  findBestMatch(sites: SLSite[], searchName: string): SLSite | null {
    if (!sites || sites.length === 0) {
      return null;
    }

    const searchLower = searchName.toLowerCase();

    // Try exact name match
    let match = sites.find(s => s.name.toLowerCase() === searchLower);
    if (match) return match;

    // Try alias match
    match = sites.find(s =>
      s.alias && s.alias.some(a => a.toLowerCase() === searchLower)
    );
    if (match) return match;

    // Fall back to first result
    return sites[0];
  }

  /**
   * Get departures for a specific site ID
   */
  async getDepartures(siteId: number): Promise<SLDeparturesResponse> {
    const departuresUrl = `${this.baseUrl}/sites/${siteId}/departures?timewindow=60`;
    console.log(`Fetching departures from: ${departuresUrl}`);

    const response = await fetch(departuresUrl);

    if (!response.ok) {
      const body = await response.text().catch(() => '<unreadable>');
      console.error('SL departures API error', response.status, body);
      throw new Error(`SL API Error: Failed to fetch departures (status ${response.status})`);
    }

    const data = await response.json() as SLDeparturesResponse;
    console.log('Departures API response received', {
      keys: Object.keys(data || {}),
      departureCount: Array.isArray(data.departures) ? data.departures.length : 0
    });

    return data;
  }

  /**
   * Get bus stop data with departures
   * High-level method that orchestrates the full search and fetch flow
   */
  async getBusStopData(stopName: string, maxResults: number = 5): Promise<BusStopData> {
    console.log(`Searching for bus stop: "${stopName}"`);

    // Search for the stop
    const sites = await this.searchSites(stopName);

    if (!sites || sites.length === 0) {
      console.warn('SL transport returned no matches', { stopName });
      throw new Error(`Bus stop "${stopName}" not found`);
    }

    // Find best matching site
    const site = this.findBestMatch(sites, stopName);

    if (!site) {
      throw new Error(`Bus stop "${stopName}" not found`);
    }

    console.log(`Using site: ${site.name} (ID: ${site.id})`);

    // Get departures
    const departuresData = await this.getDepartures(site.id);

    // Format and sort departures
    let formattedDepartures: FormattedDeparture[] = [];
    if (Array.isArray(departuresData.departures)) {
      formattedDepartures = formatDepartures(departuresData.departures);
      formattedDepartures = sortDeparturesByTime(formattedDepartures);
    }

    console.log(`Returning ${Math.min(formattedDepartures.length, maxResults)} departures for ${site.name}`);

    return {
      stopName: site.name,
      buses: formattedDepartures.slice(0, maxResults)
    };
  }

  /**
   * Get bus stop data with departures grouped by line
   * High-level method that groups departures by line and limits to maxPerLine per line
   */
  async getBusStopDataGrouped(stopName: string, maxPerLine: number = 10): Promise<BusStopDataGrouped> {
    console.log(`Searching for bus stop (grouped): "${stopName}"`);

    // Search for the stop
    const sites = await this.searchSites(stopName);

    if (!sites || sites.length === 0) {
      console.warn('SL transport returned no matches', { stopName });
      throw new Error(`Bus stop "${stopName}" not found`);
    }

    // Find best matching site
    const site = this.findBestMatch(sites, stopName);

    if (!site) {
      throw new Error(`Bus stop "${stopName}" not found`);
    }

    console.log(`Using site: ${site.name} (ID: ${site.id})`);

    // Get departures
    const departuresData = await this.getDepartures(site.id);

    // Format departures
    let formattedDepartures: FormattedDeparture[] = [];
    if (Array.isArray(departuresData.departures)) {
      formattedDepartures = formatDepartures(departuresData.departures);
    }

    // Group departures by line
    const groupedDepartures = groupDeparturesByLine(formattedDepartures, maxPerLine);

    console.log(`Returning ${groupedDepartures.length} line groups for ${site.name}`);

    return {
      stopName: site.name,
      groupedDepartures
    };
  }
}

// Export singleton instance
export default new SLService();
