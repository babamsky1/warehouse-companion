import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Edit, Eye, Filter, MoreHorizontal, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  productCount: number;
  status: "active" | "inactive";
}

const initialCategories: Category[] = [
  { id: "1", name: "Beverages", productCount: 24, status: "active" },
  { id: "2", name: "Snacks", productCount: 18, status: "active" },
  { id: "3", name: "Electronics", productCount: 12, status: "inactive" },
];

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [newCategory, setNewCategory] = useState({ name: "", status: "active" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategories, setFilteredCategories] = useState(categories);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    const filtered = categories.filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) return;

    setCategories((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newCategory.name,
        productCount: 0,
        status: newCategory.status as "active" | "inactive",
      },
    ]);
    setNewCategory({ name: "", status: "active" });
  };

  const handleEditCategory = (id: string, updatedName: string, updatedStatus: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === id
          ? { ...category, name: updatedName, status: updatedStatus as "active" | "inactive" }
          : category
      )
    );
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((category) => category.id !== id));
  };

  const handleDeleteConfirmation = (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      handleDeleteCategory(id);
    }
  };

  const toggleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map((c) => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Categories</h1>
          <p className="page-description">Manage product categories for your store</p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm">+ Add Category</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="content-section">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedCategories.length === categories.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Category Name</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((category) => (
              <TableRow
                key={category.id}
                className={cn(
                  "hover:bg-muted/30",
                  selectedCategories.includes(category.id) && "bg-muted/20"
                )}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleSelect(category.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {category.productCount}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      category.status === "active" ? "default" : "secondary"
                    }
                    className={cn(
                      category.status === "active" &&
                        "bg-success/10 text-success hover:bg-success/20"
                    )}
                  >
                    {category.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
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
                        Edit Category
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
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredCategories.length === 0 && (
        <p className="text-center text-muted">No categories found.</p>
      )}
    </div>
  );
};

export default Categories;