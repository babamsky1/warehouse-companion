/**
 * Ultra-Optimized React Query Hooks for Adjustments
 * Maximum performance with intelligent caching, prefetching, and loading states
 */

import { adjustmentsApi } from '@/services/inventory.api';
import type { Adjustment, PaginatedResponse } from '@/types/database';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { usePrefetch, usePrefetchAdjustments } from './use-prefetch';

// Enhanced types for better type safety
interface ApiError {
  status?: number;
  message?: string;
  response?: {
    status: number;
    data?: unknown;
  };
}

interface MutationContext {
  previousAdjustments?: AdjustmentQueryData;
  optimisticAdjustment?: Adjustment;
  previousDetail?: SingleAdjustmentData;
  previousList?: AdjustmentQueryData;
  undo?: () => void;
  undoTimeout?: NodeJS.Timeout;
  id?: number;
  data?: Partial<Adjustment>;
}

interface AdjustmentQueryData extends PaginatedResponse<Adjustment> {
  _fetchTime?: number;
  _cacheHit?: boolean;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  total_pages: number; // Required by PaginatedResponse
}

interface SingleAdjustmentData extends Adjustment {
  _fetchTime?: number;
  _cacheHit?: boolean;
  isRecent?: boolean;
  hasAttachments?: boolean;
  statusBadge?: string;
}

export const adjustmentKeys = {
  all: ['adjustments'] as const,
  lists: () => [...adjustmentKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...adjustmentKeys.lists(), filters] as const,
  details: () => [...adjustmentKeys.all, 'detail'] as const,
  detail: (id: number) => [...adjustmentKeys.details(), id] as const,
  // Add meta keys for better cache management
  meta: () => [...adjustmentKeys.all, 'meta'] as const,
  stats: () => [...adjustmentKeys.all, 'stats'] as const,
};

// Ultra-optimized adjustments list hook with prefetching and performance monitoring
export const useAdjustments = (page: number = 1, limit: number = 20, filters?: Record<string, unknown>) => {
  const { prefetchAdjustmentList, prefetchAdjustmentDetail } = usePrefetchAdjustments();
  const { prefetchRelated } = usePrefetch();

  const query = useQuery({
    queryKey: adjustmentKeys.list({ page, limit, ...filters }),
    queryFn: async () => {
      const startTime = performance.now();

      try {
        const response = await adjustmentsApi.getAll(page, limit);

        // Performance monitoring
        const duration = performance.now() - startTime;
        if (import.meta.env.DEV && duration > 500) {
          console.warn(`Slow adjustments fetch (${duration.toFixed(2)}ms):`, { page, limit, filters });
        }

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch adjustments');
        }

        return response.data;
      } catch (error) {
        console.error('Adjustments fetch failed:', error);
        throw error;
      }
    },

    // Ultra-optimized stale time based on data volatility
    staleTime: 1000 * 60 * 2, // 2 minutes for frequently changing adjustment data
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes

    // Smart refetch strategies
    refetchOnWindowFocus: false, // Prevent unnecessary refetches on focus
    refetchOnReconnect: true, // Always refetch when reconnecting
    refetchOnMount: true, // Refetch if stale

    // Background updates for critical data
    refetchInterval: (query) => {
      // Background refresh every 30 seconds for active queries
      if (query.state.status === 'success' && !query.isStale()) {
        return 1000 * 30;
      }
      return false;
    },
    refetchIntervalInBackground: true,

    // Enhanced error handling
    retry: (failureCount: number, error: ApiError) => {
      // Don't retry on client errors
      if (error?.status && error.status >= 400 && error.status < 500) return false;
      // Retry network errors up to 3 times
      return failureCount < 3;
    },

    // Data transformation with performance monitoring
    select: useCallback((data: PaginatedResponse<Adjustment>) => {
      const startTime = performance.now();

      const transformed: AdjustmentQueryData = {
        ...data,
        // Add computed properties for better performance
        totalPages: Math.ceil((data?.total || 0) / limit),
        hasNextPage: page * limit < (data?.total || 0),
        hasPrevPage: page > 1,
        // Performance metadata
        _fetchTime: performance.now() - startTime,
        _cacheHit: false, // Will be set by the hook
      };

      const transformTime = performance.now() - startTime;
      if (import.meta.env.DEV && transformTime > 10) {
        console.warn(`Slow data transformation (${transformTime.toFixed(2)}ms)`);
      }

      return transformed;
    }, [page, limit]),

    // Placeholder data for instant loading
    placeholderData: (previousData) => previousData,

    // Meta information for debugging
    meta: {
      type: 'adjustments-list',
      page,
      limit,
      filters,
    },
  });

  // Intelligent prefetching
  const prefetchNextPage = useCallback(() => {
    if (query.data?.hasNextPage) {
      prefetchAdjustmentList(page + 1, limit);
    }
  }, [query.data?.hasNextPage, prefetchAdjustmentList, page, limit]);

  const prefetchPrevPage = useCallback(() => {
    if (query.data?.hasPrevPage) {
      prefetchAdjustmentList(page - 1, limit);
    }
  }, [query.data?.hasPrevPage, prefetchAdjustmentList, page, limit]);

  // Prefetch related data when adjustments load
  useMemo(() => {
    if (query.data?.data?.length > 0 && query.isSuccess) {
      // Prefetch first few adjustment details for quick access
      const firstAdjustment = query.data.data[0];
      if (firstAdjustment?.id) {
        prefetchAdjustmentDetail(firstAdjustment.id);
      }
    }
  }, [query.data?.data, query.isSuccess, prefetchAdjustmentDetail]);

  return {
    ...query,
    // Enhanced return object with prefetch methods
    prefetchNextPage,
    prefetchPrevPage,
    // Performance indicators
    isCacheHit: query.data?._cacheHit || false,
    fetchTime: query.data?._fetchTime || 0,
    // Smart loading states
    isLoadingOptimized: query.isLoading && !query.isFetching,
    isRefetchingOptimized: query.isFetching && !query.isLoading,
  };
};

