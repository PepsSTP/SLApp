import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import busService from '../../../src/services/busService';
import { mockBusStopData } from '../../fixtures/mockBusData';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('busService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBusStopData', () => {
    it('should successfully fetch bus stop data', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockBusStopData });

      const result = await busService.getBusStopData('T-Centralen');

      expect(result).toEqual(mockBusStopData);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/buses/T-Centralen'
      );
    });

    it('should encode special characters in stop name', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockBusStopData });

      await busService.getBusStopData('Östra Station');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/buses/%C3%96stra%20Station'
      );
    });

    it('should handle spaces in stop name', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockBusStopData });

      await busService.getBusStopData('Central Station');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/buses/Central%20Station'
      );
    });
  });

  describe('getBusStopDataGrouped', () => {
    it('should fetch grouped bus stop data', async () => {
      const mockGrouped = { stopName: 'T-Centralen', groupedDepartures: [] };
      mockedAxios.get.mockResolvedValue({ data: mockGrouped });

      const result = await busService.getBusStopDataGrouped('T-Centralen');

      expect(result).toEqual(mockGrouped);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/buses/T-Centralen/grouped'
      );
    });
  });

  describe('getMultipleStops', () => {
    it('should fetch multiple stops in parallel', async () => {
      const mockGrouped = { stopName: 'T-Centralen', groupedDepartures: [] };
      mockedAxios.get.mockResolvedValue({ data: mockGrouped });

      const result = await busService.getMultipleStops(['T-Centralen', 'Gullmarsplan']);

      expect(result).toHaveLength(2);
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('getJourneys', () => {
    it('should call the journeys endpoint with query params', async () => {
      const mockResponse = {
        origin: 'Juliaborg',
        destination: 'Gullmarsplan',
        journeys: [],
      };
      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await busService.getJourneys('Juliaborg', 'Gullmarsplan', '144,19');

      expect(result).toEqual(mockResponse);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/journeys?origin=Juliaborg&destination=Gullmarsplan&lines=144%2C19'
      );
    });

    it('should include after param when provided', async () => {
      const mockResponse = {
        origin: 'Juliaborg',
        destination: 'Gullmarsplan',
        journeys: [],
      };
      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const after = '2026-03-30T10:00:00Z';
      await busService.getJourneys('Juliaborg', 'Gullmarsplan', '144', after);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('after=')
      );
    });
  });

  describe('parseError', () => {
    it('should parse 404 error', () => {
      const error = {
        response: {
          status: 404,
          data: { message: 'Not found' },
        },
      };
      mockedAxios.isAxiosError.mockReturnValue(true);

      const result = busService.parseError(error, 'Unknown Station');

      expect(result).toContain('Unknown Station');
      expect(result).toContain('not found');
    });

    it('should parse 502 error', () => {
      const error = {
        response: {
          status: 502,
          data: {},
        },
      };
      mockedAxios.isAxiosError.mockReturnValue(true);

      const result = busService.parseError(error, 'T-Centralen');

      expect(result).toContain('SL API');
      expect(result).toContain('unavailable');
    });

    it('should parse 503 error', () => {
      const error = {
        response: {
          status: 503,
          data: {},
        },
      };
      mockedAxios.isAxiosError.mockReturnValue(true);

      const result = busService.parseError(error, 'T-Centralen');

      expect(result).toContain('SL API');
      expect(result).toContain('unavailable');
    });

    it('should parse 500 error', () => {
      const error = {
        response: {
          status: 500,
          data: {},
        },
      };
      mockedAxios.isAxiosError.mockReturnValue(true);

      const result = busService.parseError(error, 'T-Centralen');

      expect(result).toContain('Server error');
    });

    it('should use API error message when available', () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Custom error message' },
        },
      };
      mockedAxios.isAxiosError.mockReturnValue(true);

      const result = busService.parseError(error, 'T-Centralen');

      expect(result).toContain('Custom error message');
    });

    it('should use axios error message as fallback', () => {
      const error = {
        message: 'Request timeout',
        response: {
          status: 408,
          data: {},
        },
      };
      mockedAxios.isAxiosError.mockReturnValue(true);

      const result = busService.parseError(error, 'T-Centralen');

      expect(result).toContain('Request timeout');
    });

    it('should handle network errors', () => {
      const error = new Error('Network error');
      mockedAxios.isAxiosError.mockReturnValue(false);

      const result = busService.parseError(error, 'T-Centralen');

      expect(result).toContain('Network error');
      expect(result).toContain('connection');
    });

    it('should handle unknown error types', () => {
      const error = 'String error';
      mockedAxios.isAxiosError.mockReturnValue(false);

      const result = busService.parseError(error, 'T-Centralen');

      expect(result).toContain('Network error');
    });
  });
});
