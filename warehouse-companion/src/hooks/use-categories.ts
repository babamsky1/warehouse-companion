/**
 * React Query Hooks for Categories
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '@/services/master.api';
import type { Category } from '@/types/database';

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: number) => [...categoryKeys.details(), id] as const,
};

export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: async () => {
      const response = await categoriesApi.getAll();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch categories');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes (categories don't change often)
  });
};

export const useCategory = (id: number | null) => {
  return useQuery({
    queryKey: categoryKeys.detail(id!),
    queryFn: async () => {
      if (!id) return null;
      const response = await categoriesApi.getById(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch category');
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Category>) => {
      const response = await categoriesApi.create(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create category');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Category> }) => {
      const response = await categoriesApi.update(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update category');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await categoriesApi.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete category');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};

