import type {
    ApiResponse,
    Category,
    Location,
    PaginatedResponse,
    Product,
    Supplier,
    Warehouse,
} from '@/types/database';
import apiClient from './axios';

export const categoriesApi = {
    async getAll(): Promise<ApiResponse<Category[]>> {
        const response = await apiClient.get('/master/categories/');
        return response.data;
    },
    async getById(id: number): Promise<ApiResponse<Category>> {
        const response = await apiClient.get(`/master/categories/${id}/`);
        return response.data;
    },
    async create(data: Partial<Category>): Promise<ApiResponse<Category>> {
        const response = await apiClient.post('/master/categories/', data);
        return response.data;
    },
    async update(id: number, data: Partial<Category>): Promise<ApiResponse<Category>> {
        const response = await apiClient.patch(`/master/categories/${id}/`, data);
        return response.data;
    },
    async delete(id: number): Promise<ApiResponse<void>> {
        const response = await apiClient.delete(`/master/categories/${id}/`);
        return response.data;
    },
};

export const productsApi = {
    async getAll(page: number = 1, limit: number = 10): Promise<ApiResponse<PaginatedResponse<Product>>> {
        const response = await apiClient.get('/master/products/', {
            params: { page, limit },
        });
        return response.data;
    },
    async getById(id: number): Promise<ApiResponse<Product>> {
        const response = await apiClient.get(`/master/products/${id}/`);
        return response.data;
    },
    async searchBySku(sku: string): Promise<ApiResponse<Product>> {
        const response = await apiClient.get('/master/products/', {
            params: { sku },
        });
        return response.data;
    },
    async search(query: string): Promise<ApiResponse<PaginatedResponse<Product>>> {
        const response = await apiClient.get('/master/products/', {
            params: { search: query },
        });
        return response.data;
    },
    async create(data: Partial<Product>): Promise<ApiResponse<Product>> {
        const response = await apiClient.post('/master/products/', data);
        return response.data;
    },
    async update(id: number, data: Partial<Product>): Promise<ApiResponse<Product>> {
        const response = await apiClient.patch(`/master/products/${id}/`, data);
        return response.data;
    },
    async delete(id: number): Promise<ApiResponse<void>> {
        const response = await apiClient.delete(`/master/products/${id}/`);
        return response.data;
    },
};

export const warehousesApi = {
    async getAll(): Promise<ApiResponse<Warehouse[]>> {
        const response = await apiClient.get('/master/warehouses/');
        return response.data;
    },
    async getById(id: number): Promise<ApiResponse<Warehouse>> {
        const response = await apiClient.get(`/master/warehouses/${id}/`);
        return response.data;
    },
    async create(data: Partial<Warehouse>): Promise<ApiResponse<Warehouse>> {
        const response = await apiClient.post('/master/warehouses/', data);
        return response.data;
    },
    async update(id: number, data: Partial<Warehouse>): Promise<ApiResponse<Warehouse>> {
        const response = await apiClient.patch(`/master/warehouses/${id}/`, data);
        return response.data;
    },
    async delete(id: number): Promise<ApiResponse<void>> {
        const response = await apiClient.delete(`/master/warehouses/${id}/`);
        return response.data;
    },
};

export const locationsApi = {
    async getByWarehouse(warehouseId: number): Promise<ApiResponse<Location[]>> {
        const response = await apiClient.get('/master/locations/', {
            params: { warehouse_id: warehouseId },
        });
        return response.data;
    },
    async getById(id: number): Promise<ApiResponse<Location>> {
        const response = await apiClient.get(`/master/locations/${id}/`);
        return response.data;
    },
    async create(data: Partial<Location>): Promise<ApiResponse<Location>> {
        const response = await apiClient.post('/master/locations/', data);
        return response.data;
    },
    async update(id: number, data: Partial<Location>): Promise<ApiResponse<Location>> {
        const response = await apiClient.patch(`/master/locations/${id}/`, data);
        return response.data;
    },
    async delete(id: number): Promise<ApiResponse<void>> {
        const response = await apiClient.delete(`/master/locations/${id}/`);
        return response.data;
    },
};

export const suppliersApi = {
    async getAll(): Promise<ApiResponse<Supplier[]>> {
        const response = await apiClient.get('/master/suppliers/');
        return response.data;
    },
    async getById(id: number): Promise<ApiResponse<Supplier>> {
        const response = await apiClient.get(`/master/suppliers/${id}/`);
        return response.data;
    },
    async create(data: Partial<Supplier>): Promise<ApiResponse<Supplier>> {
        const response = await apiClient.post('/master/suppliers/', data);
        return response.data;
    },
    async update(id: number, data: Partial<Supplier>): Promise<ApiResponse<Supplier>> {
        const response = await apiClient.patch(`/master/suppliers/${id}/`, data);
        return response.data;
    },
    async delete(id: number): Promise<ApiResponse<void>> {
        const response = await apiClient.delete(`/master/suppliers/${id}/`);
        return response.data;
    },
};

