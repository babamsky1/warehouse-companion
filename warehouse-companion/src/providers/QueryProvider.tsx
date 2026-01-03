import { QueryClient, QueryClientProvider, focusManager, onlineManager } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const IS_DEV = import.meta.env.DEV;

// Ultra-optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Intelligent stale times based on data volatility
      staleTime: 1000 * 60 * 5, // 5 minutes default
      // Aggressive garbage collection for memory efficiency
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)

      // Smart retry strategy with exponential backoff
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) return false;
        // Retry up to 3 times for server errors and network issues
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Optimized refetch behavior - REDUCED for better performance
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
      refetchOnReconnect: false, // Don't auto-refetch on reconnect (user can refresh manually)
      refetchOnMount: false, // Don't refetch on mount unless explicitly stale

      // Background updates for better UX
      refetchInterval: false, // Disable by default, enable per query if needed
      refetchIntervalInBackground: true,

      // Network-aware behavior
      networkMode: 'online', // Only fetch when online

      // Placeholder data for instant loading
      placeholderData: (previousData) => previousData,

      // Suspense support for better loading UX
      suspense: false, // Enable per component if needed
    },
    mutations: {
      // Optimized mutation retry strategy
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 2;
      },
      retryDelay: 1000,

      // Global mutation callbacks for loading states
      onMutate: async () => {
        // Global loading state management
        return { startTime: Date.now() };
      },

      onSettled: (data, error, variables, context) => {
        // Log mutation performance
        if (IS_DEV && context?.startTime) {
          const duration = Date.now() - context.startTime;
          if (duration > 1000) {
            console.warn(`Slow mutation (${duration}ms):`, variables);
          }
        }
      },
    },
  },
});

// Performance monitoring in development
if (IS_DEV) {
  // Monitor query cache performance
  queryClient.getQueryCache().subscribe((event) => {
    if (event.type === 'updated') {
      const query = event.query;
      const state = query.state;

      // Log slow queries
      if (state.status === 'success' && state.dataUpdatedAt) {
        const duration = Date.now() - state.dataUpdatedAt;
        if (duration > 2000) {
          console.warn(`🚨 Slow query (${duration}ms):`, query.queryKey, {
            fetchStatus: state.fetchStatus,
            error: state.error,
          });
        }
      }

      // Log cache misses
      if (state.status === 'loading' && !state.data) {
        console.log('💾 Cache miss:', query.queryKey);
      }
    }
  });

  // Monitor mutation performance
  queryClient.getMutationCache().subscribe((event) => {
    if (event.type === 'updated') {
      const mutation = event.mutation;
      if (mutation.state.status === 'success') {
        console.log('✅ Mutation completed:', mutation.options.mutationKey);
      }
    }
  });
}

// Network-aware focus management for mobile optimization
if (typeof window !== 'undefined') {
  // Smart focus management - only refetch when truly focused and online
  focusManager.setEventListener((callback) => {
    const handleFocus = () => {
      if (onlineManager.isOnline()) {
        callback();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  });

  // Online/offline awareness
  onlineManager.setEventListener((setOnline) => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });
}

// Background sync for critical data
const setupBackgroundSync = () => {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      // Register background sync for critical updates
      registration.sync.register('background-sync-adjustments');
      registration.sync.register('background-sync-stocks');
    });
  }
};

// Initialize background sync on mount
if (typeof window !== 'undefined') {
  setupBackgroundSync();
}

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {IS_DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};