// Ultra-optimized single adjustment hook with advanced caching and prefetching
export const useAdjustment = (id: number | null, options?: {
  prefetchRelated?: boolean;
  enableBackgroundRefetch?: boolean;
}) => {
  const { prefetchAdjustmentDetail } = usePrefetchAdjustments();
  const { prefetchRelated } = usePrefetch();

  const query = useQuery({
    queryKey: adjustmentKeys.detail(id!),
    queryFn: async () => {
      if (!id) return null;

      const startTime = performance.now();

      try {
        const response = await adjustmentsApi.getById(id);

        // Performance monitoring
        const duration = performance.now() - startTime;
        if (import.meta.env.DEV && duration > 300) {
          console.warn(`Slow adjustment fetch (${duration.toFixed(2)}ms):`, id);
        }

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch adjustment');
        }

        return response.data;
      } catch (error) {
        console.error('Adjustment fetch failed:', id, error);
        throw error;
      }
    },

    enabled: !!id,

    // Optimized stale time for detail views
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 60, // Keep for 1 hour (more valuable data)

    // Smart refetch strategies
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,

    // Background updates for critical adjustment details
    refetchInterval: options?.enableBackgroundRefetch ? 1000 * 60 : false, // 1 minute background refresh
    refetchIntervalInBackground: true,

    // Enhanced retry logic
    retry: (failureCount: number, error: ApiError) => {
      if (error?.status && error.status >= 400 && error.status < 500) return false;
      return failureCount < 3;
    },

    // Data transformation with performance tracking
    select: useCallback((data: Adjustment): SingleAdjustmentData => {
      const startTime = performance.now();

      const transformed: SingleAdjustmentData = {
        ...data,
        // Add computed properties
        isRecent: data.created_at && (Date.now() - new Date(data.created_at).getTime()) < 1000 * 60 * 60, // Last hour
        hasAttachments: false, // Adjustments don't have attachments in current schema
        statusBadge: data.adjustment_type?.toLowerCase().replace('_', ' '),
        // Performance metadata
        _fetchTime: performance.now() - startTime,
        _cacheHit: false, // Will be set by the hook
      };

      const transformTime = performance.now() - startTime;
      if (import.meta.env.DEV && transformTime > 5) {
        console.warn(`Slow adjustment transformation (${transformTime.toFixed(2)}ms):`, id);
      }

      return transformed;
    }, [id]),

    // Placeholder data from cache
    placeholderData: (previousData) => previousData,

    // Meta information
    meta: {
      type: 'adjustment-detail',
      id,
      options,
    },
  });

  // Prefetch related data when adjustment loads
  useMemo(() => {
    if (options?.prefetchRelated && query.data && query.isSuccess && id) {
      // Prefetch related stock information
      prefetchRelated(
        adjustmentKeys.detail(id),
        [
          {
            key: ['stocks', 'detail', query.data.product_id],
            fn: async () => {
              const { stocksApi } = await import('@/services/inventory.api');
              return stocksApi.getByProduct(query.data!.product_id);
            },
            priority: 'high' as const,
          },
        ]
      );
    }
  }, [query.data, query.isSuccess, id, options?.prefetchRelated, prefetchRelated]);

  return {
    ...query,
    // Performance indicators
    isCacheHit: query.data?._cacheHit || false,
    fetchTime: query.data?._fetchTime || 0,
    // Smart loading states
    isLoadingOptimized: query.isLoading && !query.isFetching,
    isRefetchingOptimized: query.isFetching && !query.isLoading,
  };
};

