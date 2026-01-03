import { createContext, ReactNode, useContext, useState } from "react";

// --- Interfaces ---

export interface ItemMasterRecord {
  id: string;
  psc: string;
  shortDescription: string;
  longDescription: string;
  invoiceDescription: string;
  picklistCode: string;
  barcode: string;
  productType: string;
  igDescription: string;
  subId: string;
  brand: "BW" | "KLIK" | "OMG" | "ORO";
  group: string;
  category: string;
  subCategory: string;
  size: string;
  color: string;
  isSaleable: boolean;
  cost: number;
  srp: number;
}

export interface PurchaseOrderRecord {
  id: string;
  poNumber: string;
  orderDate: string;
  supplierName: string;
  expectedDate: string;
  totalAmount: number;
  status: "Draft" | "Pending" | "Approved" | "Received";
  priority: "Low" | "Medium" | "High";
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export interface AdjustmentRecord {
  id: string;
  referenceNo: string;
  adjustmentDate: string;
  sourceReference: string;
  category: "For JO" | "For Zero Out" | "Sample and Retention" | "Wrong Encode";
  warehouse: string;
  status: "Open" | "Pending" | "Done";
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export interface WithdrawalRecord {
  id: string;
  referenceNo: string;
  transferDate: string;
  category: "Acetone" | "Industrial" | "Consumables";
  warehouse: string;
  status: "Open" | "Pending" | "Done";
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export interface DeliveryRecord {
  id: string;
  referenceNo: string;
  transferDate: string;
  supplierCode: string;
  packingNo: string;
  containerNo: string;
  transferType: "Local" | "International";
  status: "Open" | "Pending" | "Done";
  warehouse: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export interface SupplierRecord {
  id: string;
  supplierCode: string;
  supplierName: string;
  companyName: string;
  supplierType: "Local" | "International";
  company: string;
  status: "Active" | "Inactive";
}

export interface TransferRecord {
  id: string;
  referenceNo: string;
  transferDate: string;
  neededDate: string;
  sourceWarehouse: string;
  destinationWarehouse: string;
  requestedBy: string;
  status: "Open" | "For Approval" | "For Withdrawal" | "In Transit" | "Done" | "Cancelled";
  updatedBy: string;
  updatedAt: string;
}

export interface OrderMonitorRecord {
  id: string;
  poNo: string;
  seriesNo: string;
  customerName: string;
  brand: string;
  pickerStatus: "Done" | "In Progress" | "Pending";
  barcoderStatus: "Done" | "In Progress" | "Pending";
  taggerStatus: "Done" | "In Progress" | "Pending";
  checkerStatus: "Done" | "In Progress" | "Pending";
  overallStatus: "Shipped" | "Ready" | "Processing" | "Delayed";
  deliverySchedule: string;
  updatedAt: string;
}

export interface PickerRecord {
  id: string;
  seriesNo: string;
  poNo: string;
  poBrand: string;
  customerName: string;
  routeCode: string;
  dateApproved: string;
  approvedTime: string;
  deliverySchedule: string;
  priorityLevel: "High" | "Medium" | "Low";
  transferType: string;
  receivedBy: string;
  // Status type now allows "No Assignment" for display purposes
  status: "No Assignment" | "Assigned" | "Picking" | "Picked";
  totalQty: number;
  whReceiveDate: string;
  approvedBy: string;
  assignedStaff?: string;
  plRemarks: string;
}


export interface BarcoderRecord {
  id: string;
  seriesNo: string;
  poNo: string;
  poBrand: string;
  customerName: string;
  routeCode: string;
  barcoderName: string;
  deliverySchedule: string;
  dateApproved: string;
  approvedTime: string;
  priorityLevel: "High" | "Medium" | "Low";
  transferType: string;
  approvedBy: string;
  receivedBy: string;
  status: "Pending" | "Scanning" | "Scanned";
  assignedStaff?: string;
}

export interface TaggerRecord {
  id: string;
  seriesNo: string;
  poNo: string;
  poBrand: string;
  customerName: string;
  routeCode: string;
  priorityLevel: "High" | "Medium" | "Low";
  deliverySchedule: string;
  dateApproved: string;
  status: "Pending" | "Tagging" | "Tagged";
  approvedBy: string;
  assignedStaff?: string;
}

export interface CheckerRecord {
  id: string;
  seriesNo: string;
  poNo: string;
  customerName: string;
  status: "Pending" | "Checking" | "Checked";
  assignedStaff?: string;
  lastVerified?: string;
}

export interface TransferAssignmentRecord {
  id: string;
  transferId: string;
  fromWarehouse: string;
  toWarehouse: string;
  driverName: string;
  assignedStaff?: string;
  status: "Assigned" | "On Delivery" | "Delivered";
}

// --- Context Types ---

interface WmsContextType {
  // Data
  items: ItemMasterRecord[];
  purchaseOrders: PurchaseOrderRecord[];
  adjustments: AdjustmentRecord[];
  withdrawals: WithdrawalRecord[];
  deliveries: DeliveryRecord[];
  suppliers: SupplierRecord[];
  transfers: TransferRecord[];
  orders: OrderMonitorRecord[];
  pickers: PickerRecord[];
  barcoders: BarcoderRecord[];
  taggers: TaggerRecord[];
  checkers: CheckerRecord[];
  transferAssignments: TransferAssignmentRecord[];

  // Actions
  addItem: (item: ItemMasterRecord) => void;
  updateItem: (id: string, data: Partial<ItemMasterRecord>) => void;
  deleteItem: (id: string) => void;

  addPO: (po: PurchaseOrderRecord) => void;
  updatePO: (id: string, data: Partial<PurchaseOrderRecord>) => void;
  deletePO: (id: string) => void;

  addAdjustment: (adj: AdjustmentRecord) => void;
  updateAdjustment: (id: string, data: Partial<AdjustmentRecord>) => void;
  deleteAdjustment: (id: string) => void;

  addWithdrawal: (withdrawal: WithdrawalRecord) => void;
  updateWithdrawal: (id: string, data: Partial<WithdrawalRecord>) => void;
  deleteWithdrawal: (id: string) => void;

  addDelivery: (delivery: DeliveryRecord) => void;
  updateDelivery: (id: string, data: Partial<DeliveryRecord>) => void;
  deleteDelivery: (id: string) => void;

  addSupplier: (supplier: SupplierRecord) => void;
  updateSupplier: (id: string, data: Partial<SupplierRecord>) => void;
  deleteSupplier: (id: string) => void;

  addTransfer: (transfer: TransferRecord) => void;
  updateTransfer: (id: string, data: Partial<TransferRecord>) => void;
  deleteTransfer: (id: string) => void;

  addOrder: (order: OrderMonitorRecord) => void;
  updateOrder: (id: string, data: Partial<OrderMonitorRecord>) => void;
  deleteOrder: (id: string) => void;

  updatePicker: (id: string, data: Partial<PickerRecord>) => void;
  updateBarcoder: (id: string, data: Partial<BarcoderRecord>) => void;
  updateTagger: (id: string, data: Partial<TaggerRecord>) => void;
  updateChecker: (id: string, data: Partial<CheckerRecord>) => void;
  updateTransferAssignment: (id: string, data: Partial<TransferAssignmentRecord>) => void;
}

const WmsContext = createContext<WmsContextType | undefined>(undefined);

// --- Provider ---

export const WmsProvider = ({ children }: { children: ReactNode }) => {
  // All data now comes from React Query hooks - no hardcoded initial state
  const [items, setItems] = useState<ItemMasterRecord[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderRecord[]>([]);
  const [adjustments, setAdjustments] = useState<AdjustmentRecord[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [orders, setOrders] = useState<OrderMonitorRecord[]>([]);
  const [pickers, setPickers] = useState<PickerRecord[]>([]);
  const [barcoders, setBarcoders] = useState<BarcoderRecord[]>([]);
  const [taggers, setTaggers] = useState<TaggerRecord[]>([]);
  const [checkers, setCheckers] = useState<CheckerRecord[]>([]);
  const [transferAssignments, setTransferAssignments] = useState<TransferAssignmentRecord[]>([]);

  // --- Actions Implementation ---

  const addItem = (item: ItemMasterRecord) => setItems(p => [item, ...p]);
  const updateItem = (id: string, data: Partial<ItemMasterRecord>) => setItems(p => p.map(i => i.id === id ? { ...i, ...data } : i));
  const deleteItem = (id: string) => setItems(p => p.filter(i => i.id !== id));

  const addPO = (po: PurchaseOrderRecord) => setPurchaseOrders(p => [po, ...p]);
  const updatePO = (id: string, data: Partial<PurchaseOrderRecord>) => setPurchaseOrders(p => p.map(i => i.id === id ? { ...i, ...data } : i));
  const deletePO = (id: string) => setPurchaseOrders(p => p.filter(i => i.id !== id));

  const addAdjustment = (adj: AdjustmentRecord) => setAdjustments(p => [adj, ...p]);
  const updateAdjustment = (id: string, data: Partial<AdjustmentRecord>) => setAdjustments(p => p.map(i => i.id === id ? { ...i, ...data } : i));
  const deleteAdjustment = (id: string) => setAdjustments(p => p.filter(i => i.id !== id));

  const addWithdrawal = (w: WithdrawalRecord) => setWithdrawals(p => [w, ...p]);
  const updateWithdrawal = (id: string, data: Partial<WithdrawalRecord>) => setWithdrawals(p => p.map(i => i.id === id ? { ...i, ...data } : i));
  const deleteWithdrawal = (id: string) => setWithdrawals(p => p.filter(i => i.id !== id));

  const addDelivery = (d: DeliveryRecord) => setDeliveries(p => [d, ...p]);
  const updateDelivery = (id: string, data: Partial<DeliveryRecord>) => setDeliveries(p => p.map(i => i.id === id ? { ...i, ...data } : i));
  const deleteDelivery = (id: string) => setDeliveries(p => p.filter(i => i.id !== id));

  const addSupplier = (s: SupplierRecord) => setSuppliers(p => [s, ...p]);
  const updateSupplier = (id: string, data: Partial<SupplierRecord>) => setSuppliers(p => p.map(i => i.id === id ? { ...i, ...data } : i));
  const deleteSupplier = (id: string) => setSuppliers(p => p.filter(i => i.id !== id));

  const addTransfer = (t: TransferRecord) => setTransfers(p => [t, ...p]);
  const updateTransfer = (id: string, data: Partial<TransferRecord>) => setTransfers(p => p.map(i => i.id === id ? { ...i, ...data } : i));
  const deleteTransfer = (id: string) => setTransfers(p => p.filter(i => i.id !== id));

  const addOrder = (o: OrderMonitorRecord) => setOrders(p => [o, ...p]);
  const updateOrder = (id: string, data: Partial<OrderMonitorRecord>) => setOrders(p => p.map(i => i.id === id ? { ...i, ...data } : i));
  const deleteOrder = (id: string) => setOrders(p => p.filter(i => i.id !== id));

  const updatePicker = (id: string, data: Partial<PickerRecord>) => setPickers(p => p.map(i => i.id === id ? { ...i, ...data } : i));
  const updateBarcoder = (id: string, data: Partial<BarcoderRecord>) => setBarcoders(p => p.map(i => i.id === id ? { ...i, ...data } : i));
  const updateTagger = (id: string, data: Partial<TaggerRecord>) => setTaggers(p => p.map(i => i.id === id ? { ...i, ...data } : i));
  const updateChecker = (id: string, data: Partial<CheckerRecord>) => setCheckers(p => p.map(i => i.id === id ? { ...i, ...data } : i));
  const updateTransferAssignment = (id: string, data: Partial<TransferAssignmentRecord>) => setTransferAssignments(p => p.map(i => i.id === id ? { ...i, ...data } : i));

  return (
    <WmsContext.Provider value={{
      items, purchaseOrders, adjustments, withdrawals, deliveries, suppliers, transfers, orders,
      pickers, barcoders, taggers, checkers, transferAssignments,
      addItem, updateItem, deleteItem,
      addPO, updatePO, deletePO,
      addAdjustment, updateAdjustment, deleteAdjustment,
      addWithdrawal, updateWithdrawal, deleteWithdrawal,
      addDelivery, updateDelivery, deleteDelivery,
      addSupplier, updateSupplier, deleteSupplier,
      addTransfer, updateTransfer, deleteTransfer,
      addOrder, updateOrder, deleteOrder,
      updatePicker, updateBarcoder, updateTagger, updateChecker, updateTransferAssignment
    }}>
      {children}
    </WmsContext.Provider>
  );
};

export const useWms = () => {
  const context = useContext(WmsContext);
  if (context === undefined) {
    throw new Error("useWms must be used within a WmsProvider");
  }
  return context;
};
