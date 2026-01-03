/**
 * React Query Hooks for Receivings
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { receivingsApi } from '@/services/operations.api';
import type { Receiving, PaginatedResponse } from '@/types/database';

export const receivingKeys = {
  all: ['receivings'] as const,
  lists: () => [...receivingKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...receivingKeys.lists(), filters] as const,
  details: () => [...receivingKeys.all, 'detail'] as const,
  detail: (id: number) => [...receivingKeys.details(), id] as const,
};

export const useReceivings = (page: number = 1, limit: number = 50) => {
  return useQuery({
    queryKey: receivingKeys.list({ page, limit }),
    queryFn: async () => {
      const response = await receivingsApi.getAll(page, limit);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch receivings');
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

export const useReceiving = (id: number | null) => {
  return useQuery({
    queryKey: receivingKeys.detail(id!),
    queryFn: async () => {
      if (!id) return null;
      const response = await receivingsApi.getById(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch receiving');
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateReceiving = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Receiving>) => {
      const response = await receivingsApi.create(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create receiving');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receivingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
    },
  });
};

export const useUpdateReceiving = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Receiving> }) => {
      const response = await receivingsApi.update(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update receiving');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: receivingKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: receivingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
    },
  });
};

export const useDeleteReceiving = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await receivingsApi.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete receiving');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receivingKeys.lists() });
    },
  });
};

