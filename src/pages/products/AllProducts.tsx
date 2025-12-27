import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  reorderLevel: number;
  price: number;
  status: "active" | "inactive";
}

const products: Product[] = [
  {
    id: "1",
    sku: "WGT-A123",
    name: "Widget A-123",
    category: "Electronics",
    unit: "pcs",
    currentStock: 450,
    reorderLevel: 50,
    price: 24.99,
    status: "active",
  },
  {
    id: "2",
    sku: "CMP-B456",
    name: "Component B-456",
    category: "Machinery",
    unit: "pcs",
    currentStock: 28,
    reorderLevel: 40,
    price: 89.50,
    status: "active",
  },
  {
    id: "3",
    sku: "RAW-C789",
    name: "Raw Material C-789",
    category: "Raw Materials",
    unit: "kg",
    currentStock: 1200,
    reorderLevel: 200,
    price: 12.75,
    status: "active",
  },
  {
    id: "4",
    sku: "PKG-D012",
    name: "Packaging D-012",
    category: "Packaging",
    unit: "pcs",
    currentStock: 0,
    reorderLevel: 100,
    price: 0.50,
    status: "inactive",
  },
  {
    id: "5",
    sku: "ELC-E345",
    name: "Electronic E-345",
    category: "Electronics",
    unit: "pcs",
    currentStock: 856,
    reorderLevel: 25,
    price: 149.99,
    status: "active",
  },
  {
    id: "6",
    sku: "MCH-F678",
    name: "Machine Part F-678",
    category: "Machinery",
    unit: "pcs",
    currentStock: 234,
    reorderLevel: 30,
    price: 67.25,
    status: "active",
  },
  {
    id: "7",
    sku: "RAW-G901",
    name: "Raw Material G-901",
    category: "Raw Materials",
    unit: "ltr",
    currentStock: 580,
    reorderLevel: 100,
    price: 8.99,
    status: "active",
  },
  {
    id: "8",
    sku: "PKG-H234",
    name: "Packaging H-234",
    category: "Packaging",
    unit: "pcs",
    currentStock: 1500,
    reorderLevel: 200,
    price: 0.35,
    status: "active",
  },
];

const Products = () => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const getStockStatus = (current: number, reorder: number) => {
    if (current === 0) return { label: "Out of Stock", variant: "destructive" as const };
    if (current <= reorder) return { label: "Low Stock", variant: "warning" as const };
    return { label: "In Stock", variant: "success" as const };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Products</h1>
          <p className="page-description">Manage your product catalog and inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="content-section">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by SKU, name, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="machinery">Machinery</SelectItem>
              <SelectItem value="raw-materials">Raw Materials</SelectItem>
              <SelectItem value="packaging">Packaging</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedProducts.length === products.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Stock Status</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const stockStatus = getStockStatus(product.currentStock, product.reorderLevel);
              return (
                <TableRow
                  key={product.id}
                  className={cn(
                    "hover:bg-muted/30",
                    selectedProducts.includes(product.id) && "bg-muted/20"
                  )}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => toggleSelect(product.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{product.category}</TableCell>
                  <TableCell className="text-muted-foreground">{product.unit}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {product.currentStock.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        stockStatus.variant === "success" && "bg-success/10 text-success hover:bg-success/20",
                        stockStatus.variant === "warning" && "bg-warning/10 text-warning hover:bg-warning/20",
                        stockStatus.variant === "destructive" && "bg-destructive/10 text-destructive hover:bg-destructive/20"
                      )}
                    >
                      {stockStatus.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={product.status === "active" ? "default" : "secondary"}
                      className={cn(
                        product.status === "active" && "bg-success/10 text-success hover:bg-success/20"
                      )}
                    >
                      {product.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Product
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing 1-8 of 8 products
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Products;
