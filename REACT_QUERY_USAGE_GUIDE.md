# React Query Usage Guide for WMS

This guide provides comprehensive instructions for using React Query with the WMS mock data APIs and real database integration.

## 🔧 Setup & Configuration

### QueryProvider Configuration

The app is pre-configured with optimized React Query settings:

```tsx
// providers/QueryProvider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,    // 5 minutes
      gcTime: 1000 * 60 * 30,      // 30 minutes
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
      retry: (failureCount, error) => {
        if (error?.status >= 400) return false; // Don't retry 4xx errors
        return failureCount < 3;
      },
    },
    mutations: {
      retry: (failureCount, error) => {
        if (error?.status >= 400) return false;
        return failureCount < 2;
      },
    },
  },
});
```

### Available Hooks

All React Query hooks are exported from `@/hooks`:

```tsx
import {
  useUsers,
  useProducts,
  useDashboard,
  useDebounce,
  useSearch,
  // ... other hooks
} from '@/hooks';
```

## 📊 Data Fetching Patterns

### 1. Basic Data Fetching

```tsx
function UsersList() {
  const { data: users, isLoading, error } = useUsers();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {users?.data.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### 2. Paginated Data

```tsx
function ProductsList() {
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', page, pageSize],
    queryFn: () => api.getProducts({ page, limit: pageSize }),
    keepPreviousData: true, // Smooth pagination
  });

  return (
    <div>
      {/* Products list */}
      <button
        onClick={() => setPage(p => p - 1)}
        disabled={page === 1}
      >
        Previous
      </button>
      <span>Page {page}</span>
      <button
        onClick={() => setPage(p => p + 1)}
        disabled={!products?.hasNext}
      >
        Next
      </button>
    </div>
  );
}
```

### 3. Search with Debouncing

```tsx
function SearchableUsers() {
  // Debounced search hook
  const { searchValue, debouncedSearchValue, setSearchValue } = useDebouncedSearch();

  // React Query with debounced search
  const { data: users, isLoading } = useQuery({
    queryKey: ['users', 'search', debouncedSearchValue],
    queryFn: () => api.searchUsers(debouncedSearchValue),
    enabled: debouncedSearchValue.length > 0, // Only search when there's input
  });

  return (
    <div>
      <input
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Search users..."
      />
      {isLoading ? (
        <div>Searching...</div>
      ) : (
        <div>
          {users?.map(user => (
            <div key={user.id}>{user.name}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 4. Optimistic Updates

```tsx
function EditableUser({ userId }: { userId: number }) {
  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: api.updateUser,
    onMutate: async (newUser) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['users', userId] });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData(['users', userId]);

      // Optimistically update cache
      queryClient.setQueryData(['users', userId], newUser);

      return { previousUser };
    },
    onError: (err, newUser, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(['users', userId], context.previousUser);
      }
    },
    onSettled: () => {
      // Always refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
    },
  });

  const handleUpdate = (userData: any) => {
    updateUserMutation.mutate({ id: userId, ...userData });
  };

  return (
    <form onSubmit={handleUpdate}>
      {/* Form fields */}
      <button type="submit" disabled={updateUserMutation.isLoading}>
        {updateUserMutation.isLoading ? 'Updating...' : 'Update'}
      </button>
    </form>
  );
}
```

## 🔍 Advanced Patterns

### 1. Dependent Queries

```tsx
function UserDetails({ userId }: { userId: number }) {
  // Only fetch user details when userId is available
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.getUser(userId),
    enabled: !!userId, // Dependent on userId
  });

  // Fetch user's orders only after user is loaded
  const { data: orders } = useQuery({
    queryKey: ['user', userId, 'orders'],
    queryFn: () => api.getUserOrders(userId),
    enabled: !!user?.id, // Dependent on user data
  });

  if (!user) return <div>Select a user</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <h3>Orders:</h3>
      {orders?.map(order => (
        <div key={order.id}>{order.title}</div>
      ))}
    </div>
  );
}
```

### 2. Background Refetching

```tsx
function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: api.getDashboardStats,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchIntervalInBackground: true, // Continue when tab is not focused
  });

  return (
    <div>
      <h1>Dashboard</h1>
      <div>Active Users: {stats?.activeUsers}</div>
      <div>Total Sales: ${stats?.totalSales}</div>
    </div>
  );
}
```

### 3. Infinite Scrolling

```tsx
function InfiniteProducts() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['products', 'infinite'],
    queryFn: ({ pageParam = 1 }) => api.getProducts({ page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.data.map(product => (
            <div key={product.id}>{product.name}</div>
          ))}
        </div>
      ))}

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading more...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

## 🎯 Custom Hooks

### useDebouncedSearch

```tsx
const { searchValue, debouncedSearchValue, setSearchValue, clearSearch } = useDebouncedSearch(initialValue, delay);
```

### useSearchQuery

```tsx
const { searchValue, debouncedSearchValue, setSearchValue, data, isLoading } = useSearchQuery(
  (search) => ['items', search], // Query key function
  (search) => api.searchItems(search), // API function
  { debounceDelay: 300 } // Options
);
```

### useOptimizedSearch

```tsx
// Automatically chooses between local filtering and server search
const searchResult = useOptimizedSearch(data, serverSearchFn, threshold);
```

## 🚨 Error Handling

### Global Error Handling

```tsx
// In QueryProvider
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 3;
      },
      onError: (error) => {
        // Global error handling
        console.error('Query error:', error);
        // Show toast notification
        toast.error('Failed to load data');
      },
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation error:', error);
        toast.error('Operation failed');
      },
    },
  },
});
```

### Query-Level Error Handling

```tsx
function ProductsList() {
  const { data, error, isError, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: api.getProducts,
    onError: (error) => {
      // Specific error handling for this query
      trackError('products_fetch_failed', error);
    },
  });

  if (isError) {
    return (
      <div>
        <p>Failed to load products: {error.message}</p>
        <button onClick={() => refetch()}>Try Again</button>
      </div>
    );
  }

  return <div>{/* Products list */}</div>;
}
```

## 🔄 Cache Management

### Manual Cache Updates

```tsx
const queryClient = useQueryClient();

