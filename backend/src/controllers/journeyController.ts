import { Request, Response } from 'express';
import journeyPlannerService from '../services/journeyPlannerService';

/**
 * Journey Controller
 * Handles HTTP requests for the journey planner endpoint
 */
class JourneyController {
  /**
   * Get journeys between two stops, filtered by lines
   * GET /api/journeys?origin=Bandhagen&destination=Gullmarsplan&lines=Metro+19
   */
  async getJourneys(req: Request, res: Response): Promise<void> {
    const { origin, destination, lines } = req.query;

    if (!origin || typeof origin !== 'string') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required query parameter: origin',
      });
      return;
    }

    if (!destination || typeof destination !== 'string') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required query parameter: destination',
      });
      return;
    }

    if (!lines || typeof lines !== 'string') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required query parameter: lines',
      });
      return;
    }

    const linesList = lines.split(',').map(l => l.trim()).filter(Boolean);

    try {
      const result = await journeyPlannerService.getJourneys(origin, destination, linesList);
      res.json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Centralized error handling for journey controller
   */
  private handleError(error: unknown, res: Response): void {
    console.error('Error fetching from Journey Planner API:', error);

    if (error instanceof Error) {
      const message = error.message;

      if (message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message,
        });
        return;
      }

      if (message.includes('status 502') || message.includes('status 503')) {
        res.status(502).json({
          error: 'Journey Planner API Error',
          message: 'The SL Journey Planner API is currently unavailable. Please try again later.',
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch journey information',
        details: process.env.NODE_ENV === 'development' ? message : undefined,
      });
    } else {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      });
    }
  }
}

// Export singleton instance
export default new JourneyController();
