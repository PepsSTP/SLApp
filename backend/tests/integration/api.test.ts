import request from 'supertest';
import express from 'express';
import apiRoutes from '../../src/routes/api';
import slService from '../../src/services/slService';
import { mockBusStopData } from '../fixtures/slApiResponses';

// Mock the slService
jest.mock('../../src/services/slService');

// Create express app for testing
const app = express();
app.use(express.json());
app.use('/api', apiRoutes);

describe('API Integration Tests', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SL_API_KEY = 'test-api-key';
    // Suppress console.error during tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    delete process.env.SL_API_KEY;
    consoleErrorSpy.mockRestore();
  });

  describe('GET /api/buses/:stopName', () => {
    it('should return bus stop data for valid stop name', async () => {
      (slService.getBusStopData as jest.Mock).mockResolvedValue(mockBusStopData);

      const response = await request(app).get('/api/buses/T-Centralen');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBusStopData);
      expect(response.body.stopName).toBe('T-Centralen');
      expect(Array.isArray(response.body.buses)).toBe(true);
    });

    it('should handle URL-encoded stop names', async () => {
      (slService.getBusStopData as jest.Mock).mockResolvedValue(mockBusStopData);

      const response = await request(app).get(
        '/api/buses/' + encodeURIComponent('T-Centralen')
      );

      expect(response.status).toBe(200);
      expect(slService.getBusStopData).toHaveBeenCalledWith('T-Centralen');
    });

    it('should handle special characters in stop names', async () => {
      const mockData = {
        stopName: 'Åkeshov',
        buses: [],
      };
      (slService.getBusStopData as jest.Mock).mockResolvedValue(mockData);

      const response = await request(app).get(
        '/api/buses/' + encodeURIComponent('Åkeshov')
      );

      expect(response.status).toBe(200);
      expect(response.body.stopName).toBe('Åkeshov');
    });

    it('should return 404 when stop is not found', async () => {
      (slService.getBusStopData as jest.Mock).mockRejectedValue(
        new Error('Bus stop "Unknown" not found')
      );

      const response = await request(app).get('/api/buses/Unknown');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Not Found');
    });

    it('should return 502 when SL API is unavailable', async () => {
      (slService.getBusStopData as jest.Mock).mockRejectedValue(
        new Error('SL API Error: Failed to fetch departures (status 502)')
      );

      const response = await request(app).get('/api/buses/T-Centralen');

      expect(response.status).toBe(502);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('SL API Error');
    });

    it('should return 500 when API key is not configured', async () => {
      delete process.env.SL_API_KEY;

      const response = await request(app).get('/api/buses/T-Centralen');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Configuration Error');
    });

    it('should return 500 for unexpected errors', async () => {
      (slService.getBusStopData as jest.Mock).mockRejectedValue(
        new Error('Unexpected error')
      );

      const response = await request(app).get('/api/buses/T-Centralen');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Internal Server Error');
    });

    it('should return JSON content type', async () => {
      (slService.getBusStopData as jest.Mock).mockResolvedValue(mockBusStopData);

      const response = await request(app).get('/api/buses/T-Centralen');

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should handle empty buses array', async () => {
      const emptyData = {
        stopName: 'T-Centralen',
        buses: [],
      };
      (slService.getBusStopData as jest.Mock).mockResolvedValue(emptyData);

      const response = await request(app).get('/api/buses/T-Centralen');

      expect(response.status).toBe(200);
      expect(response.body.buses).toEqual([]);
    });

    it('should validate bus data structure', async () => {
      (slService.getBusStopData as jest.Mock).mockResolvedValue(mockBusStopData);

      const response = await request(app).get('/api/buses/T-Centralen');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('stopName');
      expect(response.body).toHaveProperty('buses');

      response.body.buses.forEach((bus: Record<string, unknown>) => {
        expect(bus).toHaveProperty('line');
        expect(bus).toHaveProperty('destination');
        expect(bus).toHaveProperty('departureTime');
      });
    });
  });
});
