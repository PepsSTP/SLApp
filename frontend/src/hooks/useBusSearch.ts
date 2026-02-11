import { useState } from 'react';
import busService from '../services/busService';
import { BusStopData } from '../types/bus.types';

/**
 * Custom hook for bus stop search functionality
 * Encapsulates all business logic related to searching for bus departures
 */
export function useBusSearch() {
  const [busStopName, setBusStopName] = useState('');
  const [busData, setBusData] = useState<BusStopData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Search for bus stop by name
   */
  const searchBusStop = async (stopName: string) => {
    if (!stopName.trim()) {
      setError('Please enter a bus stop name');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await busService.getBusStopData(stopName);
      setBusData(data);
    } catch (err) {
      console.error('Error fetching buses:', err);
      const errorMessage = busService.parseError(err, stopName);
      setError(errorMessage);
      setBusData(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await searchBusStop(busStopName);
  };

  /**
   * Clear error message
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Reset all state
   */
  const reset = () => {
    setBusStopName('');
    setBusData(null);
    setError(null);
    setLoading(false);
  };

  return {
    // State
    busStopName,
    busData,
    loading,
    error,

    // Actions
    setBusStopName,
    searchBusStop,
    handleSubmit,
    clearError,
    reset
  };
}
