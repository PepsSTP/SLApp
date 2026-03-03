import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mocked } from 'vitest';
import type { FormEvent } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBusSearch } from '../../../src/hooks/useBusSearch';
import busService from '../../../src/services/busService';
import { mockBusStopData } from '../../fixtures/mockBusData';
import type { BusStopData } from '../../../src/types/bus.types';

// Mock busService
vi.mock('../../../src/services/busService');
const mockedBusService = busService as Mocked<typeof busService>;

describe('useBusSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useBusSearch());

    expect(result.current.busStopName).toBe('');
    expect(result.current.busData).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  describe('setBusStopName', () => {
    it('should update busStopName', () => {
      const { result } = renderHook(() => useBusSearch());

      act(() => {
        result.current.setBusStopName('T-Centralen');
      });

      expect(result.current.busStopName).toBe('T-Centralen');
    });
  });

  describe('searchBusStop', () => {
    it('should set error when searching with empty string', async () => {
      const { result } = renderHook(() => useBusSearch());

      await act(async () => {
        await result.current.searchBusStop('');
      });

      expect(result.current.error).toBe('Please enter a bus stop name');
      expect(result.current.busData).toBeNull();
    });

    it('should set error when searching with whitespace only', async () => {
      const { result } = renderHook(() => useBusSearch());

      await act(async () => {
        await result.current.searchBusStop('   ');
      });

      expect(result.current.error).toBe('Please enter a bus stop name');
    });

    it('should successfully search for a bus stop', async () => {
      mockedBusService.getBusStopData.mockResolvedValue(mockBusStopData);

      const { result } = renderHook(() => useBusSearch());

      await act(async () => {
        await result.current.searchBusStop('T-Centralen');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.busData).toEqual(mockBusStopData);
      expect(result.current.error).toBeNull();
      expect(mockedBusService.getBusStopData).toHaveBeenCalledWith('T-Centralen');
    });

    it('should set loading state during search', async () => {
      let resolveSearch: (value: BusStopData) => void;
      const searchPromise = new Promise<BusStopData>((resolve) => {
        resolveSearch = resolve;
      });
      mockedBusService.getBusStopData.mockReturnValue(searchPromise);

      const { result } = renderHook(() => useBusSearch());

      act(() => {
        result.current.searchBusStop('T-Centralen');
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolveSearch!(mockBusStopData);
        await searchPromise;
      });

      expect(result.current.loading).toBe(false);
    });

    it('should clear error before new search', async () => {
      const { result } = renderHook(() => useBusSearch());

      // Set an error first
      await act(async () => {
        await result.current.searchBusStop('');
      });
      expect(result.current.error).not.toBeNull();

      // Search again
      mockedBusService.getBusStopData.mockResolvedValue(mockBusStopData);
      await act(async () => {
        await result.current.searchBusStop('T-Centralen');
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });

    it('should handle search errors', async () => {
      const errorMessage = 'Bus stop not found';
      mockedBusService.getBusStopData.mockRejectedValue(new Error('API error'));
      mockedBusService.parseError.mockReturnValue(errorMessage);

      const { result } = renderHook(() => useBusSearch());

      await act(async () => {
        await result.current.searchBusStop('Unknown');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.busData).toBeNull();
    });

    it('should call parseError with correct arguments', async () => {
      const error = new Error('API error');
      const stopName = 'Unknown Station';
      mockedBusService.getBusStopData.mockRejectedValue(error);
      mockedBusService.parseError.mockReturnValue('Error message');

      const { result } = renderHook(() => useBusSearch());

      await act(async () => {
        await result.current.searchBusStop(stopName);
      });

      await waitFor(() => {
        expect(mockedBusService.parseError).toHaveBeenCalledWith(error, stopName);
      });
    });
  });

  describe('handleSubmit', () => {
    it('should prevent default form submission', async () => {
      const { result } = renderHook(() => useBusSearch());
      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as FormEvent;

      mockedBusService.getBusStopData.mockResolvedValue(mockBusStopData);

      await act(async () => {
        result.current.setBusStopName('T-Centralen');
      });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should call searchBusStop with current busStopName', async () => {
      mockedBusService.getBusStopData.mockResolvedValue(mockBusStopData);

      const { result } = renderHook(() => useBusSearch());
      const mockEvent = { preventDefault: vi.fn() } as unknown as FormEvent;

      await act(async () => {
        result.current.setBusStopName('T-Centralen');
      });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      await waitFor(() => {
        expect(mockedBusService.getBusStopData).toHaveBeenCalledWith('T-Centralen');
      });
    });
  });

  describe('clearError', () => {
    it('should clear error message', async () => {
      const { result } = renderHook(() => useBusSearch());

      // Set an error first
      await act(async () => {
        await result.current.searchBusStop('');
      });
      expect(result.current.error).not.toBeNull();

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', async () => {
      mockedBusService.getBusStopData.mockResolvedValue(mockBusStopData);

      const { result } = renderHook(() => useBusSearch());

      // Set some state
      await act(async () => {
        result.current.setBusStopName('T-Centralen');
        await result.current.searchBusStop('T-Centralen');
      });

      await waitFor(() => {
        expect(result.current.busData).not.toBeNull();
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.busStopName).toBe('');
      expect(result.current.busData).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });
});
