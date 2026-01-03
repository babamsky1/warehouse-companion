/**
 * React Query Hooks for Users
 */

import { authApi } from '@/services/auth.api';
import { useQuery } from '@tanstack/react-query';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: async () => {
      const response = await authApi.getUsers();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch users');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useUser = (id: number | null) => {
  return useQuery({
    queryKey: userKeys.detail(id!),
    queryFn: async () => {
      if (!id) return null;
      const response = await authApi.getUserById(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch user');
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
};

