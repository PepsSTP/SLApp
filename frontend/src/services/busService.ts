import axios, { AxiosError } from 'axios';
import { BusStopData, ApiErrorResponse } from '../types/bus.types';

/**
 * Bus API Service
 * Handles all HTTP requests related to bus information
 */
class BusService {
  /**
   * Fetch bus stop data by stop name
   */
  async getBusStopData(stopName: string): Promise<BusStopData> {
    const response = await axios.get<BusStopData>(
      `/api/buses/${encodeURIComponent(stopName)}`
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
