/**
 * Ultra-Performance Monitoring and Analytics
 * Real-time performance tracking, bottleneck detection, and optimization insights
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface PerformanceMetrics {
  // Query Performance
  averageQueryTime: number;
  slowestQuery: { key: string; time: number };
  cacheHitRate: number;
  totalQueries: number;
  activeQueries: number;

  // Mutation Performance
  averageMutationTime: number;
  slowestMutation: { key: string; time: number };
  mutationSuccessRate: number;

  // Memory Usage
  cacheSize: number;
  garbageCollectedQueries: number;

  // Network Performance
  networkRequests: number;
  failedRequests: number;
  retryRate: number;

  // UI Performance
  renderTime: number;
  layoutShifts: number;

  // Overall Health Score (0-100)
  healthScore: number;
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
  queryKey?: string;
  suggestedAction?: string;
}

/**
 * Core performance monitoring hook
 */
export const usePerformanceMonitor = () => {
  const queryClient = useQueryClient();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    averageQueryTime: 0,
    slowestQuery: { key: '', time: 0 },
    cacheHitRate: 0,
    totalQueries: 0,
    activeQueries: 0,
    averageMutationTime: 0,
    slowestMutation: { key: '', time: 0 },
    mutationSuccessRate: 0,
    cacheSize: 0,
    garbageCollectedQueries: 0,
    networkRequests: 0,
    failedRequests: 0,
    retryRate: 0,
    renderTime: 0,
    layoutShifts: 0,
    healthScore: 100,
  });

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const performanceMarks = useRef<Map<string, number>>(new Map());

  // Calculate metrics every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      calculateMetrics();
    }, 5000);

    return () => clearInterval(interval);
  }, [calculateMetrics]);

  const calculateMetrics = useCallback(() => {
    const queries = queryClient.getQueryCache().getAll();
    const mutations = queryClient.getMutationCache().getAll();

    // Query Performance
    const successfulQueries = queries.filter(q => q.state.status === 'success');
    const queryTimes = successfulQueries
      .map(q => q.state.dataUpdatedAt ? Date.now() - q.state.dataUpdatedAt : 0)
      .filter(time => time > 0);

    const averageQueryTime = queryTimes.length > 0
      ? queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length
      : 0;

    const slowestQuery = queryTimes.length > 0
      ? {
          key: successfulQueries[queryTimes.indexOf(Math.max(...queryTimes))]?.queryKey?.toString() || '',
          time: Math.max(...queryTimes)
        }
      : { key: '', time: 0 };

    // Cache Hit Rate (rough estimate)
    const cacheHits = queries.filter(q => q.state.data && !q.isStale()).length;
    const cacheHitRate = queries.length > 0 ? (cacheHits / queries.length) * 100 : 0;

    // Mutation Performance
    const successfulMutations = mutations.filter(m => m.state.status === 'success');
    const mutationTimes = successfulMutations
      .map(m => m.state.submittedAt ? Date.now() - m.state.submittedAt : 0)
      .filter(time => time > 0);

    const averageMutationTime = mutationTimes.length > 0
      ? mutationTimes.reduce((a, b) => a + b, 0) / mutationTimes.length
      : 0;

    const slowestMutation = mutationTimes.length > 0
      ? {
          key: successfulMutations[mutationTimes.indexOf(Math.max(...mutationTimes))]?.options?.mutationKey?.toString() || '',
          time: Math.max(...mutationTimes)
        }
      : { key: '', time: 0 };

    const mutationSuccessRate = mutations.length > 0
      ? (successfulMutations.length / mutations.length) * 100
      : 100;

    // Memory Usage (rough estimate)
    const cacheSize = queries.reduce((size, q) => {
      return size + JSON.stringify(q.state.data || {}).length;
    }, 0);

    // Network Performance
    const networkRequests = queries.filter(q => q.isFetching()).length;
    const failedRequests = queries.filter(q => q.state.status === 'error').length;
    const retriedQueries = queries.filter(q => (q.state as { fetchFailureCount?: number }).fetchFailureCount && (q.state as { fetchFailureCount?: number }).fetchFailureCount! > 0).length;
    const retryRate = queries.length > 0 ? (retriedQueries / queries.length) * 100 : 0;

    // Calculate Health Score
    const healthFactors = {
      queryPerformance: Math.max(0, 100 - (averageQueryTime / 10)), // Penalize slow queries
      cacheEfficiency: cacheHitRate,
      mutationReliability: mutationSuccessRate,
      errorRate: Math.max(0, 100 - (failedRequests / Math.max(queries.length, 1)) * 100),
      retryRate: Math.max(0, 100 - retryRate),
    };

    const healthScore = Math.round(
      Object.values(healthFactors).reduce((a, b) => a + b, 0) / Object.values(healthFactors).length
    );

    setMetrics({
      averageQueryTime,
      slowestQuery,
      cacheHitRate,
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.isFetching()).length,
      averageMutationTime,
      slowestMutation,
      mutationSuccessRate,
      cacheSize,
      garbageCollectedQueries: 0, // Would need more complex tracking
      networkRequests,
      failedRequests,
      retryRate,
      renderTime: 0, // Would need React Profiler integration
      layoutShifts: 0, // Would need additional tracking
      healthScore,
    });

    // Generate alerts
    generateAlerts({
      averageQueryTime,
      slowestQuery,
      failedRequests,
      retryRate,
      healthScore,
      queries: queries.length,
    });
  }, [queryClient, generateAlerts]);

  const generateAlerts = useCallback((data: {
    averageQueryTime: number;
    slowestQuery: { key: string; time: number };
    failedRequests: number;
    retryRate: number;
    healthScore: number;
    queries: number;
  }) => {
    const newAlerts: PerformanceAlert[] = [];

    // Slow query alert
    if (data.averageQueryTime > 2000) {
      newAlerts.push({
        id: 'slow-queries',
        type: 'warning',
        message: `Average query time is ${data.averageQueryTime.toFixed(0)}ms - consider optimization`,
        timestamp: Date.now(),
        suggestedAction: 'Check network, database indexes, or implement pagination',
      });
    }

    // High error rate alert
    if (data.failedRequests > data.queries * 0.1) {
      newAlerts.push({
        id: 'high-error-rate',
        type: 'error',
        message: `${data.failedRequests} queries failed - check API connectivity`,
        timestamp: Date.now(),
        suggestedAction: 'Verify API endpoints and network connectivity',
      });
    }

    // High retry rate alert
    if (data.retryRate > 20) {
      newAlerts.push({
        id: 'high-retry-rate',
        type: 'warning',
        message: `High retry rate (${data.retryRate.toFixed(1)}%) - possible network issues`,
        timestamp: Date.now(),
        suggestedAction: 'Check network stability or adjust retry logic',
      });
    }

    // Poor health score alert
    if (data.healthScore < 70) {
      newAlerts.push({
        id: 'poor-health',
        type: 'error',
        message: `Performance health score is ${data.healthScore}/100`,
        timestamp: Date.now(),
        suggestedAction: 'Review queries, cache settings, and network performance',
      });
    }

    setAlerts(prev => {
      // Remove old alerts and add new ones
      const recentAlerts = prev.filter(alert =>
        Date.now() - alert.timestamp < 300000 // Keep alerts for 5 minutes
      );
      return [...recentAlerts, ...newAlerts];
    });
  }, []);

  // Performance marking utilities
  const startMark = useCallback((name: string) => {
    performanceMarks.current.set(name, performance.now());
  }, []);

  const endMark = useCallback((name: string) => {
    const start = performanceMarks.current.get(name);
    if (start) {
      const duration = performance.now() - start;
      performanceMarks.current.delete(name);

      if (import.meta.env.DEV) {
        console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);

        if (duration > 1000) {
          console.warn(`🚨 Slow operation: ${name} (${duration.toFixed(2)}ms)`);
        }
      }

      return duration;
    }
    return 0;
  }, []);

  // Query performance analyzer
  const analyzeQueryPerformance = useCallback((queryKey: string) => {
    const queries = queryClient.getQueryCache().getAll();
    const matchingQueries = queries.filter(q =>
      JSON.stringify(q.queryKey) === JSON.stringify(queryKey)
    );

    if (matchingQueries.length === 0) return null;

    const query = matchingQueries[0];
    const state = query.state;

    return {
      key: queryKey,
      status: state.status,
      fetchCount: state.fetchFailureCount + (state.status === 'success' ? 1 : 0),
      lastFetch: state.dataUpdatedAt,
      isStale: query.isStale(),
      errorCount: state.fetchFailureCount,
      dataSize: JSON.stringify(state.data || {}).length,
      estimatedCacheTime: state.dataUpdatedAt ? Date.now() - state.dataUpdatedAt : 0,
    };
  }, [queryClient]);

  return {
    metrics,
    alerts,
    startMark,
    endMark,
    analyzeQueryPerformance,
    // Utility functions
    getHealthColor: (score: number) => {
      if (score >= 80) return 'green';
      if (score >= 60) return 'yellow';
      return 'red';
    },
    getHealthStatus: (score: number) => {
      if (score >= 80) return 'excellent';
      if (score >= 60) return 'good';
      return 'needs-attention';
    },
  };
};

