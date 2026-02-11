import { Bus, BusStopData } from '../../src/types/bus.types';

/**
 * Mock bus departures
 */
export const mockBuses: Bus[] = [
  {
    line: 'Metro 1',
    destination: 'Fruängen',
    departureTime: '2024-01-15T10:25:00',
  },
  {
    line: '4',
    destination: 'Gullmarsplan',
    departureTime: '2024-01-15T10:30:00',
  },
  {
    line: '55',
    destination: 'Slussen',
    departureTime: '2024-01-15T10:35:00',
  },
];

/**
 * Mock bus stop data
 */
export const mockBusStopData: BusStopData = {
  stopName: 'T-Centralen',
  buses: mockBuses,
};

/**
 * Empty bus stop data
 */
export const emptyBusStopData: BusStopData = {
  stopName: 'Empty Station',
  buses: [],
};

/**
 * Mock API error response
 */
export const mockApiError = {
  error: 'Not Found',
  message: 'Bus stop "Unknown" not found',
};

/**
 * Mock API error for unavailable service
 */
export const mockServiceUnavailableError = {
  error: 'SL API Error',
  message: 'The SL API is currently unavailable',
};
