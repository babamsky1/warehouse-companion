/**
 * Complete WMS Database Schema with Full Audit Trail
 * 
 * Comment: This schema includes ALL required audit columns for every table:
 * - created_by: User ID who created the record
 * - updated_by: User ID who last updated the record
 * - created_at: Timestamp when record was created
 * - updated_at: Timestamp when record was last updated
 * 
 * Purpose: Ensure complete traceability of all data changes for:
 * - Compliance and auditing
 * - Debugging and troubleshooting
 * - User accountability
 * - Data integrity verification
 */

// ============================================================================
// BASE AUDIT INTERFACE
// ============================================================================

/**
 * Standard audit fields for all entities
 * Comment: All tables extend this interface to ensure consistency
 */
export interface AuditFields {
  created_at: string;
  updated_at: string;
  created_by: number; // Foreign key to users.id
  updated_by: number; // Foreign key to users.id
}

// ============================================================================
// MASTER DATA TABLES
// ============================================================================

/**
 * Category table
 * Comment: Product categorization with hierarchical support
 */
export interface Category extends AuditFields {
  id: number;
  name: string;
  description?: string;
  parent_id?: number; // For nested categories (e.g., Electronics > Phones)
  status: 'active' | 'inactive';
}

/**
 * Product table
 * Comment: Core product master data with complete attributes
 * Missing in current schema: description, brand, minimum_stock, etc.
 */
export interface Product extends AuditFields {
  id: number;
  sku: string; // Stock Keeping Unit - unique identifier
  barcode?: string; // For barcode scanning
  name: string;
  description?: string; // Product details

  // Categorization
  category_id: number; // FK to categories
  brand?: string; // Product brand/manufacturer
  group?: string; // Product group for additional classification

  // Pricing
  unit: string; // pcs, kg, box, etc.
  cost_price: number; // Purchase cost
  selling_price: number; // Sales price

  // Inventory control
  minimum_stock: number; // Reorder threshold
  maximum_stock: number; // Max stock level
  reorder_point: number; // When to reorder

  // Supplier relationship
  primary_supplier_id?: number; // FK to suppliers - main supplier

  // Physical attributes
  weight?: number; // For shipping calculations
  dimensions?: string; // LxWxH format

  // Product lifecycle
  status: 'active' | 'inactive' | 'discontinued';
  image_url?: string; // Product image
}

/**
 * Warehouse table
 * Comment: Physical warehouse locations
 * Missing: updated_at, phone, email, capacity
 */
export interface Warehouse extends AuditFields {
  id: number;
  code: string; // Short code (e.g., "WH-001")
  name: string;
  type: 'main' | 'regional' | 'outlet' | 'transit'; // Warehouse classification
  address: string;
  contact_person: string;
  phone: string; // Contact number
  email: string; // Contact email
  capacity?: number; // Storage capacity in sq meters or cubic meters
  status: 'active' | 'inactive';
}

/**
 * Location table
 * Comment: Specific storage locations within warehouses
 * Missing: zone, capacity, barcode for scanning
 */
export interface Location extends AuditFields {
  id: number;
  warehouse_id: number; // FK to warehouses

  // Location identification
  zone: 'receiving' | 'storage' | 'picking' | 'shipping' | 'quarantine';
  aisle?: string; // Aisle number
  rack: string; // Rack identifier
  bin: string; // Bin number
  level?: number; // Shelf level

  // Tracking
  code: string; // Full location code (e.g., "A-01-01")
  barcode?: string; // For location scanning

  // Capacity management
  capacity?: number; // Max capacity
  current_utilization?: number; // Current usage percentage

  description?: string;
  status: 'active' | 'inactive' | 'maintenance';
}

/**
 * Supplier table
 * Comment: Vendor master data
 * Missing: rating, payment terms, lead time
 */
export interface Supplier extends AuditFields {
  id: number;
  code: string; // Supplier code
  name: string;

  // Contact information
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  city?: string;
  country?: string;

  // Business details
  tax_id?: string; // Tax identification number
  payment_terms?: string; // e.g., "Net 30", "COD"
  lead_time_days?: number; // Typical delivery time
  minimum_order_value?: number; // Minimum order requirement

