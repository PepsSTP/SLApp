import { Router } from 'express';
import busController from '../controllers/busController';

const router = Router();

/**
 * Bus Routes
 * GET /api/buses/:stopName - Get buses for a specific stop from SL API
 */
router.get('/buses/:stopName', (req, res) => busController.getBusesByStop(req, res));

export default router;
