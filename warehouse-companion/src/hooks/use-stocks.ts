/**
 * React Query Hooks for Stocks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { stocksApi } from '@/services/inventory.api';
import type { Stock, PaginatedResponse } from '@/types/database';

export const stockKeys = {
  all: ['stocks'] as const,
  lists: () => [...stockKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...stockKeys.lists(), filters] as const,
  details: () => [...stockKeys.all, 'detail'] as const,
  detail: (id: number) => [...stockKeys.details(), id] as const,
  byWarehouse: (warehouseId: number) => [...stockKeys.all, 'warehouse', warehouseId] as const,
  byProduct: (productId: number) => [...stockKeys.all, 'product', productId] as const,
  lowStock: () => [...stockKeys.all, 'low-stock'] as const,
};

export const useStocks = (page: number = 1, limit: number = 50) => {
  return useQuery({
    queryKey: stockKeys.list({ page, limit }),
    queryFn: async () => {
      const response = await stocksApi.getAll(page, limit);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch stocks');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes (stocks change frequently)
    select: (data) => ({
      ...data,
      data: data?.data || []
    }),
  });
};

export const useStocksByWarehouse = (warehouseId: number | null) => {
  return useQuery({
    queryKey: stockKeys.byWarehouse(warehouseId!),
    queryFn: async () => {
      if (!warehouseId) return [];
      const response = await stocksApi.getByWarehouse(warehouseId);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch stocks');
      }
      return response.data;
    },
    enabled: !!warehouseId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useStocksByProduct = (productId: number | null) => {
  return useQuery({
    queryKey: stockKeys.byProduct(productId!),
    queryFn: async () => {
      if (!productId) return [];
      const response = await stocksApi.getByProduct(productId);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch stocks');
      }
      return response.data;
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useLowStock = () => {
  return useQuery({
    queryKey: stockKeys.lowStock(),
    queryFn: async () => {
      const response = await stocksApi.getLowStock();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch low stock items');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
};

export const useStock = (id: number | null) => {
  return useQuery({
    queryKey: stockKeys.detail(id!),
    queryFn: async () => {
      if (!id) return null;
      const response = await stocksApi.getById(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch stock');
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
};

export const useUpdateStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Stock> }) => {
      const response = await stocksApi.update(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update stock');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: stockKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: stockKeys.lists() });
      queryClient.invalidateQueries({ queryKey: stockKeys.lowStock() });
    },
  });
};

