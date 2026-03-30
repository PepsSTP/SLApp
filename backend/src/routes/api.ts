import { Router } from 'express';
import busController from '../controllers/busController';
import journeyController from '../controllers/journeyController';

const router = Router();

/**
 * Bus Routes
 * GET /api/buses/:stopName/grouped - Get buses grouped by line for a specific stop
 * GET /api/buses/:stopName - Get buses for a specific stop from SL API
 */
router.get('/buses/:stopName/grouped', (req, res) => busController.getBusesByStopGrouped(req, res));
router.get('/buses/:stopName', (req, res) => busController.getBusesByStop(req, res));

/**
 * Journey Routes
 * GET /api/journeys - Get journeys between two stops, filtered by lines
 */
router.get('/journeys', (req, res) => journeyController.getJourneys(req, res));

export default router;
