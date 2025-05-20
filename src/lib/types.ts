export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  barcode: string;
  imageUrl?: string;
  dataAiHint?: string; // Added for placeholder image hints
  stock: number; 
  category?: string; // For better organization and AI suggestions
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string; // Simplified for now
  items: CartItem[];
  subTotal: number;
  gstRate: number; // e.g., 0.18 for 18%
  gstAmount: number;
  totalAmount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Digital Wallet';
  date: string; // ISO string
}

export interface AppSettings {
  shopName: string;
  shopLogoUrl: string;
  shopAddress: string;
  currencySymbol: string;
  userName: string; // Added user name
}