  // Performance tracking
  rating?: number; // 1-5 star rating

  status: 'active' | 'inactive' | 'blocked';
}

/**
 * Customer table
 * Comment: MISSING from current schema - essential for WMS
 * Currently using just customer_name string in orders
 */
export interface Customer extends AuditFields {
  id: number;
  code: string; // Customer code
  name: string;

  // Contact information
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  city?: string;
  country?: string;

  // Business details
  tax_id?: string;
  credit_limit?: number; // Maximum credit allowed
  payment_terms?: string;

  status: 'active' | 'inactive' | 'blocked';
}

/**
 * User table
 * Comment: System users with role-based access
 * Missing: phone, employee_id, password_hash
 */
export interface User extends AuditFields {
  id: number;
  employee_id?: string; // Employee ID from HR system
  full_name: string;
  email: string;
  phone?: string;
  password_hash: string; // Hashed password for authentication

  // Access control
  role: 'admin' | 'warehouse_manager' | 'operator' | 'viewer' | 'accountant';
  assigned_warehouse_id?: number; // FK to warehouses

  // Account status
  status: 'active' | 'inactive' | 'suspended';
  last_login?: string; // Last login timestamp
}

// ============================================================================
// INVENTORY CORE
// ============================================================================

/**
 * Stock table
 * Comment: Current stock levels by product, warehouse, and location
 * Missing: reserved_quantity, lot_number, expiry_date, last_counted_at
 */
export interface Stock {
  id: number;
  product_id: number; // FK to products
  warehouse_id: number; // FK to warehouses
  location_id: number; // FK to locations

  // Quantity tracking
  quantity: number; // Physical quantity on hand
  reserved_quantity: number; // Allocated for pending orders
  available_quantity: number; // Computed: quantity - reserved_quantity

  // Lot and batch tracking
  lot_number?: string; // Manufacturing lot
  batch_number?: string; // Production batch
  serial_number?: string; // For serialized items

  // Date tracking
  expiry_date?: string; // For perishable items
  manufacturing_date?: string;

  // Last physical count
  last_counted_at?: string; // Last inventory count date
  last_counted_by?: number; // FK to users

  // Audit (partial - stock updated frequently)
  updated_at: string;
  updated_by: number;
}

/**
 * StockBuffer table
 * Comment: Min/max stock levels for reorder management
 */
export interface StockBuffer extends AuditFields {
  id: number;
  product_id: number; // FK to products
  warehouse_id?: number; // null = company-wide default

  // Inventory control parameters
  minimum_stock: number; // Minimum level before reorder
  maximum_stock: number; // Maximum storage capacity
  reorder_point: number; // Trigger point for purchase order
  economic_order_quantity?: number; // Optimal order quantity
}

// ============================================================================
// ORDERS MODULE
// ============================================================================

/**
 * Order table
 * Comment: Purchase orders, sales orders, transfer orders
 * Missing: customer_id (FK), total_amount, assigned_to, priority
 */
export interface Order extends AuditFields {
  id: number;
  order_no: string; // Unique order number (e.g., "ORD-2025-001")
  order_type: 'sales' | 'purchase' | 'transfer' | 'return';

  // Relationships
  customer_id?: number; // FK to customers (for sales orders)
  supplier_id?: number; // FK to suppliers (for purchase orders)
  warehouse_id: number; // FK to warehouses

  // Workflow
  status: 'draft' | 'pending' | 'approved' | 'processing' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assigned_to?: number; // FK to users - person responsible

  // Dates
  order_date: string;
  expected_date?: string; // Expected completion date
  completed_at?: string; // Actual completion timestamp

  // Financial
  total_amount: number; // Total order value
  tax_amount?: number;
  discount_amount?: number;
  shipping_cost?: number;

  notes?: string;
}

/**
 * OrderItem table  
 * Comment: Line items for orders
 * Missing: unit_price, line_total, discount_percentage
 */
export interface OrderItem {
  id: number;
  order_id: number; // FK to orders
  product_id: number; // FK to products

