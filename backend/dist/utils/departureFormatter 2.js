"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDeparture = formatDeparture;
exports.formatDepartures = formatDepartures;
exports.sortDeparturesByTime = sortDeparturesByTime;
const sl_types_1 = require("../types/sl.types");
/**
 * Formats a line label based on transport mode
 */
function formatLineLabel(designation, mode) {
    const modeUpper = mode.toUpperCase();
    switch (modeUpper) {
        case sl_types_1.TransportMode.METRO:
            return `Metro ${designation}`;
        case sl_types_1.TransportMode.TRAIN:
            return `Train ${designation}`;
        case sl_types_1.TransportMode.TRAM:
            return `Tram ${designation}`;
        case sl_types_1.TransportMode.BUS:
        default:
            return designation;
    }
}
/**
 * Extracts line information from SL departure data
 */
function extractLineInfo(departure) {
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
function extractDestination(departure) {
    return departure.destination || departure.direction || '';
}
/**
 * Extracts departure time from SL departure data
 */
function extractDepartureTime(departure) {
    return departure.expected || departure.scheduled || departure.display || '';
}
/**
 * Formats a single SL departure into a standardized format
 */
function formatDeparture(departure) {
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
function formatDepartures(departures) {
    return departures.map(formatDeparture);
}
/**
 * Sorts departures by departure time
 */
function sortDeparturesByTime(departures) {
    return [...departures].sort((a, b) => {
        const timeA = new Date(a.departureTime).getTime();
        const timeB = new Date(b.departureTime).getTime();
        return timeA - timeB;
    });
}
//# sourceMappingURL=departureFormatter.js.map