
import type { Product, Service, Invoice } from './types';

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
    category: 'Groceries',
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
  ...product,
  quantity,
  type: 'product',
});

// Helper to create a CartItem from Service for mock invoices
const serviceToCartItem = (service: Service, quantity: number): CartItem => ({
  ...service,
  quantity,
  type: 'service',
});


export const mockInvoices: Invoice[] = [
  {
    id: 'inv001',
    invoiceNumber: 'INV-2024-001',
    customerName: 'John Doe',
    items: [
      productToCartItem(mockProducts[0], 2), // Fresh Milk
      productToCartItem(mockProducts[1], 1), // Whole Wheat Bread
    ],
    subTotal: (mockProducts[0].price * 2) + mockProducts[1].price,
    gstRate: 0.05,
    gstAmount: ((mockProducts[0].price * 2) + mockProducts[1].price) * 0.05,
    totalAmount: (((mockProducts[0].price * 2) + mockProducts[1].price) * 1.05),
    paymentMethod: 'Cash',
    date: new Date().toISOString(),
    amountReceived: (((mockProducts[0].price * 2) + mockProducts[1].price) * 1.05),
    balanceAmount: 0,
  },
  {
    id: 'inv002',
    invoiceNumber: 'INV-2024-002',
    customerName: 'Jane Smith',
    customerPhoneNumber: '9876543210',
    items: [
      productToCartItem(mockProducts[3], 1), // T-Shirt
      serviceToCartItem(mockServices[0], 1), // Haircut
      productToCartItem(mockProducts[5], 4), // Cola
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
];
