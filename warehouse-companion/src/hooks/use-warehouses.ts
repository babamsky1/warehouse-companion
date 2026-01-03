/**
 * React Query Hooks for Warehouses
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { warehousesApi } from '@/services/master.api';
import type { Warehouse } from '@/types/database';

export const warehouseKeys = {
  all: ['warehouses'] as const,
  lists: () => [...warehouseKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...warehouseKeys.lists(), filters] as const,
  details: () => [...warehouseKeys.all, 'detail'] as const,
  detail: (id: number) => [...warehouseKeys.details(), id] as const,
};

export const useWarehouses = (page: number = 1, limit: number = 100) => {
  return useQuery({
    queryKey: warehouseKeys.list({ page, limit }),
    queryFn: async () => {
      const response = await warehousesApi.getAll(page, limit);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch warehouses');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    select: (data) => ({
      ...data,
      data: data?.data || []
    }),
  });
};

export const useWarehouse = (id: number | null) => {
  return useQuery({
    queryKey: warehouseKeys.detail(id!),
    queryFn: async () => {
      if (!id) return null;
      const response = await warehousesApi.getById(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch warehouse');
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
};

export const useCreateWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Warehouse>) => {
      const response = await warehousesApi.create(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create warehouse');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
    },
  });
};

export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Warehouse> }) => {
      const response = await warehousesApi.update(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update warehouse');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
    },
  });
};

export const useDeleteWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await warehousesApi.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete warehouse');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
    },
  });
};

