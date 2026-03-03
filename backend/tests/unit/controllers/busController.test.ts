import { Request, Response } from 'express';
import busController from '../../../src/controllers/busController';
import slService from '../../../src/services/slService';
import { mockBusStopData } from '../../fixtures/slApiResponses';

// Mock the slService
jest.mock('../../../src/services/slService');

describe('BusController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup response mocks
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockResponse = {
      json: jsonMock,
      status: statusMock,
    };

    // Setup environment
    process.env.SL_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.SL_API_KEY;
  });

  describe('getBusesByStop', () => {
    it('should return bus stop data successfully', async () => {
      mockRequest = {
        params: { stopName: 'T-Centralen' },
      };

      (slService.getBusStopData as jest.Mock).mockResolvedValue(mockBusStopData);

      await busController.getBusesByStop(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(slService.getBusStopData).toHaveBeenCalledWith('T-Centralen');
      expect(jsonMock).toHaveBeenCalledWith(mockBusStopData);
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should decode URI-encoded stop names', async () => {
      mockRequest = {
        params: { stopName: 'T%2DCentralen' }, // T-Centralen encoded
      };

      (slService.getBusStopData as jest.Mock).mockResolvedValue(mockBusStopData);

      await busController.getBusesByStop(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(slService.getBusStopData).toHaveBeenCalledWith('T-Centralen');
    });

    it('should return 500 if API key is not configured', async () => {
      delete process.env.SL_API_KEY;

      mockRequest = {
        params: { stopName: 'T-Centralen' },
      };

      await busController.getBusesByStop(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Configuration Error',
        message: 'SL_API_KEY is not configured',
      });
      expect(slService.getBusStopData).not.toHaveBeenCalled();
    });

    it('should return 404 when stop is not found', async () => {
      mockRequest = {
        params: { stopName: 'Unknown Station' },
      };

      (slService.getBusStopData as jest.Mock).mockRejectedValue(
        new Error('Bus stop "Unknown Station" not found')
      );

      await busController.getBusesByStop(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Not Found',
        message: 'Bus stop "Unknown Station" not found.',
      });
    });

    it('should return 502 when SL API is unavailable', async () => {
      mockRequest = {
        params: { stopName: 'T-Centralen' },
      };

      (slService.getBusStopData as jest.Mock).mockRejectedValue(
        new Error('SL API Error: Failed to fetch departures (status 502)')
      );

      await busController.getBusesByStop(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(502);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'SL API Error',
        message: 'The SL API is currently unavailable. Please try again later.',
      });
    });

    it('should return 500 for general errors', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      mockRequest = {
        params: { stopName: 'T-Centralen' },
      };

      (slService.getBusStopData as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      await busController.getBusesByStop(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Failed to fetch bus information from SL API',
        details: 'Database connection failed',
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should not include error details in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      mockRequest = {
        params: { stopName: 'T-Centralen' },
      };

      (slService.getBusStopData as jest.Mock).mockRejectedValue(
        new Error('Internal error')
      );

      await busController.getBusesByStop(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Failed to fetch bus information from SL API',
        details: undefined,
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle unknown error types', async () => {
      mockRequest = {
        params: { stopName: 'T-Centralen' },
      };

      (slService.getBusStopData as jest.Mock).mockRejectedValue('String error');

      await busController.getBusesByStop(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      });
    });
  });

  describe('getBusesByStopGrouped', () => {
    const mockGroupedData = {
      stopName: 'T-Centralen',
      groupedDepartures: [
        {
          line: 'Metro 1',
          transportMode: 'METRO',
          destination: 'Fruängen',
          departures: [{ line: 'Metro 1', destination: 'Fruängen', departureTime: '2024-01-15T10:25:00' }],
        },
      ],
    };

    it('should return grouped bus stop data successfully', async () => {
      mockRequest = { params: { stopName: 'T-Centralen' } };
      (slService.getBusStopDataGrouped as jest.Mock).mockResolvedValue(mockGroupedData);

      await busController.getBusesByStopGrouped(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonMock).toHaveBeenCalledWith(mockGroupedData);
    });

    it('should return 500 if API key is not configured', async () => {
      delete process.env.SL_API_KEY;
      mockRequest = { params: { stopName: 'T-Centralen' } };

      await busController.getBusesByStopGrouped(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
    });

    it('should return 404 when stop is not found', async () => {
      mockRequest = { params: { stopName: 'Unknown Station' } };
      (slService.getBusStopDataGrouped as jest.Mock).mockRejectedValue(
        new Error('Bus stop "Unknown Station" not found')
      );

      await busController.getBusesByStopGrouped(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it('should decode URI-encoded stop names', async () => {
      mockRequest = { params: { stopName: 'T-Centralen%20Station' } };
      (slService.getBusStopDataGrouped as jest.Mock).mockResolvedValue(mockGroupedData);

      await busController.getBusesByStopGrouped(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(slService.getBusStopDataGrouped).toHaveBeenCalledWith('T-Centralen Station');
    });
  });
});
