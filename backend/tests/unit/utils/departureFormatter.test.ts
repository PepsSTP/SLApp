import {
  formatDeparture,
  formatDepartures,
  sortDeparturesByTime,
} from '../../../src/utils/departureFormatter';
import { SLDeparture, FormattedDeparture } from '../../../src/types/sl.types';

describe('departureFormatter', () => {
  describe('formatDeparture', () => {
    it('should format a bus departure correctly', () => {
      const departure: SLDeparture = {
        line: {
          designation: '4',
          transport_mode: 'BUS',
        },
        destination: 'Gullmarsplan',
        expected: '2024-01-15T10:30:00',
      };

      const result = formatDeparture(departure);

      expect(result).toEqual({
        line: '4',
        destination: 'Gullmarsplan',
        departureTime: '2024-01-15T10:30:00',
        scheduled: '2024-01-15T10:30:00',
      });
    });

    it('should format a metro departure with "Metro" prefix', () => {
      const departure: SLDeparture = {
        line: {
          designation: '14',
          transport_mode: 'METRO',
        },
        destination: 'Mörby centrum',
        expected: '2024-01-15T10:25:00',
      };

      const result = formatDeparture(departure);

      expect(result.line).toBe('Metro 14');
      expect(result.destination).toBe('Mörby centrum');
    });

    it('should format a train departure with "Train" prefix', () => {
      const departure: SLDeparture = {
        line: {
          designation: '43',
          transport_mode: 'TRAIN',
        },
        destination: 'Uppsala',
        expected: '2024-01-15T11:00:00',
      };

      const result = formatDeparture(departure);

      expect(result.line).toBe('Train 43');
    });

    it('should format a tram departure with "Tram" prefix', () => {
      const departure: SLDeparture = {
        line: {
          designation: '7',
          transport_mode: 'TRAM',
        },
        destination: 'Djurgården',
        expected: '2024-01-15T10:45:00',
      };

      const result = formatDeparture(departure);

      expect(result.line).toBe('Tram 7');
    });

    it('should use scheduled time when expected is missing', () => {
      const departure: SLDeparture = {
        line: {
          designation: '4',
          transport_mode: 'BUS',
        },
        destination: 'Gullmarsplan',
        scheduled: '2024-01-15T10:30:00',
      };

      const result = formatDeparture(departure);

      expect(result.departureTime).toBe('2024-01-15T10:30:00');
      expect(result.scheduled).toBe('2024-01-15T10:30:00');
    });

    it('should set scheduled to the SL scheduled time even when expected differs', () => {
      const departure: SLDeparture = {
        line: {
          designation: '4',
          transport_mode: 'BUS',
        },
        destination: 'Gullmarsplan',
        expected: '2024-01-15T10:35:00',
        scheduled: '2024-01-15T10:30:00',
      };

      const result = formatDeparture(departure);

      expect(result.departureTime).toBe('2024-01-15T10:35:00');
      expect(result.scheduled).toBe('2024-01-15T10:30:00');
    });

    it('should use display time as fallback', () => {
      const departure: SLDeparture = {
        line: {
          designation: '4',
          transport_mode: 'BUS',
        },
        destination: 'Gullmarsplan',
        display: '10:30',
      };

      const result = formatDeparture(departure);

      expect(result.departureTime).toBe('10:30');
    });

    it('should use direction when destination is missing', () => {
      const departure: SLDeparture = {
        line: {
          designation: '4',
          transport_mode: 'BUS',
        },
        direction: 'Gullmarsplan via Slussen',
        expected: '2024-01-15T10:30:00',
      };

      const result = formatDeparture(departure);

      expect(result.destination).toBe('Gullmarsplan via Slussen');
    });

    it('should handle line as string', () => {
      const departure: SLDeparture = {
        line: '4',
        destination: 'Gullmarsplan',
        expected: '2024-01-15T10:30:00',
      };

      const result = formatDeparture(departure);

      expect(result.line).toBe('4');
    });

    it('should handle missing line information gracefully', () => {
      const departure: SLDeparture = {
        destination: 'Gullmarsplan',
        expected: '2024-01-15T10:30:00',
      };

      const result = formatDeparture(departure);

      expect(result.line).toBe('');
    });

    it('should use line.name when designation is missing', () => {
      const departure: SLDeparture = {
        line: { name: 'Roslagsbanan', transport_mode: 'TRAIN' },
        destination: 'Kårsta',
        expected: '2024-01-15T10:30:00',
      };

      const result = formatDeparture(departure);

      expect(result.line).toBe('Train Roslagsbanan');
    });

    it('should handle missing transport_mode on line object', () => {
      const departure: SLDeparture = {
        line: { designation: '4' },
        destination: 'Gullmarsplan',
        expected: '2024-01-15T10:30:00',
      };

      const result = formatDeparture(departure);

      expect(result.line).toBe('4');
    });

    it('should return empty destination when both destination and direction are missing', () => {
      const departure: SLDeparture = {
        line: { designation: '4', transport_mode: 'BUS' },
        expected: '2024-01-15T10:30:00',
      };

      const result = formatDeparture(departure);

      expect(result.destination).toBe('');
    });

    it('should return empty departureTime when all time fields are missing', () => {
      const departure: SLDeparture = {
        line: { designation: '4', transport_mode: 'BUS' },
        destination: 'Gullmarsplan',
      };

      const result = formatDeparture(departure);

      expect(result.departureTime).toBe('');
    });
  });

  describe('formatDepartures', () => {
    it('should format multiple departures', () => {
      const departures: SLDeparture[] = [
        {
          line: { designation: '4', transport_mode: 'BUS' },
          destination: 'Gullmarsplan',
          expected: '2024-01-15T10:30:00',
        },
        {
          line: { designation: '1', transport_mode: 'METRO' },
          destination: 'Fruängen',
          expected: '2024-01-15T10:25:00',
        },
      ];

      const result = formatDepartures(departures);

      expect(result).toHaveLength(2);
      expect(result[0].line).toBe('4');
      expect(result[1].line).toBe('Metro 1');
    });

    it('should return empty array for empty input', () => {
      const result = formatDepartures([]);
      expect(result).toEqual([]);
    });
  });

  describe('sortDeparturesByTime', () => {
    it('should sort departures by departure time ascending', () => {
      const departures: FormattedDeparture[] = [
        {
          line: '55',
          destination: 'Slussen',
          departureTime: '2024-01-15T10:35:00',
          scheduled: '2024-01-15T10:35:00',
        },
        {
          line: 'Metro 1',
          destination: 'Fruängen',
          departureTime: '2024-01-15T10:25:00',
          scheduled: '2024-01-15T10:25:00',
        },
        {
          line: '4',
          destination: 'Gullmarsplan',
          departureTime: '2024-01-15T10:30:00',
          scheduled: '2024-01-15T10:30:00',
        },
      ];

      const result = sortDeparturesByTime(departures);

      expect(result[0].line).toBe('Metro 1');
      expect(result[1].line).toBe('4');
      expect(result[2].line).toBe('55');
    });

    it('should not mutate the original array', () => {
      const departures: FormattedDeparture[] = [
        {
          line: '55',
          destination: 'Slussen',
          departureTime: '2024-01-15T10:35:00',
          scheduled: '2024-01-15T10:35:00',
        },
        {
          line: '4',
          destination: 'Gullmarsplan',
          departureTime: '2024-01-15T10:25:00',
          scheduled: '2024-01-15T10:25:00',
        },
      ];

      const original = [...departures];
      sortDeparturesByTime(departures);

      expect(departures).toEqual(original);
    });

    it('should handle empty array', () => {
      const result = sortDeparturesByTime([]);
      expect(result).toEqual([]);
    });

    it('should handle single departure', () => {
      const departures: FormattedDeparture[] = [
        {
          line: '4',
          destination: 'Gullmarsplan',
          departureTime: '2024-01-15T10:30:00',
          scheduled: '2024-01-15T10:30:00',
        },
      ];

      const result = sortDeparturesByTime(departures);

      expect(result).toHaveLength(1);
      expect(result[0].line).toBe('4');
    });
  });
});
