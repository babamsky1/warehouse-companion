import type {
    ApiResponse,
    Order,
    OrderItem,
    PaginatedResponse,
    Receiving,
    ReceivingItem,
    Return,
    ReturnItem,
    Shipment,
    ShipmentItem,
} from '@/types/database';
import apiClient from './axios';

export const receivingsApi = {
    async getAll(page: number = 1, limit: number = 10): Promise<ApiResponse<PaginatedResponse<Receiving>>> {
        const response = await apiClient.get('/operations/receivings/', {
            params: { page, limit },
        });
        return response.data;
    },
    async getById(id: number): Promise<ApiResponse<Receiving & { items: ReceivingItem[] }>> {
        const response = await apiClient.get(`/operations/receivings/${id}/`);
        return response.data;
    },
    async create(data: Partial<Receiving>): Promise<ApiResponse<Receiving>> {
        const response = await apiClient.post('/operations/receivings/', data);
        return response.data;
    },
    async update(id: number, data: Partial<Receiving>): Promise<ApiResponse<Receiving>> {
        const response = await apiClient.patch(`/operations/receivings/${id}/`, data);
        return response.data;
    },
    async delete(id: number): Promise<ApiResponse<void>> {
        const response = await apiClient.delete(`/operations/receivings/${id}/`);
        return response.data;
    },
};

export const shipmentsApi = {
    async getAll(page: number = 1, limit: number = 10): Promise<ApiResponse<PaginatedResponse<Shipment>>> {
        const response = await apiClient.get('/operations/shipments/', {
            params: { page, limit },
        });
        return response.data;
    },
    async getById(id: number): Promise<ApiResponse<Shipment & { items: ShipmentItem[] }>> {
        const response = await apiClient.get(`/operations/shipments/${id}/`);
        return response.data;
    },
    async create(data: Partial<Shipment>): Promise<ApiResponse<Shipment>> {
        const response = await apiClient.post('/operations/shipments/', data);
        return response.data;
    },
    async update(id: number, data: Partial<Shipment>): Promise<ApiResponse<Shipment>> {
        const response = await apiClient.patch(`/operations/shipments/${id}/`, data);
        return response.data;
    },
    async delete(id: number): Promise<ApiResponse<void>> {
        const response = await apiClient.delete(`/operations/shipments/${id}/`);
        return response.data;
    },
};

export const returnsApi = {
    async getAll(page: number = 1, limit: number = 10): Promise<ApiResponse<PaginatedResponse<Return>>> {
        const response = await apiClient.get('/operations/returns/', {
            params: { page, limit },
        });
        return response.data;
    },
    async getById(id: number): Promise<ApiResponse<Return & { items: ReturnItem[] }>> {
        const response = await apiClient.get(`/operations/returns/${id}/`);
        return response.data;
    },
    async create(data: Partial<Return>): Promise<ApiResponse<Return>> {
        const response = await apiClient.post('/operations/returns/', data);
        return response.data;
    },
    async update(id: number, data: Partial<Return>): Promise<ApiResponse<Return>> {
        const response = await apiClient.patch(`/operations/returns/${id}/`, data);
        return response.data;
    },
    async delete(id: number): Promise<ApiResponse<void>> {
        const response = await apiClient.delete(`/operations/returns/${id}/`);
        return response.data;
    },
};

export const ordersApi = {
    async getAll(page: number = 1, limit: number = 10): Promise<ApiResponse<PaginatedResponse<Order>>> {
        const response = await apiClient.get('/operations/orders/', {
            params: { page, limit },
        });
        return response.data;
    },
    async getById(id: number): Promise<ApiResponse<Order & { items: OrderItem[] }>> {
        const response = await apiClient.get(`/operations/orders/${id}/`);
        return response.data;
    },
    async create(data: Partial<Order>): Promise<ApiResponse<Order>> {
        const response = await apiClient.post('/operations/orders/', data);
        return response.data;
    },
    async update(id: number, data: Partial<Order>): Promise<ApiResponse<Order>> {
        const response = await apiClient.patch(`/operations/orders/${id}/`, data);
        return response.data;
    },
    async delete(id: number): Promise<ApiResponse<void>> {
        const response = await apiClient.delete(`/operations/orders/${id}/`);
        return response.data;
    },
};
