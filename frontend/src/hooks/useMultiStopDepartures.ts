import { useState, useEffect, useCallback, useRef } from 'react';
import busService from '../services/busService';
import { BusStopDataGrouped } from '../types/bus.types';

/**
 * Hook for fetching and managing departure data for multiple stops
 * @param stopNames - Array of stop names to fetch
 * @returns Object containing stops data, loading state, errors, and refresh function
 */
export function useMultiStopDepartures(stopNames: string[]) {
  const [stops, setStops] = useState<BusStopDataGrouped[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Use ref to store interval ID for cleanup
  const intervalRef = useRef<number | null>(null);

  /**
   * Fetch departures for all stops
   * Handles per-station errors gracefully
   */
  const loadDepartures = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all stops in parallel
      const results = await Promise.allSettled(
        stopNames.map(name => busService.getBusStopDataGrouped(name))
      );

      // Process results and separate successful fetches from errors
      const successfulStops: BusStopDataGrouped[] = [];
      const newErrors: { [key: string]: string } = {};

      results.forEach((result, index) => {
        const stopName = stopNames[index];

        if (result.status === 'fulfilled') {
          successfulStops.push(result.value);
        } else {
          // Parse error for this specific stop
          newErrors[stopName] = busService.parseError(result.reason, stopName);
        }
      });

      setStops(successfulStops);
      setErrors(newErrors);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading departures:', error);
      // Set a general error for all stops if the entire operation fails
      const generalError: { [key: string]: string } = {};
      stopNames.forEach(name => {
        generalError[name] = 'Failed to load departures. Please try again.';
      });
      setErrors(generalError);
    } finally {
      setLoading(false);
    }
  }, [stopNames]);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(async () => {
    await loadDepartures();
  }, [loadDepartures]);

  // Auto-load on mount and when stopNames change
  useEffect(() => {
    loadDepartures();
  }, [loadDepartures]);

  // Set up auto-refresh every 30 seconds
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      loadDepartures();
    }, 30000); // 30 seconds

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadDepartures]);

  return {
    stops,
    loading,
    errors,
    lastUpdated,
    refresh
  };
}