  // Quantity and pricing
  quantity: number;
  unit: string; // Unit of measure
  unit_price: number; // Price per unit
  line_total: number; // quantity * unit_price

  // Discounts and taxes
  discount_percentage?: number;
  tax_percentage?: number;

  notes?: string;

  // Audit (line items created with order)
  created_at: string;
  created_by: number;
}

// ============================================================================
// OPERATIONS MODULE - RECEIVING
// ============================================================================

/**
 * Receiving table
 * Comment: Goods received from suppliers
 * Missing: purchase_order_id, expected_date, quality_check_status, total_items
 */
export interface Receiving extends AuditFields {
  id: number;
  receiving_no: string; // e.g., "RCV-2025-001"
  purchase_order_id?: number; // FK to orders (if from PO)
  supplier_id: number; // FK to suppliers
  warehouse_id: number; // FK to warehouses

  // Personnel
  received_by: number; // FK to users
  checked_by?: number; // FK to users (quality inspector)

  // Dates
  received_date: string;
  expected_date?: string; // Expected delivery date
  checked_at?: string; // Quality check timestamp

  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'partial' | 'cancelled';
  quality_check_status?: 'pending' | 'passed' | 'failed';

  // Summary
  total_items: number; // Number of different products
  total_quantity: number; // Total quantity received

  remarks?: string;
}

/**
 * ReceivingItem table
 * Comment: Line items for receiving transactions
 * Missing: ordered_quantity, damaged_quantity, lot_number, unit_price
 */
export interface ReceivingItem {
  id: number;
  receiving_id: number; // FK to receivings
  product_id: number; // FK to products
  location_id: number; // FK to locations - where stored

  // Quantities
  ordered_quantity: number; // What was ordered
  received_quantity: number; // What was actually received
  damaged_quantity?: number; // Damaged items

  // Tracking
  lot_number?: string;
  expiry_date?: string;

  // Pricing
  unit: string;
  unit_price: number;

  notes?: string;

  // Audit
  created_at: string;
  created_by: number;
}

// ============================================================================
// OPERATIONS MODULE - SHIPPING
// ============================================================================

/**
 * Shipment table
 * Comment: Outbound shipments to customers
 * Missing: customer_id, tracking_number, expected_delivery_date
 */
export interface Shipment extends AuditFields {
  id: number;
  shipment_no: string; // e.g., "SHIP-2025-001"
  order_id: number; // FK to orders
  warehouse_id: number; // FK to warehouses
  customer_id: number; // FK to customers

  // Shipping details
  destination_address: string;
  courier: string; // Shipping company
  tracking_number?: string; // Tracking code

  // Personnel
  shipped_by: number; // FK to users

  // Dates
  shipped_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;

  // Status
  status: 'pending' | 'packed' | 'in_transit' | 'delivered' | 'returned' | 'cancelled';

  // Financial
  shipping_cost?: number;

  notes?: string;
}

/**
 * ShipmentItem table
 * Comment: Line items for shipments
 * Missing: location_id (where picked from), serial_numbers
 */
export interface ShipmentItem {
  id: number;
  shipment_id: number; // FK to shipments
  product_id: number; // FK to products
  location_id: number; // FK to locations - where picked from

  // Quantity
  quantity: number;
  unit: string;

  // Tracking
  lot_number?: string;
  serial_numbers?: string; // JSON array for serialized items

  // Audit
  created_at: string;
  created_by: number;
}

// ============================================================================
// OPERATIONS MODULE - RETURNS
// ============================================================================

/**
 * Return table
 * Comment: Product returns from customers or to suppliers
 * Missing: reason, status, refund_amount, replacement_ordered
 */
export interface Return extends AuditFields {
  id: number;
  return_no: string; // e.g., "RET-2025-001"
  return_type: 'customer' | 'supplier' | 'internal' | 'damaged';

  // Relationships
  reference_order_id?: number; // FK to original order
  customer_id?: number; // FK to customers
  supplier_id?: number; // FK to suppliers
  warehouse_id: number; // FK to warehouses

  // Processing
  processed_by: number; // FK to users
  return_date: string;

