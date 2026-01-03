/**
 * React Query Hooks for Products
 * Provides query and mutation hooks with optimistic updates
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/services/master.api';
import type { Product, PaginatedResponse, ApiResponse } from '@/types/database';

// Query Keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
  search: (query: string) => [...productKeys.all, 'search', query] as const,
};

// Queries
export const useProducts = (page: number = 1, limit: number = 50) => {
  return useQuery({
    queryKey: productKeys.list({ page, limit }),
    queryFn: async () => {
      const response = await productsApi.getAll(page, limit);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch products');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => ({
      ...data,
      data: data?.data || []
    }),
  });
};

export const useProduct = (id: number | null) => {
  return useQuery({
    queryKey: productKeys.detail(id!),
    queryFn: async () => {
      if (!id) return null;
      const response = await productsApi.getById(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch product');
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSearchProducts = (query: string) => {
  return useQuery({
    queryKey: productKeys.search(query),
    queryFn: async () => {
      const response = await productsApi.search(query);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to search products');
      }
      return response.data;
    },
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 2,
    select: (data) => ({
      ...data,
      data: data?.data || []
    }),
  });
};

// Mutations
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Product>) => {
      const response = await productsApi.create(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create product');
      }
      return response.data;
    },
    onMutate: async (newProduct) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: productKeys.lists() });

      // Snapshot previous value
      const previousProducts = queryClient.getQueryData<PaginatedResponse<Product>>(
        productKeys.list({ page: 1, limit: 10 })
      );

      // Optimistically update
      if (previousProducts) {
        queryClient.setQueryData<PaginatedResponse<Product>>(
          productKeys.list({ page: 1, limit: 10 }),
          {
            ...previousProducts,
            data: [newProduct as Product, ...previousProducts.data],
            total: previousProducts.total + 1,
          }
        );
      }

      return { previousProducts };
    },
    onError: (err, newProduct, context) => {
      // Rollback on error
      if (context?.previousProducts) {
        queryClient.setQueryData(
          productKeys.list({ page: 1, limit: 10 }),
          context.previousProducts
        );
      }
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Product> }) => {
      const response = await productsApi.update(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update product');
      }
      return response.data;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: productKeys.detail(id) });

      const previousProduct = queryClient.getQueryData<Product>(productKeys.detail(id));

      // Optimistically update
      if (previousProduct) {
        queryClient.setQueryData<Product>(productKeys.detail(id), {
          ...previousProduct,
          ...data,
        });
      }

      return { previousProduct };
    },
    onError: (err, variables, context) => {
      if (context?.previousProduct) {
        queryClient.setQueryData(productKeys.detail(variables.id), context.previousProduct);
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await productsApi.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete product');
      }
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: productKeys.lists() });

      const previousProducts = queryClient.getQueriesData<PaginatedResponse<Product>>({
        queryKey: productKeys.lists(),
      });

      // Optimistically remove from all lists
      previousProducts.forEach(([queryKey, data]) => {
        if (data) {
          queryClient.setQueryData<PaginatedResponse<Product>>(queryKey, {
            ...data,
            data: data.data.filter((p) => p.id !== id),
            total: data.total - 1,
          });
        }
      });

      return { previousProducts };
    },
    onError: (err, id, context) => {
      // Rollback
      context?.previousProducts.forEach(([queryKey, data]) => {
        if (data) {
          queryClient.setQueryData(queryKey, data);
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

