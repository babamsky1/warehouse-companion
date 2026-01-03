import type {
    Adjustment,
    ApiResponse,
    PaginatedResponse,
    Stock,
    StockBuffer,
    Transfer,
} from '@/types/database';
import apiClient from './axios';

export const stocksApi = {
    async getAll(page: number = 1, limit: number = 10): Promise<ApiResponse<PaginatedResponse<Stock>>> {
        const response = await apiClient.get('/inventory/stocks/', {
            params: { page, limit },
        });
        return response.data;
    },
    async getByWarehouse(warehouseId: number): Promise<ApiResponse<Stock[]>> {
        const response = await apiClient.get(`/inventory/stocks/`, {
            params: { warehouse_id: warehouseId },
        });
        return response.data;
    },
    async getByProduct(productId: number): Promise<ApiResponse<Stock[]>> {
        const response = await apiClient.get(`/inventory/stocks/`, {
            params: { product_id: productId },
        });
        return response.data;
    },
    async getLowStock(): Promise<ApiResponse<Stock[]>> {
        const response = await apiClient.get('/inventory/stocks/low-stock/');
        return response.data;
    },
    async getById(id: number): Promise<ApiResponse<Stock>> {
        const response = await apiClient.get(`/inventory/stocks/${id}/`);
        return response.data;
    },
    async create(data: Partial<Stock>): Promise<ApiResponse<Stock>> {
        const response = await apiClient.post('/inventory/stocks/', data);
        return response.data;
    },
    async update(id: number, data: Partial<Stock>): Promise<ApiResponse<Stock>> {
        const response = await apiClient.patch(`/inventory/stocks/${id}/`, data);
        return response.data;
    },
    async delete(id: number): Promise<ApiResponse<void>> {
        const response = await apiClient.delete(`/inventory/stocks/${id}/`);
        return response.data;
    },
};

export const stockBuffersApi = {
    async getAll(): Promise<ApiResponse<StockBuffer[]>> {
        const response = await apiClient.get('/inventory/stock-buffers/');
        return response.data;
    },
    async getByProduct(productId: number): Promise<ApiResponse<StockBuffer | null>> {
        const response = await apiClient.get(`/inventory/stock-buffers/`, {
            params: { product_id: productId },
        });
        return response.data;
    },
    async create(data: Partial<StockBuffer>): Promise<ApiResponse<StockBuffer>> {
        const response = await apiClient.post('/inventory/stock-buffers/', data);
        return response.data;
    },
    async update(id: number, data: Partial<StockBuffer>): Promise<ApiResponse<StockBuffer>> {
        const response = await apiClient.patch(`/inventory/stock-buffers/${id}/`, data);
        return response.data;
    },
    async delete(id: number): Promise<ApiResponse<void>> {
        const response = await apiClient.delete(`/inventory/stock-buffers/${id}/`);
        return response.data;
    },
};

export const adjustmentsApi = {
    async getAll(page: number = 1, limit: number = 10): Promise<ApiResponse<PaginatedResponse<Adjustment>>> {
        const response = await apiClient.get('/inventory/adjustments/', {
            params: { page, limit },
        });
        return response.data;
    },
    async getById(id: number): Promise<ApiResponse<Adjustment>> {
        const response = await apiClient.get(`/inventory/adjustments/${id}/`);
        return response.data;
    },
    async create(data: Partial<Adjustment>): Promise<ApiResponse<Adjustment>> {
        const response = await apiClient.post('/inventory/adjustments/', data);
        return response.data;
    },
    async update(id: number, data: Partial<Adjustment>): Promise<ApiResponse<Adjustment>> {
        const response = await apiClient.patch(`/inventory/adjustments/${id}/`, data);
        return response.data;
    },
    async delete(id: number): Promise<ApiResponse<void>> {
        const response = await apiClient.delete(`/inventory/adjustments/${id}/`);
        return response.data;
    },
};

export const transfersApi = {
    async getAll(page: number = 1, limit: number = 10): Promise<ApiResponse<PaginatedResponse<Transfer>>> {
        const response = await apiClient.get('/inventory/transfers/', {
            params: { page, limit },
        });
        return response.data;
    },
    async getById(id: number): Promise<ApiResponse<Transfer>> {
        const response = await apiClient.get(`/inventory/transfers/${id}/`);
        return response.data;
    },
    async create(data: Partial<Transfer>): Promise<ApiResponse<Transfer>> {
        const response = await apiClient.post('/inventory/transfers/', data);
        return response.data;
    },
    async update(id: number, data: Partial<Transfer>): Promise<ApiResponse<Transfer>> {
        const response = await apiClient.patch(`/inventory/transfers/${id}/`, data);
        return response.data;
    },
    async delete(id: number): Promise<ApiResponse<void>> {
        const response = await apiClient.delete(`/inventory/transfers/${id}/`);
        return response.data;
    },
};
