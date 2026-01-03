import { useEffect, useState, useCallback } from 'react';

/**
 * useDebounce Hook
 *
 * Debounces a value by delaying updates until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 *
 * Performance benefits:
 * - Reduces API calls during rapid typing
 * - Prevents excessive re-renders
 * - Improves user experience with smoother interactions
 *
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes (also on delay change or unmount)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useDebouncedCallback Hook
 *
 * Creates a debounced version of a callback function.
 * Useful for search handlers that should only execute after user stops typing.
 *
 * @param callback - The callback function to debounce
 * @param delay - The delay in milliseconds (default: 300ms)
 * @param deps - Dependencies array for the callback
 * @returns The debounced callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300,
  deps: React.DependencyList = []
): T {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const newTimer = setTimeout(() => {
        callback(...args);
      }, delay);

      setDebounceTimer(newTimer);
    }) as T,
    [callback, delay, ...deps]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return debouncedCallback;
}

/**
 * useDebouncedSearch Hook
 *
 * Specialized hook for search functionality with debouncing.
 * Automatically handles search state and provides debounced search value.
 *
 * Usage:
 * ```tsx
 * const { searchValue, setSearchValue, debouncedSearchValue } = useDebouncedSearch();
 *
 * // Use searchValue for immediate UI updates (optional)
 * // Use debouncedSearchValue for API calls
 * ```
 */
export function useDebouncedSearch(initialValue: string = '', delay: number = 300) {
  const [searchValue, setSearchValue] = useState(initialValue);
  const debouncedSearchValue = useDebounce(searchValue, delay);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchValue('');
  }, []);

  return {
    searchValue,
    debouncedSearchValue,
    setSearchValue: handleSearchChange,
    clearSearch,
  };
}
