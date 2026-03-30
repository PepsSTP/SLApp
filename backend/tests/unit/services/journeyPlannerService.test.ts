import journeyPlannerService from '../../../src/services/journeyPlannerService';

// Mock fetch globally
global.fetch = jest.fn();

describe('JourneyPlannerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getJourneys', () => {
    it('should return departures for a valid origin/destination/lines combination', async () => {
      const mockResponse = {
        journeys: [
          {
            legs: [
              {
                transportation: {
                  number: 'Metro 19',
                  product: { name: 'Tunnelbana' },
                  destination: { name: 'Hässelby strand' },
                },
                origin: {
                  departureTimePlanned: '2024-01-15T10:30:00Z',
                  departureTimeEstimated: '2024-01-15T10:32:00Z',
                },
              },
            ],
          },
          {
            legs: [
              {
                transportation: {
                  number: 'Metro 19',
                  product: { name: 'Tunnelbana' },
                  destination: { name: 'Hässelby strand' },
                },
                origin: {
                  departureTimePlanned: '2024-01-15T10:45:00Z',
                },
              },
            ],
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await journeyPlannerService.getJourneys('Bandhagen', 'Gullmarsplan', ['Metro 19']);

      expect(result.origin).toBe('Bandhagen');
      expect(result.destination).toBe('Gullmarsplan');
      expect(result.departures).toHaveLength(2);
      expect(result.departures[0]).toEqual({
        line: 'Metro 19',
        destination: 'Hässelby strand',
        departureTime: '2024-01-15T10:32:00Z',
        scheduled: '2024-01-15T10:30:00Z',
        transportMode: 'METRO',
      });
    });

    it('should filter out journeys not matching the requested lines', async () => {
      const mockResponse = {
        journeys: [
          {
            legs: [
              {
                transportation: {
                  number: 'Metro 19',
                  product: { name: 'Tunnelbana' },
                  destination: { name: 'Hässelby strand' },
                },
                origin: {
                  departureTimePlanned: '2024-01-15T10:30:00Z',
                },
              },
            ],
          },
          {
            legs: [
              {
                transportation: {
                  number: '144',
                  product: { name: 'Buss' },
                  destination: { name: 'Fruängen' },
                },
                origin: {
                  departureTimePlanned: '2024-01-15T10:35:00Z',
                },
              },
            ],
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await journeyPlannerService.getJourneys('Bandhagen', 'Gullmarsplan', ['Metro 19']);

      expect(result.departures).toHaveLength(1);
      expect(result.departures[0].line).toBe('Metro 19');
    });

    it('should filter out multi-leg journeys', async () => {
      const mockResponse = {
        journeys: [
          {
            // Direct journey — should be kept
            legs: [
              {
                transportation: {
                  number: 'Metro 19',
                  product: { name: 'Tunnelbana' },
                  destination: { name: 'Hässelby strand' },
                },
                origin: {
                  departureTimePlanned: '2024-01-15T10:30:00Z',
                },
              },
            ],
          },
          {
            // Multi-leg journey — should be filtered out
            legs: [
              {
                transportation: {
                  number: '144',
                  product: { name: 'Buss' },
                  destination: { name: 'Fruängen' },
                },
                origin: {
                  departureTimePlanned: '2024-01-15T10:35:00Z',
                },
              },
              {
                transportation: {
                  number: 'Metro 19',
                  product: { name: 'Tunnelbana' },
                  destination: { name: 'Hässelby strand' },
                },
                origin: {
                  departureTimePlanned: '2024-01-15T10:50:00Z',
                },
              },
            ],
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await journeyPlannerService.getJourneys('Bandhagen', 'Gullmarsplan', ['Metro 19', '144']);

      expect(result.departures).toHaveLength(1);
      expect(result.departures[0].line).toBe('Metro 19');
    });

    it('should use real-time time when available, fall back to scheduled', async () => {
      const mockResponse = {
        journeys: [
          {
            legs: [
              {
                transportation: {
                  number: 'Metro 19',
                  product: { name: 'Tunnelbana' },
                  destination: { name: 'Hässelby strand' },
                },
                origin: {
                  departureTimePlanned: '2024-01-15T10:30:00Z',
                  departureTimeEstimated: '2024-01-15T10:33:00Z',
                },
              },
            ],
          },
          {
            legs: [
              {
                transportation: {
                  number: 'Metro 19',
                  product: { name: 'Tunnelbana' },
                  destination: { name: 'Hässelby strand' },
                },
                origin: {
                  departureTimePlanned: '2024-01-15T10:45:00Z',
                  // No estimated time — should fall back to planned
                },
              },
            ],
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await journeyPlannerService.getJourneys('Bandhagen', 'Gullmarsplan', ['Metro 19']);

      // First departure: has estimated time
      expect(result.departures[0].departureTime).toBe('2024-01-15T10:33:00Z');
      expect(result.departures[0].scheduled).toBe('2024-01-15T10:30:00Z');

      // Second departure: no estimated time, falls back to planned
      expect(result.departures[1].departureTime).toBe('2024-01-15T10:45:00Z');
      expect(result.departures[1].scheduled).toBe('2024-01-15T10:45:00Z');
    });

    it('should return 404 when origin stop name is not recognised', async () => {
      await expect(
        journeyPlannerService.getJourneys('NonExistentStop', 'Gullmarsplan', ['Metro 19'])
      ).rejects.toThrow('Stop "NonExistentStop" not found');
    });

    it('should return 404 when destination stop name is not recognised', async () => {
      await expect(
        journeyPlannerService.getJourneys('Bandhagen', 'NonExistentStop', ['Metro 19'])
      ).rejects.toThrow('Stop "NonExistentStop" not found');
    });

    it('should return empty departures array when no matching journeys found', async () => {
      const mockResponse = {
        journeys: [
          {
            legs: [
              {
                transportation: {
                  number: '144',
                  product: { name: 'Buss' },
                  destination: { name: 'Fruängen' },
                },
                origin: {
                  departureTimePlanned: '2024-01-15T10:35:00Z',
                },
              },
            ],
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await journeyPlannerService.getJourneys('Bandhagen', 'Gullmarsplan', ['Metro 19']);

      expect(result.departures).toEqual([]);
      expect(result.origin).toBe('Bandhagen');
      expect(result.destination).toBe('Gullmarsplan');
    });

    it('should map transport modes correctly', async () => {
      const mockResponse = {
        journeys: [
          {
            legs: [
              {
                transportation: {
                  number: '144',
                  product: { name: 'Buss' },
                  destination: { name: 'Fruängen' },
                },
                origin: {
                  departureTimePlanned: '2024-01-15T10:30:00Z',
                },
              },
            ],
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await journeyPlannerService.getJourneys('Bandhagen', 'Gullmarsplan', ['144']);

      expect(result.departures[0].transportMode).toBe('BUS');
    });

    it('should handle empty journeys array from API', async () => {
      const mockResponse = {
        journeys: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await journeyPlannerService.getJourneys('Bandhagen', 'Gullmarsplan', ['Metro 19']);

      expect(result.departures).toEqual([]);
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      await expect(
        journeyPlannerService.getJourneys('Bandhagen', 'Gullmarsplan', ['Metro 19'])
      ).rejects.toThrow('Journey Planner API Error');
    });

    it('should filter lines case-insensitively', async () => {
      const mockResponse = {
        journeys: [
          {
            legs: [
              {
                transportation: {
                  number: 'Metro 19',
                  product: { name: 'Tunnelbana' },
                  destination: { name: 'Hässelby strand' },
                },
                origin: {
                  departureTimePlanned: '2024-01-15T10:30:00Z',
                },
              },
            ],
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await journeyPlannerService.getJourneys('Bandhagen', 'Gullmarsplan', ['metro 19']);

      expect(result.departures).toHaveLength(1);
    });
  });
});
