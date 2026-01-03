import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce, useDebouncedSearch } from './use-debounce';
import { useCallback, useMemo } from 'react';

/**
 * useSearchQuery Hook
 *
 * Combines debounced search with React Query for optimal API search performance.
 *
 * Features:
 * - Debounced search input to prevent excessive API calls
 * - Automatic query invalidation and refetching
 * - Placeholder data for instant UI feedback
 * - Optimistic updates support
 *
 * @param queryKey - The query key for React Query
 * @param searchApiFn - The API function that accepts search parameters
 * @param options - Additional query options
 */
export function useSearchQuery<TData = unknown, TError = unknown>(
  queryKey: (searchTerm: string) => readonly unknown[],
  searchApiFn: (searchTerm: string) => Promise<TData>,
  options: {
    debounceDelay?: number;
    enabled?: boolean;
    placeholderData?: TData | ((previousData: TData | undefined) => TData | undefined);
    staleTime?: number;
    cacheTime?: number;
  } = {}
) {
  const {
    debounceDelay = 300,
    enabled = true,
    placeholderData,
    staleTime = 1000 * 60 * 5, // 5 minutes
    cacheTime = 1000 * 60 * 30, // 30 minutes
  } = options;

  // Debounced search state
  const { searchValue, debouncedSearchValue, setSearchValue, clearSearch } = useDebouncedSearch('', debounceDelay);

  // React Query with debounced search
  const query = useQuery({
    queryKey: queryKey(debouncedSearchValue),
    queryFn: () => searchApiFn(debouncedSearchValue),
    enabled: enabled && debouncedSearchValue.length >= 0, // Allow empty search
    staleTime,
    gcTime: cacheTime,
    placeholderData,
    // Optimize for search - don't refetch on window focus for search results
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Keep previous data while loading new search results
    keepPreviousData: true,
  });

  return {
    // Search state
    searchValue,
    debouncedSearchValue,
    setSearchValue,
    clearSearch,
    // Query state
    data: query.data,
    isLoading: query.isLoading,
    isError: query.error,
    isFetching: query.isFetching,
    isPreviousData: query.isPreviousData,
    // Utility functions
    refetch: query.refetch,
  };
}

/**
 * useInstantSearch Hook
 *
 * Provides instant search with local filtering and optional server-side search.
 * Best for small to medium datasets that can be filtered client-side.
 *
 * @param data - The full dataset to search through
 * @param searchFields - Fields to search in (defaults to all string fields)
 * @param serverSearchFn - Optional server-side search function for large datasets
 */
export function useInstantSearch<T extends Record<string, any>>(
  data: T[],
  searchFields?: (keyof T)[],
  serverSearchFn?: (searchTerm: string) => Promise<T[]>,
  debounceDelay: number = 150 // Faster for instant search
) {
  const { searchValue, debouncedSearchValue, setSearchValue, clearSearch } = useDebouncedSearch('', debounceDelay);

  // Determine search fields automatically if not provided
  const fieldsToSearch = useMemo(() => {
    if (searchFields) return searchFields;
    // Auto-detect string fields from first item
    if (data.length > 0) {
      return Object.keys(data[0]).filter(key => {
        const value = data[0][key];
        return typeof value === 'string' || typeof value === 'number';
      }) as (keyof T)[];
    }
    return [];
  }, [data, searchFields]);

  // Local filtering
  const filteredData = useMemo(() => {
    if (!debouncedSearchValue) return data;

    const searchLower = debouncedSearchValue.toLowerCase();
    return data.filter(item => {
      return fieldsToSearch.some(field => {
        const value = item[field];
        return value != null && String(value).toLowerCase().includes(searchLower);
      });
    });
  }, [data, debouncedSearchValue, fieldsToSearch]);

  // Optional server-side search
  const serverQuery = useQuery({
    queryKey: ['server-search', debouncedSearchValue],
    queryFn: () => serverSearchFn!(debouncedSearchValue),
    enabled: !!serverSearchFn && debouncedSearchValue.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  return {
    // Search state
    searchValue,
    debouncedSearchValue,
    setSearchValue,
    clearSearch,
    // Results
    filteredData: serverSearchFn ? serverQuery.data || [] : filteredData,
    totalCount: data.length,
    filteredCount: serverSearchFn ? (serverQuery.data?.length || 0) : filteredData.length,
    // Loading states
    isSearching: serverQuery.isFetching,
    hasServerResults: !!serverSearchFn,
  };
}

/**
 * useOptimizedSearch Hook
 *
 * Smart search hook that automatically chooses between local and server search
 * based on dataset size for optimal performance.
 *
 * - Small datasets (< 1000 items): Local instant search
 * - Large datasets (>= 1000 items): Server-side search with debouncing
 */
export function useOptimizedSearch<T extends Record<string, any>>(
  data: T[],
  serverSearchFn?: (searchTerm: string) => Promise<T[]>,
  threshold: number = 1000
) {
  const shouldUseServerSearch = data.length >= threshold;

  if (shouldUseServerSearch && serverSearchFn) {
    return useSearchQuery(
      (searchTerm) => ['optimized-search', searchTerm],
      serverSearchFn,
      { debounceDelay: 300 }
    );
  }

  return useInstantSearch(data, undefined, undefined, 150);
}
