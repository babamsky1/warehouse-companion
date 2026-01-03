/**
 * React Query Hooks for Orders
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/services/operations.api';
import type { Order, OrderItem, PaginatedResponse } from '@/types/database';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: number) => [...orderKeys.details(), id] as const,
};

export const useOrders = (page: number = 1, limit: number = 50) => {
  return useQuery({
    queryKey: orderKeys.list({ page, limit }),
    queryFn: async () => {
      const response = await ordersApi.getAll(page, limit);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch orders');
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

export const useOrder = (id: number | null) => {
  return useQuery({
    queryKey: orderKeys.detail(id!),
    queryFn: async () => {
      if (!id) return null;
      const response = await ordersApi.getById(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch order');
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Order>) => {
      const response = await ordersApi.create(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create order');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Order> }) => {
      const response = await ordersApi.update(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update order');
      }
      return response.data;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: orderKeys.detail(id) });

      const previousOrder = queryClient.getQueryData<Order & { items: OrderItem[] }>(
        orderKeys.detail(id)
      );

      if (previousOrder) {
        queryClient.setQueryData<Order & { items: OrderItem[] }>(orderKeys.detail(id), {
          ...previousOrder,
          ...data,
        });
      }

      return { previousOrder };
    },
    onError: (err, variables, context) => {
      if (context?.previousOrder) {
        queryClient.setQueryData(orderKeys.detail(variables.id), context.previousOrder);
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await ordersApi.delete(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete order');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
};

