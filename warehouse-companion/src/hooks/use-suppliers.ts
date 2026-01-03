/**
 * React Query Hooks for Suppliers
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { suppliersApi } from '@/services/master.api';
import type { Supplier } from '@/types/database';

export const supplierKeys = {
  all: ['suppliers'] as const,
  lists: () => [...supplierKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...supplierKeys.lists(), filters] as const,
  details: () => [...supplierKeys.all, 'detail'] as const,
  detail: (id: number) => [...supplierKeys.details(), id] as const,
};

export const useSuppliers = (page: number = 1, limit: number = 100) => {
  return useQuery({
    queryKey: supplierKeys.list({ page, limit }),
    queryFn: async () => {
      const response = await suppliersApi.getAll(page, limit);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch suppliers');
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

export const useSupplier = (id: number | null) => {
  return useQuery({
    queryKey: supplierKeys.detail(id!),
    queryFn: async () => {
      if (!id) return null;
      const response = await suppliersApi.getById(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch supplier');
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Supplier>) => {
      const response = await suppliersApi.create(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create supplier');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Supplier> }) => {
      const response = await suppliersApi.update(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update supplier');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await suppliersApi.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete supplier');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
  });
};

