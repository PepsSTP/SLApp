import { mergeJourneys } from '../../../src/utils/destinationGrouper';
import { JourneyDeparture } from '../../../src/types/bus.types';

function makeJourney(
  line: string,
  origin: string,
  destination: string,
  transportMode: string,
  minutesFromNow: number
): JourneyDeparture {
  const t = new Date(Date.now() + minutesFromNow * 60000).toISOString();
  return {
    line,
    transportMode,
    origin,
    destination,
    departureTime: t,
    arrivalTime: new Date(Date.now() + (minutesFromNow + 10) * 60000).toISOString(),
    scheduled: t,
  };
}

describe('mergeJourneys', () => {
  it('defaults to a cap of 30 departures', () => {
    const journeys = Array.from({ length: 35 }, (_, i) =>
      makeJourney('144', 'Juliaborg', 'Gullmarsplan', 'BUS', i + 1)
    );

    const result = mergeJourneys('To Gullmarsplan', journeys);

    expect(result.departures).toHaveLength(30);
  });

  it('merges departures from two lines and sorts by time', () => {
    const journeys: JourneyDeparture[] = [
      makeJourney('144', 'Juliaborg', 'Gullmarsplan', 'BUS', 10),
      makeJourney('144', 'Juliaborg', 'Gullmarsplan', 'BUS', 20),
      makeJourney('Metro 19', 'Bandhagen', 'Gullmarsplan', 'METRO', 5),
      makeJourney('Metro 19', 'Bandhagen', 'Gullmarsplan', 'METRO', 15),
    ];

    const result = mergeJourneys('To Gullmarsplan', journeys);

    expect(result.departures).toHaveLength(4);
    expect(result.departures[0].line).toBe('Metro 19'); // 5 min — earliest
    expect(result.departures[1].line).toBe('144');      // 10 min
    expect(result.departures[2].line).toBe('Metro 19'); // 15 min
    expect(result.departures[3].line).toBe('144');      // 20 min
  });

  it('respects a custom cap passed explicitly', () => {
    const journeys = Array.from({ length: 10 }, (_, i) =>
      makeJourney('144', 'Juliaborg', 'Gullmarsplan', 'BUS', i + 1)
    );

    const result = mergeJourneys('To Gullmarsplan', journeys, 5);

    expect(result.departures).toHaveLength(5);
  });

  it('returns all departures when count is below cap', () => {
    const journeys = Array.from({ length: 3 }, (_, i) =>
      makeJourney('144', 'Juliaborg', 'Gullmarsplan', 'BUS', i + 1)
    );

    const result = mergeJourneys('To Gullmarsplan', journeys);

    expect(result.departures).toHaveLength(3);
  });

  it('sets displayName from parameter', () => {
    const journeys = [makeJourney('144', 'Juliaborg', 'Gullmarsplan', 'BUS', 5)];

    const result = mergeJourneys('To Gullmarsplan', journeys);

    expect(result.displayName).toBe('To Gullmarsplan');
  });

  it('maps origin to originStop in merged departures', () => {
    const journeys = [makeJourney('144', 'Juliaborg', 'Gullmarsplan', 'BUS', 5)];

    const result = mergeJourneys('To Gullmarsplan', journeys);

    expect(result.departures[0].originStop).toBe('Juliaborg');
    expect(result.departures[0].destination).toBe('Gullmarsplan');
    expect(result.departures[0].transportMode).toBe('BUS');
  });

  it('returns empty departures when given no journeys', () => {
    const result = mergeJourneys('To Gullmarsplan', []);

    expect(result.departures).toHaveLength(0);
    expect(result.displayName).toBe('To Gullmarsplan');
  });
});
