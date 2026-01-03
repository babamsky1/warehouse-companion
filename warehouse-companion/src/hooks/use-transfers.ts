/**
 * React Query Hooks for Transfers
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transfersApi } from '@/services/inventory.api';
import type { Transfer, PaginatedResponse } from '@/types/database';

export const transferKeys = {
  all: ['transfers'] as const,
  lists: () => [...transferKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...transferKeys.lists(), filters] as const,
  details: () => [...transferKeys.all, 'detail'] as const,
  detail: (id: number) => [...transferKeys.details(), id] as const,
};

export const useTransfers = (page: number = 1, limit: number = 50) => {
  return useQuery({
    queryKey: transferKeys.list({ page, limit }),
    queryFn: async () => {
      const response = await transfersApi.getAll(page, limit);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch transfers');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
    select: (data) => ({
      ...data,
      data: data?.data || []
    }),
  });
};

export const useTransfer = (id: number | null) => {
  return useQuery({
    queryKey: transferKeys.detail(id!),
    queryFn: async () => {
      if (!id) return null;
      const response = await transfersApi.getById(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch transfer');
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Transfer>) => {
      const response = await transfersApi.create(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create transfer');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transferKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['stocks'] }); // Transfers affect stock levels
    },
  });
};

export const useUpdateTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Transfer> }) => {
      const response = await transfersApi.update(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update transfer');
      }
      return response.data;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: transferKeys.detail(id) });

      const previousTransfer = queryClient.getQueryData<Transfer>(transferKeys.detail(id));

      if (previousTransfer) {
        queryClient.setQueryData<Transfer>(transferKeys.detail(id), {
          ...previousTransfer,
          ...data,
        });
      }

      return { previousTransfer };
    },
    onError: (err, variables, context) => {
      if (context?.previousTransfer) {
        queryClient.setQueryData(transferKeys.detail(variables.id), context.previousTransfer);
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: transferKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: transferKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
    },
  });
};

export const useDeleteTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await transfersApi.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete transfer');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transferKeys.lists() });
    },
  });
};