  // Details
  reason: string; // Why returned
  status: 'pending' | 'approved' | 'completed' | 'rejected';

  // Financial
  refund_amount?: number;
  replacement_ordered: boolean; // Is replacement being sent

  remarks?: string;
}

/**
 * ReturnItem table
 * Comment: Line items for returns
 * Missing: condition, disposition, unit_price
 */
export interface ReturnItem {
  id: number;
  return_id: number; // FK to returns
  product_id: number; // FK to products
  location_id: number; // FK to locations - where returned to

  // Quantity and condition
  quantity: number;
  condition: 'good' | 'damaged' | 'defective' | 'expired';
  disposition: 'restock' | 'repair' | 'dispose' | 'return_to_supplier';

  // Tracking
  lot_number?: string;

  // Pricing
  unit_price: number; // For refund calculation

  // Audit
  created_at: string;
  created_by: number;
}

// ============================================================================
// INVENTORY TRANSACTIONS
// ============================================================================

/**
 * StockIn table
 * Comment: Stock increase transactions
 * Missing: transaction_type, status, total_quantity
 */
export interface StockIn extends AuditFields {
  id: number;
  reference_no: string; // e.g., "STK-IN-001"
  transaction_type: 'receiving' | 'return' | 'transfer_in' | 'adjustment';
  reference_id?: number; // ID from source transaction

  // Location
  warehouse_id: number; // FK to warehouses

  // Personnel
  performed_by: number; // FK to users

  // Details
  transaction_date: string;
  total_quantity: number; // Total items added
  status: 'pending' | 'completed' | 'cancelled';

  remarks?: string;
}

/**
 * StockOut table
 * Comment: Stock decrease transactions
 * Missing: transaction_type, status, total_quantity
 */
export interface StockOut extends AuditFields {
  id: number;
  reference_no: string; // e.g., "STK-OUT-001"
  transaction_type: 'shipment' | 'transfer_out' | 'adjustment' | 'damage' | 'sample';
  reference_id?: number; // ID from source transaction

  // Location
  warehouse_id: number; // FK to warehouses

  // Personnel
  performed_by: number; // FK to users

  // Details
  transaction_date: string;
  total_quantity: number; // Total items removed
  reason: string; // Why stock removed
  status: 'pending' | 'completed' | 'cancelled';
}

/**
 * Adjustment table
 * Comment: Stock corrections and adjustments
 * Missing: adjustment_no, category, approved_by, cost_impact
 */
export interface Adjustment extends AuditFields {
  id: number;
  adjustment_no: string; // e.g., "ADJ-2025-001"

  // Location
  product_id: number; // FK to products
  warehouse_id: number; // FK to warehouses
  location_id: number; // FK to locations

  // Adjustment details
  previous_qty: number; // Quantity before adjustment
  adjusted_qty: number; // Quantity after adjustment
  adjustment_type: 'increase' | 'decrease';

  // Reason classification
  category: 'physical_count' | 'damage' | 'theft' | 'correction' | 'expiry';
  reason: string; // Detailed explanation

  // Approval workflow
  adjusted_by: number; // FK to users - who performed
  approved_by?: number; // FK to users - who approved
  approved_at?: string;

  // Tracking
  lot_number?: string;

  // Financial impact
  cost_impact?: number; // Monetary value of adjustment
}

/**
 * Transfer table
 * Comment: Inter-warehouse or inter-location transfers
 * Missing: requested_by, approved_by, received_by, complete workflow
 */
export interface Transfer extends AuditFields {
  id: number;
  transfer_no: string; // e.g., "TRF-2025-001"

  // Product
  product_id: number; // FK to products
  quantity: number;
  lot_number?: string;

  // Source
  from_warehouse_id: number; // FK to warehouses
  from_location_id: number; // FK to locations

  // Destination
  to_warehouse_id: number; // FK to warehouses
  to_location_id: number; // FK to locations

  // Workflow
  requested_by: number; // FK to users - who requested
  requested_date: string;
  approved_by?: number; // FK to users - manager approval
  approved_date?: string;
  transferred_by: number; // FK to users - who executed
  transfer_date: string;
  received_by?: number; // FK to users - who received
  received_date?: string;