/**
 * Real-time performance dashboard hook
 */
export const usePerformanceDashboard = () => {
  const monitor = usePerformanceMonitor();
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-expand on poor performance
  useEffect(() => {
    if (monitor.metrics.healthScore < 70) {
      setIsExpanded(true);
    }
  }, [monitor.metrics.healthScore]);

  return {
    ...monitor,
    isExpanded,
    setIsExpanded,
  };
};

/**
 * Performance optimization suggestions
 */
export const usePerformanceSuggestions = (metrics: PerformanceMetrics) => {
  return useMemo(() => {
    const suggestions: Array<{
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      impact: string;
    }> = [];

    // High priority suggestions
    if (metrics.averageQueryTime > 2000) {
      suggestions.push({
        priority: 'high',
        title: 'Optimize Slow Queries',
        description: 'Average query time exceeds 2 seconds',
        impact: 'Reduce loading times by implementing pagination and database indexes',
      });
    }

    if (metrics.cacheHitRate < 50) {
      suggestions.push({
        priority: 'high',
        title: 'Improve Cache Efficiency',
        description: `Cache hit rate is only ${metrics.cacheHitRate.toFixed(1)}%`,
        impact: 'Increase staleTime and prefetch critical data',
      });
    }

    if (metrics.failedRequests > metrics.totalQueries * 0.05) {
      suggestions.push({
        priority: 'high',
        title: 'Fix Network Issues',
        description: `${metrics.failedRequests} requests failed`,
        impact: 'Check API endpoints and implement better error handling',
      });
    }

    // Medium priority suggestions
    if (metrics.averageMutationTime > 1000) {
      suggestions.push({
        priority: 'medium',
        title: 'Optimize Mutations',
        description: 'Mutations are taking longer than expected',
        impact: 'Implement optimistic updates and reduce server response time',
      });
    }

    if (metrics.healthScore < 80) {
      suggestions.push({
        priority: 'medium',
        title: 'Overall Performance Tuning',
        description: `Health score: ${metrics.healthScore}/100`,
        impact: 'Review all performance metrics and implement optimizations',
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [metrics]);
};
