import axios, { AxiosError } from 'axios';
import { BusStopData, ApiErrorResponse, BusStopDataGrouped, JourneyResponse } from '../types/bus.types';

/**
 * Bus API Service
 * Handles all HTTP requests related to bus information
 */
const rawBase = import.meta.env.VITE_API_BASE_URL ?? '';
const API_BASE = rawBase && !rawBase.startsWith('http') ? `https://${rawBase}` : rawBase;

class BusService {
  /**
   * Fetch bus stop data by stop name
   */
  async getBusStopData(stopName: string): Promise<BusStopData> {
    const response = await axios.get<BusStopData>(
      `${API_BASE}/api/buses/${encodeURIComponent(stopName)}`
    );
    return response.data;
  }

  /**
   * Fetch bus stop data with departures grouped by line
   */
  async getBusStopDataGrouped(stopName: string): Promise<BusStopDataGrouped> {
    const response = await axios.get<BusStopDataGrouped>(
      `${API_BASE}/api/buses/${encodeURIComponent(stopName)}/grouped`
    );
    return response.data;
  }

  /**
   * Fetch multiple bus stops in parallel with grouped departures
   */
  async getMultipleStops(stopNames: string[]): Promise<BusStopDataGrouped[]> {
    const promises = stopNames.map(name => this.getBusStopDataGrouped(name));
    return Promise.all(promises);
  }

  /**
   * Fetch journeys from origin to destination, filtered by lines.
   * Optionally pass `after` (ISO timestamp) to fetch departures after a given time.
   */
  async getJourneys(
    origin: string,
    destination: string,
    lines: string[],
    after?: string
  ): Promise<JourneyResponse> {
    const params: Record<string, string> = {
      origin,
      destination,
      lines: lines.join(','),
    };
    if (after) {
      params.after = after;
    }
    const response = await axios.get<JourneyResponse>(
      `${API_BASE}/api/journeys`,
      { params }
    );
    return response.data;
  }

  /**
   * Parse error response and return user-friendly message
   */
  parseError(error: unknown, stopName: string): string {
    if (!axios.isAxiosError(error)) {
      return 'Network error. Please check your connection and try again.';
    }

    const axiosError = error as AxiosError<ApiErrorResponse>;
    const status = axiosError.response?.status;
    const errorData = axiosError.response?.data;

    // Handle specific HTTP status codes
    if (status === 404) {
      return `Bus stop "${stopName}" not found. Please check the spelling and try a different name.`;
    }

    if (status === 502 || status === 503) {
      return 'The SL API is currently unavailable. Please try again later.';
    }

    if (status === 500) {
      return 'Server error while fetching bus information. Please try again.';
    }

    // Use error message from API if available
    if (errorData?.message) {
      return `Failed to fetch bus information: ${errorData.message}`;
    }

    // Fallback to axios error message
    return `Failed to fetch bus information: ${axiosError.message}`;
  }
}

// Export singleton instance
export default new BusService();
