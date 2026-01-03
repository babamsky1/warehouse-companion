/**
 * React Query Hooks for Stock Outs (Withdrawals)
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/axios';
import type { StockOut, PaginatedResponse, ApiResponse } from '@/types/database';

export const stockOutKeys = {
  all: ['stock-outs'] as const,
  lists: () => [...stockOutKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...stockOutKeys.lists(), filters] as const,
  details: () => [...stockOutKeys.all, 'detail'] as const,
  detail: (id: number) => [...stockOutKeys.details(), id] as const,
};

export const useStockOuts = (page: number = 1, limit: number = 50) => {
  return useQuery({
    queryKey: stockOutKeys.list({ page, limit }),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<StockOut>>>('/inventory/stock-outs/', {
        params: { page, limit },
      });
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch stock outs');
      }
      return response.data.data;
    },
    staleTime: 1000 * 60 * 2,
    select: (data) => ({
      ...data,
      data: data?.data || []
    }),
  });
};

export const useCreateStockOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<StockOut>) => {
      const response = await apiClient.post<ApiResponse<StockOut>>('/inventory/stock-outs/', data);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to create stock out');
      }
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockOutKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
    },
  });
};

export const useUpdateStockOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<StockOut> }) => {
      const response = await apiClient.patch<ApiResponse<StockOut>>(`/inventory/stock-outs/${id}/`, data);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to update stock out');
      }
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: stockOutKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: stockOutKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
    },
  });
};

export const useDeleteStockOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete<ApiResponse<void>>(`/inventory/stock-outs/${id}/`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete stock out');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockOutKeys.lists() });
    },
  });
};

