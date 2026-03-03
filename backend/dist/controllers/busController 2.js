"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const slService_1 = __importDefault(require("../services/slService"));
/**
 * Bus Controller
 * Handles HTTP requests related to bus stop information
 */
class BusController {
    /**
     * Get buses for a specific stop
     * GET /api/buses/:stopName
     */
    async getBusesByStop(req, res) {
        const stopName = decodeURIComponent(req.params.stopName);
        try {
            // Check if API key is configured (even though not currently used)
            if (!process.env.SL_API_KEY) {
                res.status(500).json({
                    error: 'Configuration Error',
                    message: 'SL_API_KEY is not configured'
                });
                return;
            }
            // Get bus stop data from service
            const busStopData = await slService_1.default.getBusStopData(stopName);
            // Send response
            res.json(busStopData);
        }
        catch (error) {
            this.handleError(error, stopName, res);
        }
    }
    /**
     * Get buses for a specific stop with departures grouped by line
     * GET /api/buses/:stopName/grouped
     */
    async getBusesByStopGrouped(req, res) {
        const stopName = decodeURIComponent(req.params.stopName);
        try {
            // Check if API key is configured (even though not currently used)
            if (!process.env.SL_API_KEY) {
                res.status(500).json({
                    error: 'Configuration Error',
                    message: 'SL_API_KEY is not configured'
                });
                return;
            }
            // Get grouped bus stop data from service
            const busStopData = await slService_1.default.getBusStopDataGrouped(stopName);
            // Send response
            res.json(busStopData);
        }
        catch (error) {
            this.handleError(error, stopName, res);
        }
    }
    /**
     * Centralized error handling for bus controller
     */
    handleError(error, stopName, res) {
        console.error('Error fetching from SL API:', error);
        if (error instanceof Error) {
            const message = error.message;
            // Handle specific error cases
            if (message.includes('not found')) {
                res.status(404).json({
                    error: 'Not Found',
                    message: `Bus stop "${stopName}" not found.`
                });
                return;
            }
            if (message.includes('status 502') || message.includes('status 503')) {
                res.status(502).json({
                    error: 'SL API Error',
                    message: 'The SL API is currently unavailable. Please try again later.'
                });
                return;
            }
            // Generic error response
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to fetch bus information from SL API',
                details: process.env.NODE_ENV === 'development' ? message : undefined
            });
        }
        else {
            // Unknown error type
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'An unexpected error occurred'
            });
        }
    }
}
// Export singleton instance
exports.default = new BusController();
//# sourceMappingURL=busController.js.map