/**
 * Ultra-Optimized Loading States and Skeleton Management
 * Provides intelligent loading states, skeleton UI, and performance indicators
 */

import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export interface LoadingState {
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
  data: unknown;
  // Enhanced states
  isLoadingOptimized: boolean;
  isRefetchingOptimized: boolean;
  isCacheHit: boolean;
  fetchTime: number;
  isStale: boolean;
  isBackgroundRefetch: boolean;
}

export interface SkeletonConfig {
  show: boolean;
  type: 'table' | 'card' | 'list' | 'form' | 'chart';
  rows?: number;
  columns?: number;
  height?: string | number;
  width?: string | number;
  animated?: boolean;
  speed?: 'slow' | 'normal' | 'fast';
}

/**
 * Enhanced loading state hook with performance indicators
 */
export const useEnhancedLoadingState = (queryResult: {
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
  data: unknown;
}): LoadingState => {
  const queryClient = useQueryClient();

  return useMemo(() => {
    const isLoadingOptimized = queryResult.isLoading && !queryResult.isFetching;
    const isRefetchingOptimized = queryResult.isFetching && !queryResult.isLoading;
    const isCacheHit = queryResult.data?._cacheHit || false;
    const fetchTime = queryResult.data?._fetchTime || 0;
    const isStale = queryResult.isStale || false;
    const isBackgroundRefetch = queryResult.isFetching && queryResult.isSuccess;

    return {
      isLoading: queryResult.isLoading,
      isFetching: queryResult.isFetching,
      isError: queryResult.isError,
      isSuccess: queryResult.isSuccess,
      error: queryResult.error,
      data: queryResult.data,
      // Enhanced states
      isLoadingOptimized,
      isRefetchingOptimized,
      isCacheHit,
      fetchTime,
      isStale,
      isBackgroundRefetch,
    };
  }, [
    queryResult.isLoading,
    queryResult.isFetching,
    queryResult.isError,
    queryResult.isSuccess,
    queryResult.error,
    queryResult.data,
    queryResult.isStale,
  ]);
};

/**
 * Smart skeleton configuration based on data patterns
 */
export const useSmartSkeleton = (
  loadingState: LoadingState,
  baseConfig: Partial<SkeletonConfig>
): SkeletonConfig => {
  return useMemo(() => {
    const defaultConfig: SkeletonConfig = {
      show: loadingState.isLoadingOptimized,
      type: 'table',
      rows: 5,
      columns: 4,
      animated: true,
      speed: 'normal',
      ...baseConfig,
    };

    // Adjust based on performance
    if (loadingState.fetchTime > 1000) {
      // Slow fetch, show more skeleton rows
      defaultConfig.rows = Math.min((defaultConfig.rows || 5) + 2, 10);
      defaultConfig.speed = 'fast';
    }

    // Cache hits get minimal skeleton
    if (loadingState.isCacheHit) {
      defaultConfig.rows = Math.max((defaultConfig.rows || 5) - 2, 1);
      defaultConfig.speed = 'slow';
    }

    // Background refetch gets subtle skeleton
    if (loadingState.isBackgroundRefetch) {
      defaultConfig.animated = false;
    }

    return defaultConfig;
  }, [loadingState, baseConfig]);
};

/**
 * Loading performance tracker
 */
export const useLoadingPerformance = () => {
  const queryClient = useQueryClient();

  const getLoadingStats = useMemo(() => {
    const queries = queryClient.getQueryCache().getAll();
    const loadingQueries = queries.filter(q => q.isFetching());
    const erroredQueries = queries.filter(q => q.state.status === 'error');

    return {
      totalQueries: queries.length,
      loadingQueries: loadingQueries.length,
      erroredQueries: erroredQueries.length,
      loadingPercentage: queries.length > 0 ? (loadingQueries.length / queries.length) * 100 : 0,
      // Performance metrics
      averageFetchTime: queries
        .filter(q => q.state.dataUpdatedAt)
        .reduce((acc, q, _, arr) => {
          const time = Date.now() - q.state.dataUpdatedAt;
          return acc + (time / arr.length);
        }, 0),
      slowQueries: queries.filter(q =>
        q.state.dataUpdatedAt && (Date.now() - q.state.dataUpdatedAt) > 2000
      ).length,
    };
  }, [queryClient]);

  return getLoadingStats;
};

