import { useState, useEffect, useCallback, useRef } from 'react';
import busService from '../services/busService';
import { BusStopDataGrouped } from '../types/bus.types';
import { groupByDestination, DestinationGroupResult } from '../utils/destinationGrouper';
import {
  HOME_STOPS,
  RETURN_STOPS,
  FROM_HOME_DESTINATIONS,
  TO_HOME_DESTINATIONS
} from '../config/destinations';
import { ViewType } from '../components/ViewToggle';

interface UseDestinationViewResult {
  destinationGroups: DestinationGroupResult[];
  loading: boolean;
  errors: { [key: string]: string };
  lastUpdated: Date | null;
  currentView: ViewType;
  setView: (view: ViewType) => void;
  refresh: () => void;
}

/**
 * Fetches a list of stops, returning a map of stopName → data and an errors map.
 * Uses the API-returned stopName as the key (may differ slightly from search term).
 */
async function fetchStops(stopNames: string[]): Promise<{
  stops: BusStopDataGrouped[];
  errors: { [key: string]: string };
}> {
  const results = await Promise.allSettled(
    stopNames.map(name => busService.getBusStopDataGrouped(name))
  );
  const stops: BusStopDataGrouped[] = [];
  const errors: { [key: string]: string } = {};
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      stops.push(result.value);
    } else {
      errors[stopNames[index]] = result.reason?.message || 'Failed to load';
    }
  });
  return { stops, errors };
}

/**
 * Fetches all home and return stops in parallel, then derives both views.
 * Switching between views is instant since both are cached.
 */
export function useDestinationView(): UseDestinationViewResult {
  const [currentView, setCurrentView] = useState<ViewType>('from-home');

  const [fromHomeGroups, setFromHomeGroups] = useState<DestinationGroupResult[]>([]);
  const [toHomeGroups, setToHomeGroups] = useState<DestinationGroupResult[]>([]);
  const [fromHomeErrors, setFromHomeErrors] = useState<{ [key: string]: string }>({});
  const [toHomeErrors, setToHomeErrors] = useState<{ [key: string]: string }>({});

  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<number | null>(null);

  /**
   * Loads all stops for both views simultaneously, then updates cached state.
   * Both views refresh together so no delay on switch.
   */
  const loadAllData = useCallback(async () => {
    const [homeResult, returnResult] = await Promise.all([
      fetchStops(HOME_STOPS),
      fetchStops(RETURN_STOPS)
    ]);

    setFromHomeGroups(groupByDestination(homeResult.stops, FROM_HOME_DESTINATIONS));
    setFromHomeErrors(homeResult.errors);

    setToHomeGroups(groupByDestination(returnResult.stops, TO_HOME_DESTINATIONS));
    setToHomeErrors(returnResult.errors);

    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    loadAllData();
  }, [loadAllData]);

  /** View switch is instant — no loading, just swap cached data. */
  const setView = useCallback((view: ViewType) => {
    setCurrentView(view);
  }, []);

  useEffect(() => {
    loadAllData();

    intervalRef.current = setInterval(loadAllData, 30000) as unknown as number;

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadAllData]);

  return {
    destinationGroups: currentView === 'from-home' ? fromHomeGroups : toHomeGroups,
    errors: currentView === 'from-home' ? fromHomeErrors : toHomeErrors,
    loading,
    lastUpdated,
    currentView,
    setView,
    refresh,
  };
}
