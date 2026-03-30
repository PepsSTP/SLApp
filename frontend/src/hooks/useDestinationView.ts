import { useState, useEffect, useCallback, useRef } from 'react';
import busService from '../services/busService';
import { JourneyResponse } from '../types/bus.types';
import { groupByDestination, DestinationGroupResult, pairKey } from '../utils/destinationGrouper';
import {
  FROM_HOME_DESTINATIONS,
  TO_HOME_DESTINATIONS,
  DestinationGroup,
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
  loadMore: (groupIndex: number) => void;
}

/**
 * Builds a map of unique origin+destination pairs → list of lines
 * from a set of destination groups.
 */
function collectPairs(groups: DestinationGroup[]): Map<string, string[]> {
  const pairLines = new Map<string, string[]>();
  for (const group of groups) {
    for (const route of group.routes) {
      const key = pairKey(route.originStop, route.destinationStop);
      if (!pairLines.has(key)) {
        pairLines.set(key, []);
      }
      const lines = pairLines.get(key)!;
      if (!lines.includes(route.line)) {
        lines.push(route.line);
      }
    }
  }
  return pairLines;
}

/**
 * Fetches journey data for all unique origin+destination pairs.
 * Groups all lines for the same pair into a single request.
 */
async function fetchJourneys(
  groups: DestinationGroup[],
  after?: string
): Promise<{
  journeysByPair: Map<string, JourneyResponse>;
  errors: { [key: string]: string };
}> {
  const pairLines = collectPairs(groups);
  const journeysByPair = new Map<string, JourneyResponse>();
  const errors: { [key: string]: string } = {};

  const entries = Array.from(pairLines.entries());
  const results = await Promise.allSettled(
    entries.map(([key, lines]) => {
      const [origin, destination] = key.split('|||');
      return busService.getJourneys(origin, destination, lines.join(','), after);
    })
  );

  results.forEach((result, index) => {
    const key = entries[index][0];
    if (result.status === 'fulfilled') {
      journeysByPair.set(key, result.value);
    } else {
      const [origin, destination] = key.split('|||');
      errors[`${origin} → ${destination}`] = result.reason?.message || 'Failed to load';
    }
  });

  return { journeysByPair, errors };
}

/**
 * Fetches all home and return journeys in parallel, then derives both views.
 * Switching between views is instant since both are cached.
 */
export function useDestinationView(): UseDestinationViewResult {
  const [currentView, setCurrentView] = useState<ViewType>('from-home');

  const [fromHomeGroups, setFromHomeGroups] = useState<DestinationGroupResult[]>([]);
  const [toHomeGroups, setToHomeGroups] = useState<DestinationGroupResult[]>([]);
  const [fromHomeErrors, setFromHomeErrors] = useState<{ [key: string]: string }>({});
  const [toHomeErrors, setToHomeErrors] = useState<{ [key: string]: string }>({});

  // Store raw journey data for "load more" requests
  const fromHomeJourneys = useRef<Map<string, JourneyResponse>>(new Map());
  const toHomeJourneys = useRef<Map<string, JourneyResponse>>(new Map());

  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<number | null>(null);

  /**
   * Loads all journeys for both views simultaneously, then updates cached state.
   * Both views refresh together so no delay on switch.
   */
  const loadAllData = useCallback(async () => {
    const [homeResult, returnResult] = await Promise.all([
      fetchJourneys(FROM_HOME_DESTINATIONS),
      fetchJourneys(TO_HOME_DESTINATIONS),
    ]);

    fromHomeJourneys.current = homeResult.journeysByPair;
    toHomeJourneys.current = returnResult.journeysByPair;

    setFromHomeGroups(groupByDestination(homeResult.journeysByPair, FROM_HOME_DESTINATIONS));
    setFromHomeErrors(homeResult.errors);

    setToHomeGroups(groupByDestination(returnResult.journeysByPair, TO_HOME_DESTINATIONS));
    setToHomeErrors(returnResult.errors);

    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    loadAllData();
  }, [loadAllData]);

  /**
   * Load more departures for a specific destination group.
   * Fetches journeys departing after the last visible departure time.
   */
  const loadMore = useCallback(async (groupIndex: number) => {
    const isFromHome = currentView === 'from-home';
    const groups = isFromHome ? fromHomeGroups : toHomeGroups;
    const config = isFromHome ? FROM_HOME_DESTINATIONS : TO_HOME_DESTINATIONS;
    const journeysRef = isFromHome ? fromHomeJourneys : toHomeJourneys;

    const group = groups[groupIndex];
    if (!group || group.departures.length === 0) return;

    // Find the last departure time in the current group
    const lastDeparture = group.departures[group.departures.length - 1];
    const after = lastDeparture.departureTime;

    // Fetch more journeys for the pairs used by this group
    const groupConfig = config[groupIndex];
    const { journeysByPair: morePairs } = await fetchJourneys([groupConfig], after);

    // Merge new journeys into the existing map
    for (const [key, response] of morePairs) {
      const existing = journeysRef.current.get(key);
      if (existing) {
        // Append new journeys, deduplicating by departure time + line
        const existingKeys = new Set(
          existing.journeys.map(j => `${j.line}|${j.departureTime}`)
        );
        const newJourneys = response.journeys.filter(
          j => !existingKeys.has(`${j.line}|${j.departureTime}`)
        );
        journeysRef.current.set(key, {
          ...existing,
          journeys: [...existing.journeys, ...newJourneys],
        });
      } else {
        journeysRef.current.set(key, response);
      }
    }

    // Re-derive groups with increased cap
    const currentDepartureCount = group.departures.length;
    const newCap = currentDepartureCount + 30;
    const allGroups = groupByDestination(journeysRef.current, config, newCap);

    if (isFromHome) {
      setFromHomeGroups(allGroups);
    } else {
      setToHomeGroups(allGroups);
    }
  }, [currentView, fromHomeGroups, toHomeGroups]);

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
    loadMore,
  };
}
