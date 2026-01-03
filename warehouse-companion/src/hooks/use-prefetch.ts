import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { adjustmentKeys } from './use-adjustments';
import { supplierKeys } from './use-suppliers';
import { userKeys } from './use-users';

/**
 * Ultra-optimized prefetching utilities for maximum performance
 */

// Prefetch priorities for different data types
export const PREFETCH_PRIORITIES = {
  CRITICAL: 'critical', // Must be prefetched immediately
  HIGH: 'high',       // Should be prefetched soon
  MEDIUM: 'medium',   // Can be prefetched when idle
  LOW: 'low'          // Prefetch only when explicitly requested
} as const;

type PrefetchPriority = typeof PREFETCH_PRIORITIES[keyof typeof PREFETCH_PRIORITIES];

// Smart prefetch queue with priority management
class PrefetchQueue {
  private queue: Array<{
    fn: () => Promise<void>;
    priority: PrefetchPriority;
    id: string;
  }> = [];
  private processing = false;
  private processedIds = new Set<string>();

  add(fn: () => Promise<void>, priority: PrefetchPriority, id: string) {
    if (this.processedIds.has(id)) return;

    this.queue.push({ fn, priority, id });
    this.queue.sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority));

    // Only start processing if not already processing AND queue isn't too long
    if (!this.processing && this.queue.length <= 3) {
      this.process();
    }
  }

  private getPriorityWeight(priority: PrefetchPriority): number {
    switch (priority) {
      case PREFETCH_PRIORITIES.CRITICAL: return 4;
      case PREFETCH_PRIORITIES.HIGH: return 3;
      case PREFETCH_PRIORITIES.MEDIUM: return 2;
      case PREFETCH_PRIORITIES.LOW: return 1;
      default: return 0;
    }
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    // Process only ONE request at a time to avoid overwhelming the network
    const item = this.queue.shift()!;
    if (!this.processedIds.has(item.id)) {
      try {
        await item.fn();
        this.processedIds.add(item.id);

        // Add delay between requests to prevent network congestion
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.warn('Prefetch failed:', item.id, error);
      }
    }

    this.processing = false;

    // Continue processing remaining items after a longer delay
    if (this.queue.length > 0) {
      setTimeout(() => this.process(), 1000);
    }
  }
}

const prefetchQueue = new PrefetchQueue();

// Debounced prefetch to prevent spam
const debouncePrefetch = (fn: () => void, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(fn, delay);
  };
};

export const usePrefetch = () => {
  const queryClient = useQueryClient();

  // Ultra-fast prefetch for critical data
  const prefetchCritical = useCallback(async (queryKey: readonly unknown[], queryFn: () => Promise<unknown>) => {
    const existingQuery = queryClient.getQueryData(queryKey);
    if (!existingQuery) {
      prefetchQueue.add(
        () => queryClient.prefetchQuery({
          queryKey,
          queryFn,
          staleTime: 1000 * 60 * 10, // Cache for 10 minutes
        }),
        PREFETCH_PRIORITIES.CRITICAL,
        JSON.stringify(queryKey)
      );
    }
  }, [queryClient]);

  // Prefetch with priority
  const prefetchWithPriority = useCallback((
    queryKey: readonly unknown[],
    queryFn: () => Promise<unknown>,
    priority: PrefetchPriority = PREFETCH_PRIORITIES.MEDIUM
  ) => {
    prefetchQueue.add(
      () => queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: priority === PREFETCH_PRIORITIES.CRITICAL ? 1000 * 60 * 10 : 1000 * 60 * 5,
      }),
      priority,
      JSON.stringify(queryKey)
    );
  }, [queryClient]);

  // Prefetch on hover (for navigation)
  const prefetchOnHover = useCallback(
    (queryKey: readonly unknown[], queryFn: () => Promise<unknown>) => {
      const debouncedFn = debouncePrefetch(() => {
        prefetchWithPriority(queryKey, queryFn, PREFETCH_PRIORITIES.LOW);
      }, 100);
      debouncedFn();
    },
    [prefetchWithPriority]
  );

  // Prefetch on focus (for forms)
  const prefetchOnFocus = useCallback(
    (queryKey: readonly unknown[], queryFn: () => Promise<unknown>) => {
      prefetchWithPriority(queryKey, queryFn, PREFETCH_PRIORITIES.HIGH);
    },
    [prefetchWithPriority]
  );

  // Prefetch related data when one query succeeds
  const prefetchRelated = useCallback((
    currentQueryKey: readonly unknown[],
    relatedQueries: Array<{ key: readonly unknown[], fn: () => Promise<unknown>, priority?: PrefetchPriority }>
  ) => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event.type === 'updated' &&
        event.query.state.status === 'success' &&
        JSON.stringify(event.query.queryKey) === JSON.stringify(currentQueryKey)
      ) {
        relatedQueries.forEach(({ key, fn, priority = PREFETCH_PRIORITIES.MEDIUM }) => {
          prefetchWithPriority(key, fn, priority);
        });
        unsubscribe();
      }
    });

    return unsubscribe;
  }, [queryClient, prefetchWithPriority]);

  return {
    prefetchCritical,
    prefetchWithPriority,
    prefetchOnHover,
    prefetchOnFocus,
    prefetchRelated,
  };
};

