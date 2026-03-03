import { Request, Response } from 'express';
/**
 * Bus Controller
 * Handles HTTP requests related to bus stop information
 */
declare class BusController {
    /**
     * Get buses for a specific stop
     * GET /api/buses/:stopName
     */
    getBusesByStop(req: Request, res: Response): Promise<void>;
    /**
     * Get buses for a specific stop with departures grouped by line
     * GET /api/buses/:stopName/grouped
     */
    getBusesByStopGrouped(req: Request, res: Response): Promise<void>;
    /**
     * Centralized error handling for bus controller
     */
    private handleError;
}
declare const _default: BusController;
export default _default;
//# sourceMappingURL=busController.d.ts.map