/**
 * Progressive loading hook for large datasets
 */
export const useProgressiveLoading = (totalItems: number, batchSize: number = 20) => {
  return useMemo(() => {
    const batches = Math.ceil(totalItems / batchSize);
    const loadingStages = [];

    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min((i + 1) * batchSize, totalItems);
      const percentage = ((i + 1) / batches) * 100;

      loadingStages.push({
        stage: i + 1,
        start,
        end,
        percentage,
        isComplete: false,
        estimatedTime: (end - start) * 50, // Rough estimate
      });
    }

    return {
      batches,
      stages: loadingStages,
      totalEstimatedTime: loadingStages.reduce((acc, stage) => acc + stage.estimatedTime, 0),
    };
  }, [totalItems, batchSize]);
};

/**
 * Intelligent loading message generator
 */
export const useLoadingMessage = (loadingState: LoadingState, context?: string) => {
  return useMemo(() => {
    if (!loadingState.isLoading && !loadingState.isFetching) {
      return null;
    }

    const messages = {
      fast: [
        'Loading...',
        'Fetching data...',
        'Almost ready...',
      ],
      normal: [
        'Loading your data...',
        'Please wait...',
        'Getting the latest information...',
      ],
      slow: [
        'This is taking longer than usual...',
        'Fetching large dataset...',
        'Processing your request...',
      ],
    };

    let speed: keyof typeof messages = 'normal';

    if (loadingState.fetchTime > 2000) {
      speed = 'slow';
    } else if (loadingState.fetchTime < 500) {
      speed = 'fast';
    }

    const messageList = messages[speed];
    const messageIndex = Math.floor(Math.random() * messageList.length);

    let message = messageList[messageIndex];

    // Add context-specific messages
    if (context) {
      switch (context) {
        case 'adjustments':
          message = loadingState.isCacheHit
            ? 'Loading from cache...'
            : 'Fetching adjustments...';
          break;
        case 'suppliers':
          message = 'Loading suppliers...';
          break;
        case 'users':
          message = 'Loading user data...';
          break;
      }
    }

    // Add performance indicator
    if (loadingState.isBackgroundRefetch) {
      message += ' (background update)';
    }

    return message;
  }, [loadingState, context]);
};

/**
 * Loading state presets for common UI patterns
 */
export const loadingPresets = {
  table: {
    type: 'table' as const,
    rows: 5,
    columns: 4,
    height: 50,
    animated: true,
  },
  card: {
    type: 'card' as const,
    rows: 1,
    columns: 1,
    height: 200,
    width: '100%',
    animated: true,
  },
  list: {
    type: 'list' as const,
    rows: 3,
    columns: 1,
    height: 40,
    animated: true,
  },
  form: {
    type: 'form' as const,
    rows: 4,
    columns: 2,
    height: 35,
    animated: true,
  },
  chart: {
    type: 'chart' as const,
    rows: 1,
    columns: 1,
    height: 300,
    width: '100%',
    animated: false,
  },
} as const;

/**
 * Hook for optimistic UI updates
 */
export const useOptimisticUI = <T,>(
  currentData: T,
  pendingUpdates: Partial<T>[]
): T => {
  return useMemo(() => {
    if (pendingUpdates.length === 0) return currentData;

    // Apply optimistic updates
    return pendingUpdates.reduce((data, update) => ({
      ...data,
      ...update,
      _isOptimistic: true,
      _pendingUpdates: pendingUpdates.length,
    }), currentData);
  }, [currentData, pendingUpdates]);
};
