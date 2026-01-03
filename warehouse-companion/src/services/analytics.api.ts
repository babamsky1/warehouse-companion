import type {
    ApiResponse,
    PaginatedResponse,
    StockMovement,
} from '@/types/database';
import apiClient from './axios';

export const reportsApi = {
    async getStockMovements(page: number = 1, limit: number = 10): Promise<ApiResponse<PaginatedResponse<StockMovement>>> {
        const response = await apiClient.get('/analytics/stock-movements/', {
            params: { page, limit },
        });
        return response.data;
    },
    async getInventorySummary(): Promise<ApiResponse<{
        total_products: number;
        total_warehouses: number;
        total_stock_value: number;
        low_stock_items: number;
    }>> {
        const response = await apiClient.get('/analytics/inventory-summary/');
        return response.data;
    },
    async getLowStockReport(): Promise<ApiResponse<Array<{
        product_id: number;
        product_name: string;
        minimum_stock: number;
        current_quantity: number;
        shortage: number;
    }>>> {
        const response = await apiClient.get('/analytics/low-stock-report/');
        return response.data;
    },
};

export const dashboardApi = {
    async getSummary(): Promise<ApiResponse<{
        total_stock_value: number;
        total_products: number;
        total_warehouses: number;
        total_orders: number;
        pending_orders: number;
        low_stock_items: number;
        recent_movements: StockMovement[];
    }>> {
        const response = await apiClient.get('/analytics/dashboard-summary/');
        return response.data;
    },
};
