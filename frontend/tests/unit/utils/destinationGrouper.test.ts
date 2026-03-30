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
  const departures = Array.from({ length: count }, (_, i) => {
    const t = new Date(Date.now() + (startMinute + i) * 60000).toISOString();
    return { line, transportMode, destination, departureTime: t, scheduled: t };
  });
  return { origin, destination, departures };
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
      departures: [
        { line: '144', transportMode: 'BUS', destination: 'Fruängen', departureTime: t(10), scheduled: t(10) },
        { line: '144', transportMode: 'BUS', destination: 'Fruängen', departureTime: t(20), scheduled: t(20) },
      ],
    });
    journeysByPair.set(pairKey('Bandhagen', 'Gullmarsplan'), {
      origin: 'Bandhagen',
      destination: 'Gullmarsplan',
      departures: [
        { line: '19', transportMode: 'METRO', destination: 'Hässelby strand', departureTime: t(5), scheduled: t(5) },
        { line: '19', transportMode: 'METRO', destination: 'Hässelby strand', departureTime: t(15), scheduled: t(15) },
      ],
    });

    const groups: DestinationGroup[] = [
      {
        displayName: 'To Gullmarsplan',
        routes: [
          { line: '144', originStop: 'Juliaborg', destinationStop: 'Gullmarsplan' },
          { line: '19', originStop: 'Bandhagen', destinationStop: 'Gullmarsplan' },
        ],
      },
    ];

    const result = groupByDestination(journeysByPair, groups);

    expect(result[0].departures).toHaveLength(4);
    expect(result[0].departures[0].line).toBe('19'); // 5 min — earliest
    expect(result[0].departures[1].line).toBe('144');      // 10 min
    expect(result[0].departures[2].line).toBe('19'); // 15 min
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

  it('handles missing pair in journeysByPair gracefully', () => {
    const journeysByPair = new Map<string, JourneyResponse>();
    // Deliberately empty — no data for the pair

    const groups: DestinationGroup[] = [
      {
        displayName: 'To Gullmarsplan',
        routes: [{ line: '144', originStop: 'Juliaborg', destinationStop: 'Gullmarsplan' }],
      },
    ];

    const result = groupByDestination(journeysByPair, groups);

    expect(result[0].departures).toHaveLength(0);
  });

  it('falls back to departureTime when scheduled is absent', () => {
    const now = Date.now();
    const t = (min: number) => new Date(now + min * 60000).toISOString();
    const key = pairKey('Juliaborg', 'Gullmarsplan');

    const journeysByPair = new Map<string, JourneyResponse>();
    journeysByPair.set(key, {
      origin: 'Juliaborg',
      destination: 'Gullmarsplan',
      departures: [
        {
          line: '144',
          transportMode: 'BUS',
          destination: 'Fruängen',
          departureTime: t(5),
          scheduled: undefined as unknown as string,
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

    expect(result[0].departures[0].scheduled).toBe(result[0].departures[0].departureTime);
  });

  it('merges multiple lines for the same origin+destination pair', () => {
    const now = Date.now();
    const t = (min: number) => new Date(now + min * 60000).toISOString();
    const key = pairKey('Juliaborg', 'Älvsjö station');

    const journeysByPair = new Map<string, JourneyResponse>();
    journeysByPair.set(key, {
      origin: 'Juliaborg',
      destination: 'Älvsjö station',
      departures: [
        { line: '144', transportMode: 'BUS', destination: 'Älvsjö station', departureTime: t(5), scheduled: t(5) },
        { line: '163', transportMode: 'BUS', destination: 'Kärrtorp', departureTime: t(8), scheduled: t(8) },
      ],
    });

    const groups: DestinationGroup[] = [
      {
        displayName: 'To Älvsjö Station',
        routes: [
          { line: '144', originStop: 'Juliaborg', destinationStop: 'Älvsjö station' },
          { line: '163', originStop: 'Juliaborg', destinationStop: 'Älvsjö station' },
        ],
      },
    ];

    const result = groupByDestination(journeysByPair, groups);

    expect(result[0].departures).toHaveLength(2);
    expect(result[0].departures[0].line).toBe('144');
    expect(result[0].departures[1].line).toBe('163');
  });

  it('only includes lines matching the route config', () => {
    const key = pairKey('Juliaborg', 'Gullmarsplan');
    const now = Date.now();
    const t = (min: number) => new Date(now + min * 60000).toISOString();

    const journeysByPair = new Map<string, JourneyResponse>();
    journeysByPair.set(key, {
      origin: 'Juliaborg',
      destination: 'Gullmarsplan',
      departures: [
        { line: '144', transportMode: 'BUS', destination: 'Fruängen', departureTime: t(5), scheduled: t(5) },
        { line: '999', transportMode: 'BUS', destination: 'Somewhere', departureTime: t(3), scheduled: t(3) },
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