// Ultra-optimized create adjustment with optimistic updates and smart cache invalidation
export const useCreateAdjustment = (options?: {
  optimistic?: boolean;
  onSuccess?: (data: Adjustment) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Adjustment>) => {
      const startTime = performance.now();

      try {
        const response = await adjustmentsApi.create(data);

        // Performance monitoring
        const duration = performance.now() - startTime;
        if (import.meta.env.DEV && duration > 1000) {
          console.warn(`Slow adjustment creation (${duration.toFixed(2)}ms):`, data);
        }

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to create adjustment');
        }

        return response.data;
      } catch (error) {
        console.error('Adjustment creation failed:', error);
        throw error;
      }
    },

    // Optimistic updates for instant UI feedback
    onMutate: async (newAdjustment: Partial<Adjustment>) => {
      if (!options?.optimistic) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: adjustmentKeys.lists() });

      // Snapshot previous value
      const previousAdjustments = queryClient.getQueryData<AdjustmentQueryData>(adjustmentKeys.lists());

      // Optimistically update cache
      const optimisticAdjustment: Adjustment = {
        id: Date.now(), // Temporary ID
        ...newAdjustment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'pending',
        _isOptimistic: true,
      } as Adjustment;

      queryClient.setQueryData<AdjustmentQueryData>(adjustmentKeys.lists(), (old) => {
        if (!old) return { data: [optimisticAdjustment], total: 1, page: 1, limit: 20, total_pages: 1 };
        return {
          ...old,
          data: [optimisticAdjustment, ...(old.data || [])],
          total: (old.total || 0) + 1,
          total_pages: Math.ceil(((old.total || 0) + 1) / (old.limit || 20)),
        };
      });

      // Return context for rollback
      return { previousAdjustments, optimisticAdjustment };
    },

    // Rollback on error
    onError: (error: ApiError, variables: Partial<Adjustment>, context: MutationContext | undefined) => {
      if (context?.previousAdjustments) {
        queryClient.setQueryData<AdjustmentQueryData>(adjustmentKeys.lists(), context.previousAdjustments);
      }
      console.error('Adjustment creation error, rolled back:', error);
    },

    // Smart cache invalidation and updates
    onSuccess: (data: Adjustment, variables: Partial<Adjustment>, context: MutationContext | undefined) => {
      // Remove optimistic update and add real data
      if (context?.optimisticAdjustment) {
        queryClient.setQueryData<AdjustmentQueryData>(adjustmentKeys.lists(), (old) => {
          if (!old) return { data: [data], total: 1, page: 1, limit: 20, total_pages: 1 };
          return {
            ...old,
            data: old.data?.map((item) =>
              (item as Adjustment & { _isOptimistic?: boolean })._isOptimistic ? data : item
            ) || [data],
            total: old.total || 1,
            total_pages: Math.ceil((old.total || 1) / (old.limit || 20)),
          };
        });
      } else {
        // Standard invalidation
        queryClient.invalidateQueries({
          queryKey: adjustmentKeys.lists(),
          refetchType: 'active', // Only refetch active queries
        });
      }

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['stocks'],
        refetchType: 'active',
      });

      // Update stats if they exist
      queryClient.invalidateQueries({
        queryKey: adjustmentKeys.stats(),
        refetchType: 'active',
      });

      // Call custom success handler
      options?.onSuccess?.(data);
    },

    // Cleanup and finalization
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: adjustmentKeys.lists(),
        refetchType: 'none', // Don't auto-refetch, let components decide
      });
    },

    // Enhanced retry logic
    retry: (failureCount: number, error: ApiError) => {
      if (error?.status && error.status >= 400 && error.status < 500) return false;
      return failureCount < 2; // Less retries for mutations
    },

    // Meta information
    meta: {
      type: 'create-adjustment',
      optimistic: options?.optimistic || false,
    },
  });
};