// Update specific query
queryClient.setQueryData(['users', userId], newUserData);

// Invalidate queries
queryClient.invalidateQueries({ queryKey: ['users'] });

// Remove from cache
queryClient.removeQueries({ queryKey: ['users', userId] });

// Prefetch data
queryClient.prefetchQuery({
  queryKey: ['users', userId],
  queryFn: () => api.getUser(userId),
});
```

### Cache Invalidation Patterns

```tsx
// Invalidate all user-related queries
queryClient.invalidateQueries({ queryKey: ['users'], exact: false });

// Invalidate specific user
queryClient.invalidateQueries({ queryKey: ['users', userId] });

// Invalidate and refetch
queryClient.invalidateQueries({
  queryKey: ['users'],
  refetchType: 'active', // Only refetch active queries
});
```

## 📈 Performance Monitoring

### React Query DevTools

```tsx
// Automatically included in development
<ReactQueryDevtools initialIsOpen={false} />
```

### Query Performance Logging

```tsx
// In QueryProvider - automatic performance monitoring
queryClient.getQueryCache().subscribe((event) => {
  if (event.type === 'updated') {
    const query = event.query;
    const duration = Date.now() - query.state.dataUpdatedAt;

    if (duration > 2000) {
      console.warn(`Slow query: ${query.queryKey} took ${duration}ms`);
    }
  }
});
```

### Cache Hit Monitoring

```tsx
// Monitor cache effectiveness
const cacheStats = {
  hits: 0,
  misses: 0,
};

queryClient.getQueryCache().subscribe((event) => {
  if (event.query.state.status === 'success') {
    if (event.query.state.data) {
      cacheStats.hits++;
    } else {
      cacheStats.misses++;
    }
  }
});
```

## 🔧 API Integration Examples

### Mock Data Endpoints

```tsx
// services/api.ts
const API_BASE = '/api/mock';

export const api = {
  // Users
  getUsers: (params?: any) =>
    axios.get(`${API_BASE}/users/`, { params }),

  searchUsers: (search: string) =>
    axios.get(`${API_BASE}/users/`, { params: { search } }),

  // Products
  getProducts: (params?: any) =>
    axios.get(`${API_BASE}/products/`, { params }),

  // Dashboard
  getDashboard: () =>
    axios.get(`${API_BASE}/dashboard/`),

  // Settings
  getSettings: () =>
    axios.get(`${API_BASE}/settings/`),

  updateSettings: (settings: any) =>
    axios.post(`${API_BASE}/settings/update/`, { settings }),
};
```

### Real Database Integration

When switching to real Django REST Framework endpoints:

```tsx
// Update API calls
export const api = {
  getUsers: (params?: any) =>
    axios.get('/api/users/', { params }), // Remove /mock/

  // All other endpoints follow the same pattern
};
```

### Authentication Headers

```tsx
// Add auth headers for protected endpoints
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Authorization': `Bearer ${getAuthToken()}`,
  },
});
```

## 🎯 Best Practices

### Query Key Patterns

```tsx
// Good: Descriptive and hierarchical
['users']                    // All users
['users', userId]           // Specific user
['users', userId, 'posts']  // User's posts
['products', { search, category }] // Filtered products

// Bad: Non-descriptive
['data']
['query1']
['stuff']
```

### Mutation Patterns

```tsx
// Use descriptive mutation keys
const createUserMutation = useMutation({
  mutationFn: api.createUser,
  mutationKey: ['users', 'create'], // For tracking/loading states
});

// Invalidate related queries on success
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['users'] });
},
```

### Loading States

```tsx
function SmartLoading({ isLoading, error, children }) {
  if (isLoading) return <SkeletonLoader />;
  if (error) return <ErrorMessage error={error} />;
  return children;
}

// Usage
<SmartLoading isLoading={isLoading} error={error}>
  <UserList users={data} />
</SmartLoading>
```

This guide provides everything needed to effectively use React Query in the WMS application with both mock data and real database integration.
