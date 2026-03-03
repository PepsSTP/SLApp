import slService from '../../../src/services/slService';
import {
  mockSites,
  mockDeparturesResponse,
  mockEmptyDeparturesResponse,
} from '../../fixtures/slApiResponses';

// Mock fetch globally
global.fetch = jest.fn();

describe('SLService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchSites', () => {
    it('should successfully search for sites', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSites,
      });

      const result = await slService.searchSites('T-Centralen');

      expect(result).toEqual(mockSites);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('sites?name=T-Centralen')
      );
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      await expect(slService.searchSites('T-Centralen')).rejects.toThrow(
        'SL API Error'
      );
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(slService.searchSites('T-Centralen')).rejects.toThrow(
        'Network error'
      );
    });

    it('should encode special characters in stop name', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await slService.searchSites('Östra Station');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent('Östra Station'))
      );
    });
  });

  describe('findBestMatch', () => {
    it('should return exact name match', () => {
      const result = slService.findBestMatch(mockSites, 'T-Centralen');

      expect(result).toBeDefined();
      expect(result?.id).toBe(9001);
      expect(result?.name).toBe('T-Centralen');
    });

    it('should return exact name match case-insensitive', () => {
      const result = slService.findBestMatch(mockSites, 't-centralen');

      expect(result).toBeDefined();
      expect(result?.id).toBe(9001);
    });

    it('should match by alias', () => {
      const result = slService.findBestMatch(mockSites, 'Central Station');

      expect(result).toBeDefined();
      expect(result?.id).toBe(9001);
      expect(result?.name).toBe('T-Centralen');
    });

    it('should match by alias case-insensitive', () => {
      const result = slService.findBestMatch(mockSites, 'central station');

      expect(result).toBeDefined();
      expect(result?.id).toBe(9001);
    });

    it('should return first result if no exact match', () => {
      const result = slService.findBestMatch(mockSites, 'Unknown Station');

      expect(result).toBeDefined();
      expect(result?.id).toBe(9001); // First in array
    });

    it('should return null for empty sites array', () => {
      const result = slService.findBestMatch([], 'T-Centralen');

      expect(result).toBeNull();
    });

    it('should return null for undefined sites', () => {
      const result = slService.findBestMatch(null as unknown as [], 'T-Centralen');

      expect(result).toBeNull();
    });
  });

  describe('getDepartures', () => {
    it('should successfully get departures for a site', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDeparturesResponse,
      });

      const result = await slService.getDepartures(9001);

      expect(result).toEqual(mockDeparturesResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('sites/9001/departures')
      );
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Not Found',
      });

      await expect(slService.getDepartures(9999)).rejects.toThrow(
        'SL API Error'
      );
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(slService.getDepartures(9001)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('getBusStopData', () => {
    it('should successfully get bus stop data', async () => {
      // Mock searchSites
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSites,
      });

      // Mock getDepartures
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDeparturesResponse,
      });

      const result = await slService.getBusStopData('T-Centralen');

      expect(result).toBeDefined();
      expect(result.stopName).toBe('T-Centralen');
      expect(result.buses).toBeDefined();
      expect(result.buses.length).toBeLessThanOrEqual(5);
    });

    it('should return empty buses array when no departures', async () => {
      // Mock searchSites
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSites,
      });

      // Mock getDepartures with empty response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmptyDeparturesResponse,
      });

      const result = await slService.getBusStopData('T-Centralen');

      expect(result.buses).toEqual([]);
    });

    it('should limit results to maxResults parameter', async () => {
      // Mock searchSites
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSites,
      });

      // Mock getDepartures
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDeparturesResponse,
      });

      const result = await slService.getBusStopData('T-Centralen', 2);

      expect(result.buses.length).toBe(2);
    });

    it('should throw error when stop not found', async () => {
      // Mock searchSites with empty array
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await expect(
        slService.getBusStopData('Unknown Station')
      ).rejects.toThrow('not found');
    });

    it('should sort departures by time', async () => {
      // Mock searchSites
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSites,
      });

      // Mock getDepartures
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDeparturesResponse,
      });

      const result = await slService.getBusStopData('T-Centralen');

      // Check that buses are sorted (earlier times first)
      for (let i = 1; i < result.buses.length; i++) {
        const prevTime = new Date(result.buses[i - 1].departureTime).getTime();
        const currTime = new Date(result.buses[i].departureTime).getTime();
        expect(prevTime).toBeLessThanOrEqual(currTime);
      }
    });

    it('should format departures correctly', async () => {
      // Mock searchSites
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSites,
      });

      // Mock getDepartures
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDeparturesResponse,
      });

      const result = await slService.getBusStopData('T-Centralen');

      result.buses.forEach((bus) => {
        expect(bus).toHaveProperty('line');
        expect(bus).toHaveProperty('destination');
        expect(bus).toHaveProperty('departureTime');
        expect(typeof bus.line).toBe('string');
        expect(typeof bus.destination).toBe('string');
        expect(typeof bus.departureTime).toBe('string');
      });
    });
  });
});
