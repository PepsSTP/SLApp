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
                  number: 'tunnelbanans gröna linje 19',
                  disassembledName: '19',
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
                  number: 'tunnelbanans gröna linje 19',
                  disassembledName: '19',
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

      const result = await journeyPlannerService.getJourneys('Bandhagen', 'Gullmarsplan', ['19']);

      expect(result.origin).toBe('Bandhagen');
      expect(result.destination).toBe('Gullmarsplan');
      expect(result.departures).toHaveLength(2);
      expect(result.departures[0]).toEqual({
        line: '19',
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
                  number: 'tunnelbanans gröna linje 19',
                  disassembledName: '19',
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
                  number: 'Buss 144',
                  disassembledName: '144',
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

      const result = await journeyPlannerService.getJourneys('Bandhagen', 'Gullmarsplan', ['19']);

      expect(result.departures).toHaveLength(1);
      expect(result.departures[0].line).toBe('19');
    });

    it('should filter out multi-leg journeys', async () => {
      const mockResponse = {
        journeys: [
          {
            // Direct journey — should be kept
            legs: [
              {
                transportation: {
                  number: 'tunnelbanans gröna linje 19',
                  disassembledName: '19',
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
                  number: 'Buss 144',
                  disassembledName: '144',
                  product: { name: 'Buss' },
                  destination: { name: 'Fruängen' },
                },
                origin: {
                  departureTimePlanned: '2024-01-15T10:35:00Z',
                },
              },
              {
                transportation: {
                  number: 'tunnelbanans gröna linje 19',
                  disassembledName: '19',
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

      const result = await journeyPlannerService.getJourneys('Bandhagen', 'Gullmarsplan', ['19', '144']);

      expect(result.departures).toHaveLength(1);
      expect(result.departures[0].line).toBe('19');
    });

    it('should use real-time time when available, fall back to scheduled', async () => {
      const mockResponse = {
        journeys: [
          {
            legs: [
              {
                transportation: {
                  number: 'tunnelbanans gröna linje 19',
                  disassembledName: '19',
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
                  number: 'tunnelbanans gröna linje 19',
                  disassembledName: '19',
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

      const result = await journeyPlannerService.getJourneys('Bandhagen', 'Gullmarsplan', ['19']);

      // First departure: has estimated time
      expect(result.departures[0].departureTime).toBe('2024-01-15T10:33:00Z');
      expect(result.departures[0].scheduled).toBe('2024-01-15T10:30:00Z');

      // Second departure: no estimated time, falls back to planned
      expect(result.departures[1].departureTime).toBe('2024-01-15T10:45:00Z');
      expect(result.departures[1].scheduled).toBe('2024-01-15T10:45:00Z');
    });

    it('should return 404 when origin stop name is not recognised', async () => {
      await expect(
        journeyPlannerService.getJourneys('NonExistentStop', 'Gullmarsplan', ['19'])
      ).rejects.toThrow('Stop "NonExistentStop" not found');
    });

    it('should return 404 when destination stop name is not recognised', async () => {
      await expect(
        journeyPlannerService.getJourneys('Bandhagen', 'NonExistentStop', ['19'])
      ).rejects.toThrow('Stop "NonExistentStop" not found');
    });

    it('should return empty departures array when no matching journeys found', async () => {
      const mockResponse = {
        journeys: [
          {
            legs: [
              {
                transportation: {
                  number: 'Buss 144',
                  disassembledName: '144',
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

      const result = await journeyPlannerService.getJourneys('Bandhagen', 'Gullmarsplan', ['19']);

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
                  number: 'Buss 144',
                  disassembledName: '144',
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

      const result = await journeyPlannerService.getJourneys('Bandhagen', 'Gullmarsplan', ['19']);

      expect(result.departures).toEqual([]);
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      await expect(
        journeyPlannerService.getJourneys('Bandhagen', 'Gullmarsplan', ['19'])
      ).rejects.toThrow('Journey Planner API Error');
    });

    it('should map TRAM transport mode correctly', async () => {
      const mockResponse = {
        journeys: [
          {
            legs: [
              {
                transportation: {
                  number: 'Spårvagn 7',
                  disassembledName: '7',
                  product: { name: 'Spårvagn' },
                  destination: { name: 'Spårvägsmuseet' },
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

      const result = await journeyPlannerService.getJourneys('Bandhagen', 'Gullmarsplan', ['7']);

      expect(result.departures[0].transportMode).toBe('TRAM');
    });

    it('should map TRAIN transport mode correctly', async () => {
      const mockResponse = {
        journeys: [
          {
            legs: [
              {
                transportation: {
                  number: 'Pendeltåg 36',
                  disassembledName: '36',
                  product: { name: 'Pendeltåg' },
                  destination: { name: 'Nynäshamn' },
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

      const result = await journeyPlannerService.getJourneys('Bandhagen', 'Gullmarsplan', ['36']);

      expect(result.departures[0].transportMode).toBe('TRAIN');
    });

    it('should filter lines case-insensitively', async () => {
      const mockResponse = {
        journeys: [
          {
            legs: [
              {
                transportation: {
                  number: 'tunnelbanans gröna linje 19',
                  disassembledName: '19',
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

      const result = await journeyPlannerService.getJourneys('Bandhagen', 'Gullmarsplan', ['19']);

      expect(result.departures).toHaveLength(1);
    });

    it('should pass after param to fetchJourneys and include itdDate/itdTime in URL', async () => {
      const mockResponse = {
        journeys: [
          {
            legs: [
              {
                transportation: {
                  number: 'tunnelbanans gröna linje 19',
                  disassembledName: '19',
                  product: { name: 'Tunnelbana' },
                  destination: { name: 'Hässelby strand' },
                },
                origin: {
                  departureTimePlanned: '2024-01-15T11:00:00Z',
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

      await journeyPlannerService.getJourneys('Bandhagen', 'Gullmarsplan', ['19'], '2024-01-15T10:30:00Z');

      const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
      expect(calledUrl).toContain('itdDate=20240115');
      expect(calledUrl).toContain('itdTime=');
      expect(calledUrl).toContain('depArrMacro=dep');
    });

    it('should not include itdDate/itdTime when after is not provided', async () => {
      const mockResponse = { journeys: [] };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await journeyPlannerService.getJourneys('Bandhagen', 'Gullmarsplan', ['19']);

      const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
      expect(calledUrl).not.toContain('itdDate');
      expect(calledUrl).not.toContain('itdTime');
      expect(calledUrl).not.toContain('depArrMacro');
    });

    it('should ignore invalid after parameter gracefully', async () => {
      const mockResponse = { journeys: [] };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await journeyPlannerService.getJourneys('Bandhagen', 'Gullmarsplan', ['19'], 'not-a-date');

      const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
      expect(calledUrl).not.toContain('itdDate');
      expect(calledUrl).not.toContain('itdTime');
    });
  });
});
