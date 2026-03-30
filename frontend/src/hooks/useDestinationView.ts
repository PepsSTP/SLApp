import { useState, useEffect, useCallback, useRef } from 'react';
import busService from '../services/busService';
import { JourneyDeparture } from '../types/bus.types';
import { mergeJourneys, DestinationGroupResult } from '../utils/destinationGrouper';
import {
  DestinationGroup,
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
 * For a destination group, groups routes by unique origin+destination pair,
 * then fetches journeys for each pair (combining lines that share the same pair).
 * Returns all journey departures merged together.
 */
async function fetchGroupJourneys(
  group: DestinationGroup,
  after?: string
): Promise<{ journeys: JourneyDeparture[]; errors: string[] }> {
  // Group routes by origin+destination pair
  const pairMap = new Map<string, string[]>();
  for (const route of group.routes) {
    const key = `${route.originStop}|||${route.destinationStop}`;
    const lines = pairMap.get(key) ?? [];
    lines.push(route.line);
    pairMap.set(key, lines);
  }

  // Fetch journeys for each unique pair
  const results = await Promise.allSettled(
    Array.from(pairMap.entries()).map(([key, lines]) => {
      const [origin, destination] = key.split('|||');
      return busService.getJourneys(origin, destination, lines, after);
    })
  );

  const journeys: JourneyDeparture[] = [];
  const errors: string[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      journeys.push(...result.value.journeys);
    } else {
      errors.push(result.reason?.message || 'Failed to load journeys');
    }
  }

  return { journeys, errors };
}

/**
 * Fetches all destination groups for a view (from-home or to-home).
 */
async function fetchAllGroups(
  destinationGroups: DestinationGroup[]
): Promise<{
  groups: DestinationGroupResult[];
  errors: { [key: string]: string };
}> {
  const results = await Promise.all(
    destinationGroups.map(async (group) => {
      const { journeys, errors } = await fetchGroupJourneys(group);
      return { group, journeys, errors };
    })
  );

  const groups: DestinationGroupResult[] = [];
  const errors: { [key: string]: string } = {};

  for (const { group, journeys, errors: groupErrors } of results) {
    groups.push(mergeJourneys(group.displayName, journeys));
    if (groupErrors.length > 0) {
      errors[group.displayName] = groupErrors.join('; ');
    }
  }

  return { groups, errors };
}

/**
 * Fetches all home and return destination groups in parallel, then derives both views.
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
   * Loads all destination groups for both views simultaneously.
   */
  const loadAllData = useCallback(async () => {
    const [fromHomeResult, toHomeResult] = await Promise.all([
      fetchAllGroups(FROM_HOME_DESTINATIONS),
      fetchAllGroups(TO_HOME_DESTINATIONS)
    ]);

    setFromHomeGroups(fromHomeResult.groups);
    setFromHomeErrors(fromHomeResult.errors);

    setToHomeGroups(toHomeResult.groups);
    setToHomeErrors(toHomeResult.errors);

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
