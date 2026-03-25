import { groupDeparturesByLine } from '../../../src/utils/lineGrouper';
import { FormattedDeparture } from '../../../src/types/sl.types';

const dep = (line: string, destination: string, time: string): FormattedDeparture => ({
  line,
  destination,
  departureTime: time,
  scheduled: time,
});

describe('lineGrouper', () => {
  describe('groupDeparturesByLine', () => {
    it('should return empty array for empty input', () => {
      expect(groupDeparturesByLine([])).toEqual([]);
    });

    it('should group departures by line and destination', () => {
      const departures = [
        dep('4', 'Gullmarsplan', '2024-01-15T10:30:00'),
        dep('4', 'Gullmarsplan', '2024-01-15T10:40:00'),
        dep('55', 'Slussen', '2024-01-15T10:35:00'),
      ];

      const result = groupDeparturesByLine(departures);

      expect(result).toHaveLength(2);
      expect(result[0].line).toBe('4');
      expect(result[0].departures).toHaveLength(2);
      expect(result[1].line).toBe('55');
    });

    it('should treat same line with different destinations as separate groups', () => {
      const departures = [
        dep('4', 'Gullmarsplan', '2024-01-15T10:30:00'),
        dep('4', 'Slussen', '2024-01-15T10:31:00'),
      ];

      const result = groupDeparturesByLine(departures);

      expect(result).toHaveLength(2);
    });

    it('should limit departures per group to maxPerLine', () => {
      const departures = [
        dep('4', 'Gullmarsplan', '2024-01-15T10:30:00'),
        dep('4', 'Gullmarsplan', '2024-01-15T10:40:00'),
        dep('4', 'Gullmarsplan', '2024-01-15T10:50:00'),
        dep('4', 'Gullmarsplan', '2024-01-15T11:00:00'),
      ];

      const result = groupDeparturesByLine(departures, 2);

      expect(result[0].departures).toHaveLength(2);
    });

    it('should sort groups by earliest departure time', () => {
      const departures = [
        dep('55', 'Slussen', '2024-01-15T10:35:00'),
        dep('4', 'Gullmarsplan', '2024-01-15T10:30:00'),
      ];

      const result = groupDeparturesByLine(departures);

      expect(result[0].line).toBe('4');
      expect(result[1].line).toBe('55');
    });

    it('should extract METRO transport mode', () => {
      const result = groupDeparturesByLine([dep('Metro 1', 'Fruängen', '2024-01-15T10:00:00')]);
      expect(result[0].transportMode).toBe('METRO');
    });

    it('should extract TRAIN transport mode', () => {
      const result = groupDeparturesByLine([dep('Train 20', 'Uppsala', '2024-01-15T10:00:00')]);
      expect(result[0].transportMode).toBe('TRAIN');
    });

    it('should extract TRAM transport mode', () => {
      const result = groupDeparturesByLine([dep('Tram 7', 'Ropsten', '2024-01-15T10:00:00')]);
      expect(result[0].transportMode).toBe('TRAM');
    });

    it('should default to BUS transport mode', () => {
      const result = groupDeparturesByLine([dep('4', 'Gullmarsplan', '2024-01-15T10:00:00')]);
      expect(result[0].transportMode).toBe('BUS');
    });

    it('should include line and destination on each group', () => {
      const result = groupDeparturesByLine([dep('55', 'Slussen', '2024-01-15T10:00:00')]);
      expect(result[0].line).toBe('55');
      expect(result[0].destination).toBe('Slussen');
    });
  });
});
