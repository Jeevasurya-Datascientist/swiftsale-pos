
import type { Product, Service, Invoice, CartItem } from './types';

export const mockProducts: Product[] = [
  {
    id: 'prod001',
    name: 'Fresh Milk 1L',
    price: 50, // INR
    barcode: 'SWSP001',
    stock: 50,
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'milk carton',
    category: 'Groceries',
    description: 'Pasteurized full cream milk, 1 liter pack.'
  },
  {
    id: 'prod002',
    name: 'Whole Wheat Bread',
    price: 40, // INR
    barcode: 'SWSP002',
    stock: 30,
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'bread loaf',
    category: 'Groceries',
    description: 'Healthy whole wheat bread, sliced.'
  },
  {
    id: 'prod003',
    name: 'Organic Eggs (Dozen)',
    price: 120, // INR
    barcode: 'SWSP003',
    stock: 25,
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'egg carton',
    category: 'Groceries',
    description: 'Pack of 12 organic brown eggs.'
  },
  {
    id: 'prod004',
    name: 'Classic Blue T-Shirt',
    price: 500, // INR
    barcode: 'SWSP004',
    stock: 40,
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'blue t-shirt',
    category: 'Apparel',
    description: 'Comfortable cotton t-shirt, size M.'
  },
  {
    id: 'prod005',
    name: 'Slim Fit Jeans',
    price: 1500, // INR
    barcode: 'SWSP005',
    stock: 20,
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'denim jeans',
    category: 'Apparel',
    description: 'Dark wash slim fit jeans, waist 32.'
  },
  {
    id: 'prod010',
    name: 'Cola Drink (Can)',
    price: 35, // INR
    barcode: 'SWSP010',
    stock: 100,
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'soda can',
    category: 'Beverages',
    description: '330ml can of cola.'
  }
];

export const mockServices: Service[] = [
  {
    id: 'serv001',
    name: 'Basic Haircut',
    price: 200, // INR
    serviceCode: 'SERVHC01',
    category: 'Salon',
    description: 'Standard haircut for men or women.',
    duration: '30 minutes',
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'haircut salon'
  },
  {
    id: 'serv002',
    name: 'Software Consultation',
    price: 2500, // INR
    serviceCode: 'SERVCONS01',
    category: 'IT Services',
    description: 'One hour software consultation.',
    duration: '1 hour',
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'software consultation'
  },
  {
    id: 'serv003',
    name: 'Express Car Wash',
    price: 400, // INR
    serviceCode: 'SERVCW01',
    category: 'Automotive',
    description: 'Quick exterior car wash.',
    duration: '20 minutes',
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'car wash'
  }
];

// Ensure mockItems have dataAiHint where imageUrl is a placeholder
mockProducts.forEach(p => {
  if (p.imageUrl && p.imageUrl.startsWith('https://placehold.co') && !p.dataAiHint) {
    p.dataAiHint = p.name.toLowerCase().split(' ').slice(0, 2).join(' ');
  }
});
mockServices.forEach(s => {
  if (s.imageUrl && s.imageUrl.startsWith('https://placehold.co') && !s.dataAiHint) {
    s.dataAiHint = s.name.toLowerCase().split(' ').slice(0, 2).join(' ');
  }
});


// Helper to create a CartItem from Product for mock invoices
const productToCartItem = (product: Product, quantity: number): CartItem => ({
  ...product, // Includes category
  quantity,
  type: 'product',
});

// Helper to create a CartItem from Service for mock invoices
const serviceToCartItem = (service: Service, quantity: number): CartItem => ({
  ...service, // Includes category
  quantity,
  type: 'service',
});


