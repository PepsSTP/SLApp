"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const departureFormatter_1 = require("../utils/departureFormatter");
const lineGrouper_1 = require("../utils/lineGrouper");
/**
 * SL Transport API Service
 * Handles all interactions with the Stockholm public transport API
 */
class SLService {
    constructor() {
        this.baseUrl = 'https://transport.integration.sl.se/v1';
    }
    /**
     * Search for transport sites (stops) by name
     */
    async searchSites(stopName) {
        const searchUrl = `${this.baseUrl}/sites?name=${encodeURIComponent(stopName)}`;
        console.log(`Fetching sites from: ${searchUrl}`);
        const response = await fetch(searchUrl);
        if (!response.ok) {
            const body = await response.text().catch(() => '<unreadable>');
            console.error('SL transport sites API error', response.status, body);
            throw new Error(`SL API Error: Failed to search for stop (status ${response.status})`);
        }
        const sites = (await response.json());
        return sites;
    }
    /**
     * Find the best matching site from search results
     * Prioritizes exact matches and aliases
     */
    findBestMatch(sites, searchName) {
        if (!sites || sites.length === 0) {
            return null;
        }
        const searchLower = searchName.toLowerCase();
        // Try exact name match
        let match = sites.find(s => s.name.toLowerCase() === searchLower);
        if (match)
            return match;
        // Try alias match
        match = sites.find(s => s.alias && s.alias.some(a => a.toLowerCase() === searchLower));
        if (match)
            return match;
        // Fall back to first result
        return sites[0];
    }
    /**
     * Get departures for a specific site ID
     */
    async getDepartures(siteId) {
        const departuresUrl = `${this.baseUrl}/sites/${siteId}/departures`;
        console.log(`Fetching departures from: ${departuresUrl}`);
        const response = await fetch(departuresUrl);
        if (!response.ok) {
            const body = await response.text().catch(() => '<unreadable>');
            console.error('SL departures API error', response.status, body);
            throw new Error(`SL API Error: Failed to fetch departures (status ${response.status})`);
        }
        const data = await response.json();
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
    async getBusStopData(stopName, maxResults = 5) {
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
        let formattedDepartures = [];
        if (Array.isArray(departuresData.departures)) {
            formattedDepartures = (0, departureFormatter_1.formatDepartures)(departuresData.departures);
            formattedDepartures = (0, departureFormatter_1.sortDeparturesByTime)(formattedDepartures);
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
    async getBusStopDataGrouped(stopName, maxPerLine = 3) {
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
        let formattedDepartures = [];
        if (Array.isArray(departuresData.departures)) {
            formattedDepartures = (0, departureFormatter_1.formatDepartures)(departuresData.departures);
        }
        // Group departures by line
        const groupedDepartures = (0, lineGrouper_1.groupDeparturesByLine)(formattedDepartures, maxPerLine);
        console.log(`Returning ${groupedDepartures.length} line groups for ${site.name}`);
        return {
            stopName: site.name,
            groupedDepartures
        };
    }
}
// Export singleton instance
exports.default = new SLService();
//# sourceMappingURL=slService.js.map