// Specialized prefetch hooks for common patterns
export const usePrefetchAdjustments = () => {
  const queryClient = useQueryClient();
  const { prefetchWithPriority } = usePrefetch();

  const prefetchAdjustmentList = useCallback((page = 1, limit = 20) => {
    prefetchWithPriority(
      adjustmentKeys.list({ page, limit }),
      async () => {
        const { adjustmentsApi } = await import('@/services/inventory.api');
        const response = await adjustmentsApi.getAll(page, limit);
        if (!response.success || !response.data) throw new Error('Failed to fetch');
        return response.data;
      },
      PREFETCH_PRIORITIES.HIGH
    );
  }, [prefetchWithPriority]);

  const prefetchAdjustmentDetail = useCallback((id: number) => {
    prefetchWithPriority(
      adjustmentKeys.detail(id),
      async () => {
        const { adjustmentsApi } = await import('@/services/inventory.api');
        const response = await adjustmentsApi.getById(id);
        if (!response.success || !response.data) throw new Error('Failed to fetch');
        return response.data;
      },
      PREFETCH_PRIORITIES.CRITICAL
    );
  }, [prefetchWithPriority]);

  return { prefetchAdjustmentList, prefetchAdjustmentDetail };
};

export const usePrefetchSuppliers = () => {
  const { prefetchWithPriority } = usePrefetch();

  const prefetchSupplierList = useCallback((page = 1, limit = 100) => {
    prefetchWithPriority(
      supplierKeys.list({ page, limit }),
      async () => {
        const { suppliersApi } = await import('@/services/master.api');
        const response = await suppliersApi.getAll(page, limit);
        if (!response.success || !response.data) throw new Error('Failed to fetch');
        return response.data;
      },
      PREFETCH_PRIORITIES.MEDIUM
    );
  }, [prefetchWithPriority]);

  return { prefetchSupplierList };
};

// Global prefetch on app start
export const useGlobalPrefetch = () => {
  const { prefetchCritical } = usePrefetch();

  useEffect(() => {
    // DELAYED prefetch - only after user interaction or when truly needed
    // Remove aggressive prefetching that's slowing down initial load

    // Optional: Only prefetch when user is idle AND has navigated somewhere
    const handleUserIdle = () => {
      // Only prefetch if user has been active for a while
      // This prevents slowing down the initial page load
    };

    // Remove the immediate prefetch that's causing slow loads
    // Prefetch will happen naturally when components request data
  }, []); // Remove prefetchCritical dependency
};