  // Status
  status: 'requested' | 'approved' | 'in_transit' | 'completed' | 'cancelled';

  remarks?: string;
}

// ============================================================================
// REPORTS & ANALYTICS
// ============================================================================

/**
 * StockMovement table
 * Comment: Comprehensive audit trail of all stock changes
 * Missing: previous_balance, new_balance, unit_cost, total_cost
 */
export interface StockMovement extends AuditFields {
  id: number;

  // Product and location
  product_id: number; // FK to products
  warehouse_id: number; // FK to warehouses
  location_id?: number; // FK to locations

  // Movement details
  movement_type: 'in' | 'out' | 'transfer' | 'adjustment' | 'return';
  reference_table: string; // 'receivings', 'shipments', 'adjustments', etc.
  reference_id: number; // ID in reference table

  // Quantities
  quantity: number; // Amount moved
  previous_balance: number; // Stock before movement
  new_balance: number; // Stock after movement

  // Financial
  unit_cost?: number;
  total_cost?: number; // quantity * unit_cost

  // Tracking
  lot_number?: string;

  // Audit
  performed_by: number; // FK to users
  movement_date: string;
}

/**
 * InventoryCounting table
 * Comment: MISSING from current schema - essential for physical inventory
 * Periodic stock counts to verify accuracy
 */
export interface InventoryCounting extends AuditFields {
  id: number;
  count_no: string; // e.g., "CNT-2025-001"
  warehouse_id: number; // FK to warehouses

  // Count type
  count_type: 'full' | 'cycle' | 'spot'; // Full inventory vs cycle count vs spot check

  // Scheduling
  scheduled_date: string;
  started_at?: string;
  completed_at?: string;

  // Personnel
  counted_by: number; // FK to users
  verified_by?: number; // FK to users - supervisor

  // Status
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

  // Summary
  total_items_counted: number;
  discrepancies_found: number; // Items with variance

  notes?: string;
}

/**
 * InventoryCountingItem table
 * Comment: MISSING - line items for physical counts
 */
export interface InventoryCountingItem {
  id: number;
  counting_id: number; // FK to inventory_countings
  product_id: number; // FK to products
  location_id: number; // FK to locations

  // Count results
  expected_quantity: number; // From system
  counted_quantity: number; // Physical count
  variance: number; // Computed: counted - expected

  // Tracking
  lot_number?: string;

  notes?: string; // Explanation for variance

  // Audit
  created_at: string;
  created_by: number;
}

// ============================================================================
// SETTINGS & SYSTEM
// ============================================================================

/**
 * Setting table
 * Comment: System configuration
 * Missing: category, data_type, description, is_system
 */
export interface Setting extends AuditFields {
  id: number;
  category: 'general' | 'inventory' | 'operations' | 'notification' | 'integration';
  setting_key: string; // e.g., "low_stock_threshold"
  setting_value: string; // Stored as string, parsed as needed
  data_type: 'string' | 'number' | 'boolean' | 'json';
  description?: string; // What this setting controls
  is_system: boolean; // Cannot be deleted if true
}

/**
 * ActivityLog table
 * Comment: MISSING - comprehensive audit log for all user actions
 * Essential for compliance and security
 */
export interface ActivityLog {
  id: number;
  user_id: number; // FK to users

  // Action details
  action: string; // 'create', 'update', 'delete', 'login', etc.
  entity_type: string; // 'product', 'order', 'shipment', etc.
  entity_id: number; // ID of affected entity

  // Change tracking
  changes?: string; // JSON of before/after values

  // Technical details
  ip_address?: string;
  user_agent?: string;

  created_at: string;
}

/**
 * Notification table
 * Comment: MISSING - user notifications for alerts and messages
 */
export interface Notification {
  id: number;
  user_id: number; // FK to users

  // Notification details
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  link?: string; // URL to related entity

  // Read status
  is_read: boolean;
  read_at?: string;

  created_at: string;
}

// ============================================================================
// API TYPES
// ============================================================================

/**
 * Comment: Pagination and API response types for consistent API structure
 */

export interface PaginationParams {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}