export const mockInvoices: Invoice[] = [
  {
    id: 'inv001',
    invoiceNumber: 'INV-20240701-001',
    customerName: 'John Doe',
    items: [
      productToCartItem(mockProducts[0], 2), // Fresh Milk (Groceries)
      productToCartItem(mockProducts[1], 1), // Whole Wheat Bread (Groceries)
    ],
    subTotal: (mockProducts[0].price * 2) + mockProducts[1].price,
    gstRate: 0.05,
    gstAmount: ((mockProducts[0].price * 2) + mockProducts[1].price) * 0.05,
    totalAmount: (((mockProducts[0].price * 2) + mockProducts[1].price) * 1.05),
    paymentMethod: 'Cash',
    date: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    amountReceived: (((mockProducts[0].price * 2) + mockProducts[1].price) * 1.05),
    balanceAmount: 0,
  },
  {
    id: 'inv002',
    invoiceNumber: 'INV-20240703-001',
    customerName: 'Jane Smith',
    customerPhoneNumber: '9876543210',
    items: [
      productToCartItem(mockProducts[3], 1), // T-Shirt (Apparel)
      serviceToCartItem(mockServices[0], 1), // Haircut (Salon)
      productToCartItem(mockProducts[5], 4), // Cola (Beverages)
    ],
    subTotal: mockProducts[3].price + mockServices[0].price + (mockProducts[5].price * 4),
    gstRate: 0.05,
    gstAmount: (mockProducts[3].price + mockServices[0].price + (mockProducts[5].price * 4)) * 0.05,
    totalAmount: (mockProducts[3].price + mockServices[0].price + (mockProducts[5].price * 4)) * 1.05,
    paymentMethod: 'Card',
    date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    amountReceived: (mockProducts[3].price + mockServices[0].price + (mockProducts[5].price * 4)) * 1.05,
    balanceAmount: 0,
  },
  {
    id: 'inv003',
    invoiceNumber: 'INV-20240704-001',
    customerName: 'Alice Brown',
    items: [
      productToCartItem(mockProducts[2], 2), // Organic Eggs (Groceries)
      productToCartItem(mockProducts[4], 1), // Slim Fit Jeans (Apparel)
      serviceToCartItem(mockServices[2], 1), // Express Car Wash (Automotive)
    ],
    subTotal: (mockProducts[2].price * 2) + mockProducts[4].price + mockServices[2].price,
    gstRate: 0.05,
    gstAmount: ((mockProducts[2].price * 2) + mockProducts[4].price + mockServices[2].price) * 0.05,
    totalAmount: (((mockProducts[2].price * 2) + mockProducts[4].price + mockServices[2].price) * 1.05),
    paymentMethod: 'UPI',
    date: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
    amountReceived: (((mockProducts[2].price * 2) + mockProducts[4].price + mockServices[2].price) * 1.05),
    balanceAmount: 0,
  },
    {
    id: 'inv004',
    invoiceNumber: 'INV-20240615-001',
    customerName: 'Bob Green',
    items: [
      serviceToCartItem(mockServices[1], 1), // Software Consultation (IT Services)
      productToCartItem(mockProducts[0], 5), // Fresh Milk (Groceries)
    ],
    subTotal: mockServices[1].price + (mockProducts[0].price * 5),
    gstRate: 0.05,
    gstAmount: (mockServices[1].price + (mockProducts[0].price * 5)) * 0.05,
    totalAmount: (mockServices[1].price + (mockProducts[0].price * 5)) * 1.05,
    paymentMethod: 'Digital Wallet',
    date: new Date(Date.now() - 86400000 * 20).toISOString(), // 20 days ago (last month)
    amountReceived: (mockServices[1].price + (mockProducts[0].price * 5)) * 1.05,
    balanceAmount: 0,
  },
  {
    id: 'inv005',
    invoiceNumber: 'INV-20240705-001', // Today
    customerName: 'Eve Davis',
    customerPhoneNumber: '9988776655',
    items: [
      productToCartItem(mockProducts[5], 10), // Cola (Beverages)
    ],
    subTotal: mockProducts[5].price * 10,
    gstRate: 0.05,
    gstAmount: (mockProducts[5].price * 10) * 0.05,
    totalAmount: (mockProducts[5].price * 10) * 1.05,
    paymentMethod: 'Cash',
    date: new Date().toISOString(), // Today
    amountReceived: (mockProducts[5].price * 10) * 1.05 + 50, // Overpaid
    balanceAmount: 50,
  }
];

// Ensure all mock invoice items have a category for reports
mockInvoices.forEach(invoice => {
  invoice.items.forEach(item => {
    if (!item.category) {
      const masterItem = [...mockProducts, ...mockServices].find(mi => mi.id === item.id);
      item.category = masterItem?.category || 'Uncategorized';
    }
  });
});
