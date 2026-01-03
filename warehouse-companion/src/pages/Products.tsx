/**
 * Products Page
 *
 * Performance-optimized products management page demonstrating:
 * - Virtualized tables with column sorting and filtering
 * - Debounced search integrated with React Query
 * - Memoized components and optimized re-renders
 * - Lazy loading and code splitting
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SmartTable, type ColumnDef } from "@/components/table";
import { ActionMenu } from "@/components/table";
import { StatCard } from "@/components/dashboard/StatCard";
import { Package, PackagePlus, TrendingUp, AlertTriangle } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import { useDebouncedSearch } from "@/hooks/use-debounce";
import { useProducts } from "@/hooks/use-products";

// Mock data - replace with real API when backend is ready
const mockProducts = Array.from({ length: 2000 }, (_, i) => ({
  id: i + 1,
  sku: `SKU-${String(i + 1).padStart(6, '0')}`,
  name: `Product ${i + 1}`,
  category: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'][Math.floor(Math.random() * 5)],
  price: Math.round((Math.random() * 500 + 10) * 100) / 100,
  stock: Math.floor(Math.random() * 1000),
  status: Math.random() > 0.1 ? 'Active' : 'Inactive',
  reorderPoint: Math.floor(Math.random() * 50) + 10,
  supplier: `Supplier ${Math.floor(Math.random() * 20) + 1}`,
  lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
}));

type Product = typeof mockProducts[0];

/**
 * Product Actions Menu
 * Memoized component with optimized callback functions
 */
const ProductActions = memo(({ product }: { product: Product }) => {
  const handleEdit = useCallback(() => {
    console.log('Edit product:', product.id);
    // TODO: Open edit modal
  }, [product.id]);

  const handleDelete = useCallback(() => {
    console.log('Delete product:', product.id);
    // TODO: Open delete confirmation modal
  }, [product.id]);

  const handleViewDetails = useCallback(() => {
    console.log('View product details:', product.id);
    // TODO: Navigate to product detail page
  }, [product.id]);

  const handleAdjustStock = useCallback(() => {
    console.log('Adjust stock for:', product.id);
    // TODO: Open stock adjustment modal
  }, [product.id]);

  return (
    <ActionMenu>
      <Button variant="ghost" size="sm" onClick={handleViewDetails}>
        View Details
      </Button>
      <Button variant="ghost" size="sm" onClick={handleEdit}>
        Edit Product
      </Button>
      <Button variant="ghost" size="sm" onClick={handleAdjustStock}>
        Adjust Stock
      </Button>
      <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
        Delete Product
      </Button>
    </ActionMenu>
  );
});

/**
 * Stock Status Indicator
 * Memoized component for consistent stock status display
 */
const StockStatusIndicator = memo(({ stock, reorderPoint }: { stock: number; reorderPoint: number }) => {
  const isLowStock = stock <= reorderPoint;
  const isOutOfStock = stock === 0;

  if (isOutOfStock) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
        <AlertTriangle className="h-3 w-3" />
        Out of Stock
      </span>
    );
  }

  if (isLowStock) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        <AlertTriangle className="h-3 w-3" />
        Low Stock
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
      In Stock
    </span>
  );
});

/**
 * Price Formatter
 * Memoized utility for consistent price display
 */
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

/**
 * Products Page Component
 * Comprehensive example of performance optimizations for product management
 */
