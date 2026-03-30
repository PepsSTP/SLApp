import { groupByDestination, pairKey } from '../../../src/utils/destinationGrouper';
import { JourneyResponse } from '../../../src/types/bus.types';
import { DestinationGroup } from '../../../src/config/destinations';

function makeJourneys(
  origin: string,
  destination: string,
  line: string,
  transportMode: string,
  count: number,
  startMinute = 1
): JourneyResponse {
  const journeys = Array.from({ length: count }, (_, i) => {
    const t = new Date(Date.now() + (startMinute + i) * 60000).toISOString();
    return {
      line,
      transportMode,
      origin,
      destination,
      departureTime: t,
      arrivalTime: t,
      scheduledDepartureTime: t,
      scheduledArrivalTime: t,
    };
  });
  return { origin, destination, journeys };
}

describe('groupByDestination', () => {
  it('defaults to a cap of 30 departures per group', () => {
    const key = pairKey('Juliaborg', 'Gullmarsplan');
    const journeysByPair = new Map<string, JourneyResponse>();
    journeysByPair.set(key, makeJourneys('Juliaborg', 'Gullmarsplan', '144', 'BUS', 35));

    const groups: DestinationGroup[] = [
      {
        displayName: 'To Gullmarsplan',
        routes: [{ line: '144', originStop: 'Juliaborg', destinationStop: 'Gullmarsplan' }],
      },
    ];

    const result = groupByDestination(journeysByPair, groups);

    expect(result[0].departures).toHaveLength(30);
  });

  it('merges departures from two lines and sorts by time', () => {
    const now = Date.now();
    const t = (min: number) => new Date(now + min * 60000).toISOString();

    const journeysByPair = new Map<string, JourneyResponse>();
    journeysByPair.set(pairKey('Juliaborg', 'Gullmarsplan'), {
      origin: 'Juliaborg',
      destination: 'Gullmarsplan',
      journeys: [
        {
          line: '144', transportMode: 'BUS', origin: 'Juliaborg', destination: 'Gullmarsplan',
          departureTime: t(10), arrivalTime: t(20), scheduledDepartureTime: t(10), scheduledArrivalTime: t(20),
        },
        {
          line: '144', transportMode: 'BUS', origin: 'Juliaborg', destination: 'Gullmarsplan',
          departureTime: t(20), arrivalTime: t(30), scheduledDepartureTime: t(20), scheduledArrivalTime: t(30),
        },
      ],
    });
    journeysByPair.set(pairKey('Bandhagen', 'Gullmarsplan'), {
      origin: 'Bandhagen',
      destination: 'Gullmarsplan',
      journeys: [
        {
          line: 'Metro 19', transportMode: 'METRO', origin: 'Bandhagen', destination: 'Gullmarsplan',
          departureTime: t(5), arrivalTime: t(12), scheduledDepartureTime: t(5), scheduledArrivalTime: t(12),
        },
        {
          line: 'Metro 19', transportMode: 'METRO', origin: 'Bandhagen', destination: 'Gullmarsplan',
          departureTime: t(15), arrivalTime: t(22), scheduledDepartureTime: t(15), scheduledArrivalTime: t(22),
        },
      ],
    });

    const groups: DestinationGroup[] = [
      {
        displayName: 'To Gullmarsplan',
        routes: [
          { line: '144', originStop: 'Juliaborg', destinationStop: 'Gullmarsplan' },
          { line: 'Metro 19', originStop: 'Bandhagen', destinationStop: 'Gullmarsplan' },
        ],
      },
    ];

    const result = groupByDestination(journeysByPair, groups);

    expect(result[0].departures).toHaveLength(4);
    expect(result[0].departures[0].line).toBe('Metro 19'); // 5 min — earliest
    expect(result[0].departures[1].line).toBe('144');      // 10 min
    expect(result[0].departures[2].line).toBe('Metro 19'); // 15 min
    expect(result[0].departures[3].line).toBe('144');      // 20 min
  });

  it('respects a custom cap passed explicitly', () => {
    const key = pairKey('Juliaborg', 'Gullmarsplan');
    const journeysByPair = new Map<string, JourneyResponse>();
    journeysByPair.set(key, makeJourneys('Juliaborg', 'Gullmarsplan', '144', 'BUS', 10));

    const groups: DestinationGroup[] = [
      {
        displayName: 'To Gullmarsplan',
        routes: [{ line: '144', originStop: 'Juliaborg', destinationStop: 'Gullmarsplan' }],
      },
    ];

    const result = groupByDestination(journeysByPair, groups, 5);

    expect(result[0].departures).toHaveLength(5);
  });

  it('returns all departures when count is below cap', () => {
    const key = pairKey('Juliaborg', 'Gullmarsplan');
    const journeysByPair = new Map<string, JourneyResponse>();
    journeysByPair.set(key, makeJourneys('Juliaborg', 'Gullmarsplan', '144', 'BUS', 3));

    const groups: DestinationGroup[] = [
      {
        displayName: 'To Gullmarsplan',
        routes: [{ line: '144', originStop: 'Juliaborg', destinationStop: 'Gullmarsplan' }],
      },
    ];

    const result = groupByDestination(journeysByPair, groups);

    expect(result[0].departures).toHaveLength(3);
  });

  it('only includes lines matching the route config', () => {
    const key = pairKey('Juliaborg', 'Gullmarsplan');
    const now = Date.now();
    const t = (min: number) => new Date(now + min * 60000).toISOString();

    const journeysByPair = new Map<string, JourneyResponse>();
    journeysByPair.set(key, {
      origin: 'Juliaborg',
      destination: 'Gullmarsplan',
      journeys: [
        {
          line: '144', transportMode: 'BUS', origin: 'Juliaborg', destination: 'Gullmarsplan',
          departureTime: t(5), arrivalTime: t(15), scheduledDepartureTime: t(5), scheduledArrivalTime: t(15),
        },
        {
          line: '999', transportMode: 'BUS', origin: 'Juliaborg', destination: 'Gullmarsplan',
          departureTime: t(3), arrivalTime: t(13), scheduledDepartureTime: t(3), scheduledArrivalTime: t(13),
        },
      ],
    });

    const groups: DestinationGroup[] = [
      {
        displayName: 'To Gullmarsplan',
        routes: [{ line: '144', originStop: 'Juliaborg', destinationStop: 'Gullmarsplan' }],
      },
    ];

    const result = groupByDestination(journeysByPair, groups);

    expect(result[0].departures).toHaveLength(1);
    expect(result[0].departures[0].line).toBe('144');
  });
});
