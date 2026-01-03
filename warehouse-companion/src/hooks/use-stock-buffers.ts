/**
 * React Query Hooks for Stock Buffers
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { stockBuffersApi } from '@/services/inventory.api';
import type { StockBuffer } from '@/types/database';

export const stockBufferKeys = {
  all: ['stock-buffers'] as const,
  lists: () => [...stockBufferKeys.all, 'list'] as const,
  details: () => [...stockBufferKeys.all, 'detail'] as const,
  detail: (id: number) => [...stockBufferKeys.details(), id] as const,
  byProduct: (productId: number) => [...stockBufferKeys.all, 'product', productId] as const,
};

export const useStockBuffers = () => {
  return useQuery({
    queryKey: stockBufferKeys.lists(),
    queryFn: async () => {
      const response = await stockBuffersApi.getAll();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch stock buffers');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useStockBufferByProduct = (productId: number | null) => {
  return useQuery({
    queryKey: stockBufferKeys.byProduct(productId!),
    queryFn: async () => {
      if (!productId) return null;
      const response = await stockBuffersApi.getByProduct(productId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch stock buffer');
      }
      return response.data;
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 10,
  });
};

export const useCreateStockBuffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<StockBuffer>) => {
      const response = await stockBuffersApi.create(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create stock buffer');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockBufferKeys.lists() });
    },
  });
};

export const useUpdateStockBuffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<StockBuffer> }) => {
      const response = await stockBuffersApi.update(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update stock buffer');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: stockBufferKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: stockBufferKeys.lists() });
    },
  });
};

export const useDeleteStockBuffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await stockBuffersApi.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete stock buffer');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockBufferKeys.lists() });
    },
  });
};