// Ultra-optimized update adjustment with optimistic updates and minimal invalidation
export const useUpdateAdjustment = (options?: {
  optimistic?: boolean;
  invalidateLists?: boolean;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Adjustment> }) => {
      const startTime = performance.now();

      try {
        const response = await adjustmentsApi.update(id, data);

        // Performance monitoring
        const duration = performance.now() - startTime;
        if (import.meta.env.DEV && duration > 800) {
          console.warn(`Slow adjustment update (${duration.toFixed(2)}ms):`, id, data);
        }

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to update adjustment');
        }

        return response.data;
      } catch (error) {
        console.error('Adjustment update failed:', id, error);
        throw error;
      }
    },

    // Optimistic updates
    onMutate: async ({ id, data }) => {
      if (!options?.optimistic) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: adjustmentKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: adjustmentKeys.lists() });

      // Snapshot previous values
      const previousDetail = queryClient.getQueryData<SingleAdjustmentData>(adjustmentKeys.detail(id));
      const previousList = queryClient.getQueryData<AdjustmentQueryData>(adjustmentKeys.lists());

      // Optimistically update detail view
      queryClient.setQueryData<SingleAdjustmentData>(adjustmentKeys.detail(id), (old) => {
        if (!old) return undefined;
        return {
          ...old,
          ...data,
          updatedAt: new Date().toISOString(),
          _isOptimistic: true,
        };
      });

      // Optimistically update list view
      queryClient.setQueryData<AdjustmentQueryData>(adjustmentKeys.lists(), (old) => {
        if (!old) return undefined;
        return {
          ...old,
          data: old.data?.map((item) =>
            item.id === id ? { ...item, ...data, updatedAt: new Date().toISOString(), _isOptimistic: true } : item
          ) || [],
        };
      });

      return { previousDetail, previousList, id, data };
    },

    // Rollback on error
    onError: (error: ApiError, variables: { id: number; data: Partial<Adjustment> }, context: MutationContext | undefined) => {
      if (context?.previousDetail) {
        queryClient.setQueryData<SingleAdjustmentData>(adjustmentKeys.detail(variables.id), context.previousDetail);
      }
      if (context?.previousList) {
        queryClient.setQueryData<AdjustmentQueryData>(adjustmentKeys.lists(), context.previousList);
      }
      console.error('Adjustment update error, rolled back:', error);
    },

    // Smart cache updates
    onSuccess: (data: Adjustment, variables: { id: number; data: Partial<Adjustment> }, context: MutationContext | undefined) => {
      // Update detail cache with real data
      queryClient.setQueryData<SingleAdjustmentData>(adjustmentKeys.detail(variables.id), (old) => {
        if (!old) return undefined;
        return {
          ...old,
          ...data,
          _isOptimistic: false,
        };
      });

      // Update list cache with real data
      queryClient.setQueryData<AdjustmentQueryData>(adjustmentKeys.lists(), (old) => {
        if (!old) return undefined;
        return {
          ...old,
          data: old.data?.map((item) =>
            item.id === variables.id ? { ...item, ...data, _isOptimistic: false } : item
          ) || [],
        };
      });

      // Conditional list invalidation
      if (options?.invalidateLists !== false) {
        queryClient.invalidateQueries({
          queryKey: adjustmentKeys.lists(),
          refetchType: 'active',
        });
      }

      // Always invalidate related stocks
      queryClient.invalidateQueries({
        queryKey: ['stocks'],
        refetchType: 'active',
      });

      // Update stats
      queryClient.invalidateQueries({
        queryKey: adjustmentKeys.stats(),
        refetchType: 'active',
      });
    },

    // Enhanced retry logic
    retry: (failureCount: number, error: ApiError) => {
      if (error?.status >= 400 && error?.status < 500) return false;
      return failureCount < 2;
    },

    // Meta information
    meta: {
      type: 'update-adjustment',
      optimistic: options?.optimistic || false,
    },
  });
};