const Products = memo(() => {
  // Debounced search with React Query integration
  const { searchValue, debouncedSearchValue, setSearchValue } = useDebouncedSearch();

  // React Query hook (currently using mock data)
  const { data: productsData, isLoading } = useProducts(1, 1000);

  // Use mock data for now, replace with real data when backend is ready
  const allProducts = productsData?.data || mockProducts;

  // Memoized filtering based on debounced search
  const filteredProducts = useMemo(() => {
    if (!debouncedSearchValue) return allProducts;

    const searchLower = debouncedSearchValue.toLowerCase();
    return allProducts.filter(product =>
      product.sku.toLowerCase().includes(searchLower) ||
      product.name.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower) ||
      product.supplier.toLowerCase().includes(searchLower)
    );
  }, [allProducts, debouncedSearchValue]);

  // Memoized table columns with optimized renderers
  const columns = useMemo<ColumnDef<Product>[]>(() => [
    {
      key: 'sku',
      label: 'SKU',
      sortable: true,
      width: 120,
      render: (product) => (
        <span className="font-mono text-sm font-medium">{product.sku}</span>
      ),
    },
    {
      key: 'name',
      label: 'Product Name',
      sortable: true,
      width: 200,
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      filterable: true,
      width: 120,
    },
    {
      key: 'supplier',
      label: 'Supplier',
      sortable: true,
      filterable: true,
      width: 150,
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      width: 100,
      render: (product) => formatPrice(product.price),
    },
    {
      key: 'stock',
      label: 'Stock',
      sortable: true,
      width: 100,
      render: (product) => (
        <span className={`font-medium ${product.stock <= product.reorderPoint ? 'text-destructive' : ''}`}>
          {product.stock}
        </span>
      ),
    },
    {
      key: 'reorderPoint',
      label: 'Reorder Point',
      sortable: true,
      width: 120,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: 100,
      render: (product) => <StockStatusIndicator stock={product.stock} reorderPoint={product.reorderPoint} />,
    },
    {
      key: 'lastUpdated',
      label: 'Last Updated',
      sortable: true,
      width: 140,
      render: (product) => new Date(product.lastUpdated).toLocaleDateString(),
    },
  ], []);

  // Memoized statistics with performance calculations
  const stats = useMemo(() => {
    const totalProducts = allProducts.length;
    const activeProducts = allProducts.filter(p => p.status === 'Active').length;
    const lowStockProducts = allProducts.filter(p => p.stock <= p.reorderPoint).length;
    const outOfStockProducts = allProducts.filter(p => p.stock === 0).length;
    const totalValue = allProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);

    return {
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      totalValue,
      averagePrice: totalProducts > 0 ? totalValue / totalProducts : 0,
    };
  }, [allProducts]);

  // Optimized action handlers
  const handleAddProduct = useCallback(() => {
    console.log('Add new product');
    // TODO: Open add product modal
  }, []);

  const handleBulkImport = useCallback(() => {
    console.log('Bulk import products');
    // TODO: Open bulk import modal
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Products</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleBulkImport}>
            Bulk Import
          </Button>
          <Button onClick={handleAddProduct}>
            <PackagePlus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value={stats.totalProducts}
          contentType="products"
          variant="primary"
        />
        <StatCard
          label="Active Products"
          value={stats.activeProducts}
          contentType="active"
          variant="success"
        />
        <StatCard
          label="Low Stock Items"
          value={stats.lowStockProducts}
          contentType="low-stock"
          variant="warning"
        />
        <StatCard
          label="Total Value"
          value={`$${stats.totalValue.toLocaleString()}`}
          contentType="value"
          variant="info"
        />
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            Comprehensive product management with advanced filtering, sorting, and virtual scrolling for optimal performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SmartTable
            data={filteredProducts}
            columns={columns}
            actions={(product) => <ProductActions product={product} />}
            searchable={true}
            searchPlaceholder="Search products by SKU, name, category, or supplier..."
            externalSearch={searchValue}
            onSearchChange={setSearchValue}
            isLoading={isLoading}
            emptyMessage="No products found"
            // Performance settings optimized for product data
            virtualizationThreshold={500} // Switch to virtualization at 500+ products
            rowHeight={64} // Taller rows for product information
            containerHeight={700}
          />
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <h4 className="font-medium text-foreground">Performance Optimizations:</h4>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Virtual table rendering for datasets with 500+ products</li>
              <li>Debounced search with 300ms delay to reduce API calls</li>
              <li>Memoized data processing and component rendering</li>
              <li>Column-based filtering and multi-column sorting</li>
              <li>React Query caching with intelligent invalidation</li>
              <li>Lazy loading with code splitting</li>
            </ul>
            <div className="mt-4 p-3 bg-background rounded text-xs">
              <strong>Dataset Info:</strong> {filteredProducts.length} of {allProducts.length} products displayed
              {filteredProducts.length !== allProducts.length && ` (filtered from ${allProducts.length})`}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default Products;
