/**
 * React Query Hooks for Dashboard
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/analytics.api';
import type { StockMovement } from '@/types/database';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
};

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: async () => {
      const response = await dashboardApi.getSummary();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch dashboard summary');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
};

