import { groupByDestination } from '../../../src/utils/destinationGrouper';
import { BusStopDataGrouped } from '../../../src/types/bus.types';
import { DestinationGroup } from '../../../src/config/destinations';

function makeStops(
  line: string,
  destination: string,
  transportMode: string,
  count: number,
  startMinute = 1
): BusStopDataGrouped {
  const departures = Array.from({ length: count }, (_, i) => {
    const t = new Date(Date.now() + (startMinute + i) * 60000).toISOString();
    return { line, destination, departureTime: t, scheduled: t };
  });
  return {
    stopName: 'TestStop',
    groupedDepartures: [{ line, transportMode, destination, departures }],
  };
}

describe('groupByDestination', () => {
  it('defaults to a cap of 30 departures per group', () => {
    const stops = [makeStops('144', 'Gullmarsplan', 'BUS', 35)];
    const groups: DestinationGroup[] = [
      { displayName: 'To Gullmarsplan', routes: [{ line: '144', destination: 'Gullmarsplan' }] },
    ];

    const result = groupByDestination(stops, groups);

    expect(result[0].departures).toHaveLength(30);
  });

  it('merges departures from two lines and sorts by time', () => {
    const now = Date.now();
    const t = (min: number) => new Date(now + min * 60000).toISOString();

    const stops: BusStopDataGrouped[] = [
      {
        stopName: 'TestStop',
        groupedDepartures: [
          {
            line: '144',
            transportMode: 'BUS',
            destination: 'Gullmarsplan',
            departures: [
              { line: '144', destination: 'Gullmarsplan', departureTime: t(10), scheduled: t(10) },
              { line: '144', destination: 'Gullmarsplan', departureTime: t(20), scheduled: t(20) },
            ],
          },
          {
            line: 'Metro 19',
            transportMode: 'METRO',
            destination: 'Hässelby strand',
            departures: [
              { line: 'Metro 19', destination: 'Hässelby strand', departureTime: t(5), scheduled: t(5) },
              { line: 'Metro 19', destination: 'Hässelby strand', departureTime: t(15), scheduled: t(15) },
            ],
          },
        ],
      },
    ];
    const groups: DestinationGroup[] = [
      {
        displayName: 'To Gullmarsplan',
        routes: [
          { line: '144', destination: 'Gullmarsplan' },
          { line: 'Metro 19', destination: 'Hässelby strand' },
        ],
      },
    ];

    const result = groupByDestination(stops, groups);

    expect(result[0].departures).toHaveLength(4);
    expect(result[0].departures[0].line).toBe('Metro 19'); // 5 min — earliest
    expect(result[0].departures[1].line).toBe('144');      // 10 min
    expect(result[0].departures[2].line).toBe('Metro 19'); // 15 min
    expect(result[0].departures[3].line).toBe('144');      // 20 min
  });

  it('respects a custom cap passed explicitly', () => {
    const stops = [makeStops('144', 'Gullmarsplan', 'BUS', 10)];
    const groups: DestinationGroup[] = [
      { displayName: 'To Gullmarsplan', routes: [{ line: '144', destination: 'Gullmarsplan' }] },
    ];

    const result = groupByDestination(stops, groups, 5);

    expect(result[0].departures).toHaveLength(5);
  });

  it('returns all departures when count is below cap', () => {
    const stops = [makeStops('144', 'Gullmarsplan', 'BUS', 3)];
    const groups: DestinationGroup[] = [
      { displayName: 'To Gullmarsplan', routes: [{ line: '144', destination: 'Gullmarsplan' }] },
    ];

    const result = groupByDestination(stops, groups);

    expect(result[0].departures).toHaveLength(3);
  });
});
