import { SLSite, SLDeparturesResponse, SLDeparture } from '../../src/types/sl.types';

/**
 * Mock SL API site search responses
 */
export const mockSites: SLSite[] = [
  {
    id: 9001,
    name: 'T-Centralen',
    alias: ['Central Station', 'Stockholm Central'],
  },
  {
    id: 9002,
    name: 'Slussen',
    alias: ['Slussen Station'],
  },
  {
    id: 9003,
    name: 'Odenplan',
    alias: [],
  },
];

/**
 * Mock SL API departure
 */
export const mockDeparture: SLDeparture = {
  line: {
    designation: '4',
    name: 'Line 4',
    transport_mode: 'BUS',
  },
  destination: 'Gullmarsplan',
  direction: 'Gullmarsplan',
  expected: '2024-01-15T10:30:00',
  scheduled: '2024-01-15T10:30:00',
  display: '10:30',
};

/**
 * Mock SL API departures response
 */
export const mockDeparturesResponse: SLDeparturesResponse = {
  departures: [
    {
      line: {
        designation: '4',
        name: 'Line 4',
        transport_mode: 'BUS',
      },
      destination: 'Gullmarsplan',
      expected: '2024-01-15T10:30:00',
      scheduled: '2024-01-15T10:30:00',
      display: '10:30',
    },
    {
      line: {
        designation: '1',
        name: 'Line 1',
        transport_mode: 'METRO',
      },
      destination: 'Fruängen',
      expected: '2024-01-15T10:25:00',
      scheduled: '2024-01-15T10:25:00',
      display: '10:25',
    },
    {
      line: {
        designation: '55',
        name: 'Line 55',
        transport_mode: 'BUS',
      },
      destination: 'Slussen',
      expected: '2024-01-15T10:35:00',
      scheduled: '2024-01-15T10:35:00',
      display: '10:35',
    },
  ],
};

/**
 * Empty departures response
 */
export const mockEmptyDeparturesResponse: SLDeparturesResponse = {
  departures: [],
};

/**
 * Mock formatted bus stop data
 */
export const mockBusStopData = {
  stopName: 'T-Centralen',
  buses: [
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
    {
      line: '55',
      destination: 'Slussen',
      departureTime: '2024-01-15T10:35:00',
      scheduled: '2024-01-15T10:35:00',
    },
  ],
};
