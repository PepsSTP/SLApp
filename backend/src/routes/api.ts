import { Router } from 'express';
import busController from '../controllers/busController';
import journeyController from '../controllers/journeyController';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     FormattedDeparture:
 *       type: object
 *       properties:
 *         line:
 *           type: string
 *           example: "163"
 *         destination:
 *           type: string
 *           example: "Älvsjö station"
 *         departureTime:
 *           type: string
 *           format: date-time
 *           description: Real-time departure if available, otherwise scheduled
 *           example: "2025-01-15T08:42:00Z"
 *         scheduled:
 *           type: string
 *           format: date-time
 *           description: Scheduled timetable time
 *           example: "2025-01-15T08:40:00Z"
 *     BusStopData:
 *       type: object
 *       properties:
 *         stopName:
 *           type: string
 *           example: "Juliaborg"
 *         buses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FormattedDeparture'
 *     GroupedDeparture:
 *       type: object
 *       properties:
 *         line:
 *           type: string
 *           example: "163"
 *         transportMode:
 *           type: string
 *           enum: [BUS, METRO, TRAIN, TRAM, FERRY, SHIP]
 *           example: "BUS"
 *         destination:
 *           type: string
 *           example: "Sockenplan"
 *         departures:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FormattedDeparture'
 *     BusStopDataGrouped:
 *       type: object
 *       properties:
 *         stopName:
 *           type: string
 *           example: "Juliaborg"
 *         groupedDepartures:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/GroupedDeparture'
 *     JourneyDeparture:
 *       type: object
 *       properties:
 *         line:
 *           type: string
 *           example: "Metro 19"
 *         destination:
 *           type: string
 *           description: Line terminus (what the vehicle sign says)
 *           example: "Hagsätra"
 *         departureTime:
 *           type: string
 *           format: date-time
 *           description: Real-time departure if available, otherwise scheduled (ISO 8601 UTC)
 *           example: "2025-01-15T08:42:00Z"
 *         scheduled:
 *           type: string
 *           format: date-time
 *           description: Scheduled timetable time (ISO 8601 UTC)
 *           example: "2025-01-15T08:40:00Z"
 *         transportMode:
 *           type: string
 *           enum: [BUS, METRO, TRAM, TRAIN]
 *           example: "METRO"
 *     JourneyResponse:
 *       type: object
 *       properties:
 *         origin:
 *           type: string
 *           example: "Bandhagen"
 *         destination:
 *           type: string
 *           example: "Gullmarsplan"
 *         departures:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/JourneyDeparture'
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Not Found"
 *         message:
 *           type: string
 *           example: "Bus stop \"Unknown\" not found."
 *         details:
 *           type: string
 *           description: Additional error details (development only)
 */

/**
 * @openapi
 * /api/buses/{stopName}:
 *   get:
 *     summary: Get departures for a stop
 *     description: Returns raw real-time departures for a specific bus stop.
 *     tags:
 *       - Buses
 *     parameters:
 *       - in: path
 *         name: stopName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the bus stop (URL-encoded)
 *         example: Juliaborg
 *     responses:
 *       200:
 *         description: List of departures for the stop
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusStopData'
 *       404:
 *         description: Stop name not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error or missing API key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       502:
 *         description: SL API unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/buses/:stopName', (req, res) => busController.getBusesByStop(req, res));

/**
 * @openapi
 * /api/buses/{stopName}/grouped:
 *   get:
 *     summary: Get departures grouped by line
 *     description: Returns real-time departures for a specific bus stop, grouped by line number and destination.
 *     tags:
 *       - Buses
 *     parameters:
 *       - in: path
 *         name: stopName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the bus stop (URL-encoded)
 *         example: Juliaborg
 *     responses:
 *       200:
 *         description: Departures grouped by line and destination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusStopDataGrouped'
 *       404:
 *         description: Stop name not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error or missing API key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       502:
 *         description: SL API unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/buses/:stopName/grouped', (req, res) => busController.getBusesByStopGrouped(req, res));

/**
 * @openapi
 * /api/journeys:
 *   get:
 *     summary: Get journeys between two stops
 *     description: Returns upcoming journeys from origin to destination, filtered by specific line numbers.
 *     tags:
 *       - Journeys
 *     parameters:
 *       - in: query
 *         name: origin
 *         required: true
 *         schema:
 *           type: string
 *         description: Origin stop name
 *         example: Bandhagen
 *       - in: query
 *         name: destination
 *         required: true
 *         schema:
 *           type: string
 *         description: Destination stop name
 *         example: Gullmarsplan
 *       - in: query
 *         name: lines
 *         required: true
 *         schema:
 *           type: string
 *         description: Comma-separated line numbers to filter by
 *         example: "Metro 19"
 *       - in: query
 *         name: after
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: ISO 8601 timestamp; fetch journeys departing after this time
 *         example: "2025-01-15T08:00:00Z"
 *     responses:
 *       200:
 *         description: List of matching journeys
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JourneyResponse'
 *       400:
 *         description: Missing required query parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Stop name not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       502:
 *         description: Journey Planner API unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/journeys', (req, res) => journeyController.getJourneys(req, res));

export default router;
