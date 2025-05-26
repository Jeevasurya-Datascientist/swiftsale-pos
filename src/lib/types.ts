
export interface BaseItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  imageUrl: string;
  dataAiHint?: string;
}

export interface Product extends BaseItem {
  barcode?: string;
  stock: number;
  costPrice: number;
  sellingPrice: number;
  gstPercentage: number; // GST rate for this specific product
}

export interface Service extends BaseItem {
  serviceCode?: string;
  duration?: string;
  // sellingPrice removed - price is determined dynamically at billing via ServiceDetailsDialog
}

export type SearchableItem =
  (Product & { price: number; type: 'product'; costPrice: number; stock: number; barcode?: string; gstPercentage: number; }) |
  (Service & { price: number; type: 'service'; costPrice: 0 }); // Price for service here is dynamic, default to 0


export interface CartItem {
  id: string;
  name: string;
  price: number; // For services, this will be baseServiceAmount + additionalServiceCharge. For products, this is sellingPrice.
  quantity: number;
  imageUrl: string;
  dataAiHint?: string;
  type: 'product' | 'service';
  category?: string;
  itemSpecificPhoneNumber?: string; // For services
  itemSpecificNote?: string; // For services
  isPriceOverridden?: boolean; // True if price was manually set

  costPrice: number; // For products & services (0 for services if not specified)
  gstPercentage?: number; // For products, from Product.gstPercentage

  // Service specific pricing components
  baseServiceAmount?: number; // For services
  additionalServiceCharge?: number; // For services

  barcode?: string; // product only
  stock?: number; // product only

  serviceCode?: string; // service only
  duration?: string; // service only
}


export interface Invoice {
  id:string;
  invoiceNumber: string;
  customerName: string;
  customerPhoneNumber?: string;
  items: CartItem[];
  subTotal: number;
  gstAmount: number; // Sum of GST from individual taxable items
  totalAmount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Digital Wallet';
  date: string;
  amountReceived: number;
  balanceAmount: number;
  status: 'Paid' | 'Due';
  shopName?: string;
}

export interface TeamMember {
  id: string; // simple unique ID for list key, can be Date.now().toString()
  name: string;
  email: string;
  status: 'pending' | 'invited' | 'accepted' | 'error'; // 'pending' for newly added, 'invited' after (simulated) invite, etc.
}

export interface AppSettings {
  shopName: string;
  shopLogoUrl: string;
  shopAddress: string;
  currencySymbol: string;
  userName: string;
  teamPassword?: string; // For owner to set/update
  teamMembers?: TeamMember[];
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  [key: string]: any;
}

export interface KeyValueDataPoint {
  name: string;
  value: number;
  fill?: string;
  [key: string]: any;
}

export type ReportTimeFilter = "today" | "last7days" | "last30days" | "thisMonth" | "allTime" | "custom";

export type ReportDateRange = {
    from: Date | undefined;
    to: Date | undefined;
};


export interface ExistingCustomer {
  name: string;
  phoneNumber: string;
  id: string;
}

export interface NotificationItem {
  id: string;
  type: 'lowStock' | 'info' | 'success' | 'error';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

// AI Profit Analysis Flow Types
export interface AnalyzeProfitInput {
  query: string;
}
export interface AnalyzeProfitOutput {
  analysis: string;
}
