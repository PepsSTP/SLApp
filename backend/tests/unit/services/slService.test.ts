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

    it('should throw error when findBestMatch returns null', async () => {
      // Return sites that won't match the search term
      const unmatchableSites = [{ id: 9999, name: 'Somewhere Else', alias: [] }];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => unmatchableSites,
      });

      // findBestMatch falls back to first result, so mock a spy to return null
      const spy = jest.spyOn(slService, 'findBestMatch').mockReturnValueOnce(null);

      await expect(slService.getBusStopData('Nowhere')).rejects.toThrow('not found');

      spy.mockRestore();
    });
  });

  describe('getBusStopDataGrouped', () => {
    it('should return grouped departures for a valid stop', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSites,
      });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDeparturesResponse,
      });

      const result = await slService.getBusStopDataGrouped('T-Centralen');

      expect(result.stopName).toBe('T-Centralen');
      expect(result.groupedDepartures).toBeDefined();
      expect(Array.isArray(result.groupedDepartures)).toBe(true);
    });

    it('should throw error when stop not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await expect(slService.getBusStopDataGrouped('Unknown')).rejects.toThrow('not found');
    });

    it('should return empty groupedDepartures for stop with no departures', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSites,
      });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmptyDeparturesResponse,
      });

      const result = await slService.getBusStopDataGrouped('T-Centralen');

      expect(result.groupedDepartures).toEqual([]);
    });

    it('should throw error when findBestMatch returns null', async () => {
      const unmatchableSites = [{ id: 9999, name: 'Somewhere Else', alias: [] }];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => unmatchableSites,
      });

      const spy = jest.spyOn(slService, 'findBestMatch').mockReturnValueOnce(null);

      await expect(slService.getBusStopDataGrouped('Nowhere')).rejects.toThrow('not found');

      spy.mockRestore();
    });

    it('should return up to 20 departures per line by default', async () => {
      const manyDepartures = Array.from({ length: 25 }, (_, i) => ({
        line: { designation: '4', name: 'Line 4', transport_mode: 'BUS' },
        destination: 'Gullmarsplan',
        expected: `2024-01-15T${String(10 + Math.floor(i / 3)).padStart(2, '0')}:${String((i % 3) * 20).padStart(2, '0')}:00`,
        scheduled: `2024-01-15T${String(10 + Math.floor(i / 3)).padStart(2, '0')}:${String((i % 3) * 20).padStart(2, '0')}:00`,
      }));

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSites,
      });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ departures: manyDepartures }),
      });

      const result = await slService.getBusStopDataGrouped('T-Centralen');

      expect(result.groupedDepartures[0].departures).toHaveLength(20);
    });
  });
});