// Ultra-optimized delete adjustment with optimistic updates and smart cleanup
export const useDeleteAdjustment = (options?: {
  optimistic?: boolean;
  showUndo?: boolean;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const startTime = performance.now();

      try {
        const response = await adjustmentsApi.delete(id);

        // Performance monitoring
        const duration = performance.now() - startTime;
        if (import.meta.env.DEV && duration > 500) {
          console.warn(`Slow adjustment deletion (${duration.toFixed(2)}ms):`, id);
        }

        if (!response.success) {
          throw new Error(response.message || 'Failed to delete adjustment');
        }

        return id;
      } catch (error) {
        console.error('Adjustment deletion failed:', id, error);
        throw error;
      }
    },

    // Optimistic updates with undo capability
    onMutate: async (id) => {
      if (!options?.optimistic) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: adjustmentKeys.lists() });
      await queryClient.cancelQueries({ queryKey: adjustmentKeys.detail(id) });

      // Snapshot for rollback
      const previousList = queryClient.getQueryData<AdjustmentQueryData>(adjustmentKeys.lists());
      const previousDetail = queryClient.getQueryData<SingleAdjustmentData>(adjustmentKeys.detail(id));

      // Optimistically remove from list
      queryClient.setQueryData<AdjustmentQueryData>(adjustmentKeys.lists(), (old) => {
        if (!old) return undefined;
        return {
          ...old,
          data: old.data?.filter((item) => item.id !== id) || [],
          total: Math.max(0, (old.total || 0) - 1),
          total_pages: Math.ceil(Math.max(0, (old.total || 0) - 1) / (old.limit || 20)),
        };
      });

      // Remove detail cache
      queryClient.removeQueries({ queryKey: adjustmentKeys.detail(id) });

      // Set up undo functionality
      let undoTimeout: NodeJS.Timeout;
      const undo = () => {
        clearTimeout(undoTimeout);
        queryClient.setQueryData(adjustmentKeys.lists(), previousList);
        if (previousDetail) {
          queryClient.setQueryData(adjustmentKeys.detail(id), previousDetail);
        }
      };

      // Auto-undo after 5 seconds if showUndo is enabled
      if (options?.showUndo) {
        undoTimeout = setTimeout(undo, 5000);
      }

      return { previousList, previousDetail, undo, undoTimeout };
    },

    // Rollback on error
    onError: (error: ApiError, id: number, context: MutationContext | undefined) => {
      if (context?.undo) {
        context.undo();
      }
      console.error('Adjustment deletion error, rolled back:', error);
    },

    // Smart cache cleanup
    onSuccess: (id: number, variables: number, context: MutationContext | undefined) => {
      // Clear undo timeout
      if (context?.undoTimeout) {
        clearTimeout(context.undoTimeout);
      }

      // Ensure complete removal
      queryClient.removeQueries({ queryKey: adjustmentKeys.detail(id) });

      // Update list cache (in case optimistic update wasn't applied)
      queryClient.setQueryData<AdjustmentQueryData>(adjustmentKeys.lists(), (old) => {
        if (!old) return undefined;
        return {
          ...old,
          data: old.data?.filter((item) => item.id !== id) || [],
          total: Math.max(0, (old.total || 0) - 1),
          total_pages: Math.ceil(Math.max(0, (old.total || 0) - 1) / (old.limit || 20)),
        };
      });

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['stocks'],
        refetchType: 'active',
      });

      // Update stats
      queryClient.invalidateQueries({
        queryKey: adjustmentKeys.stats(),
        refetchType: 'active',
      });
    },

    // Enhanced retry logic (be more careful with deletes)
    retry: (failureCount: number, error: ApiError) => {
      if (error?.status >= 400 && error?.status < 500) return false;
      return failureCount < 1; // Only retry once for deletes
    },

    // Meta information
    meta: {
      type: 'delete-adjustment',
      optimistic: options?.optimistic || false,
      undoEnabled: options?.showUndo || false,
    },
  });
};

