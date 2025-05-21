
"use client";

import { useState, useEffect, ChangeEvent, useRef } from 'react';
import type { Product, Service, CartItem, Invoice, SearchableItem, ExistingCustomer } from '@/lib/types';
import { mockProducts, mockServices, mockInvoices as initialMockInvoices } from '@/lib/mockData';
import { ItemGrid } from '@/components/dashboard/ItemGrid';
import { CartDisplay } from '@/components/dashboard/CartDisplay';
import { SmartSuggestions } from '@/components/dashboard/SmartSuggestions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { InvoiceView } from '@/components/invoices/InvoiceView';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ShoppingBag, CreditCard, Phone, User, DollarSign, AlertCircle, Users, Search, Printer } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useNotifications } from '@/context/NotificationContext';
import { ScrollArea } from '@/components/ui/scroll-area';

const defaultPlaceholder = (name = "Item") => `https://placehold.co/150x150.png?text=${encodeURIComponent(name)}`;

export default function BillingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchableItems, setSearchableItems] = useState<SearchableItem[]>([]);
  const [filteredSearchableItems, setFilteredSearchableItems] = useState<SearchableItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [existingCustomers, setExistingCustomers] = useState<ExistingCustomer[]>([]);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isPrintFormatDialogOpen, setIsPrintFormatDialogOpen] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Digital Wallet'>('Cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState('');

  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [amountReceived, setAmountReceived] = useState<number | string>('');
  const [balanceAmount, setBalanceAmount] = useState(0);

  const { toast } = useToast();
  const { currencySymbol, gstRate: settingsGstRate, isSettingsLoaded, shopName: currentShopName } = useSettings();
  const { addNotification } = useNotifications();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/add-to-cart.mp3');
    }
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => console.warn("Audio play failed:", error));
    }
  };

  useEffect(() => {
    if (isSettingsLoaded && typeof window !== 'undefined') {
        const storedProducts = localStorage.getItem('appProducts');
        let finalProducts: Product[] = [];
        if (storedProducts) {
            try {
                const parsed = JSON.parse(storedProducts);
                if(Array.isArray(parsed)) {
                    finalProducts = parsed.map((p: any) => ({
                        id: p.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
                        name: p.name || "Unnamed Product",
                        costPrice: typeof p.costPrice === 'number' ? p.costPrice : 0,
                        sellingPrice: typeof p.sellingPrice === 'number' ? p.sellingPrice : 0,
                        stock: typeof p.stock === 'number' ? p.stock : 0,
                        barcode: p.barcode || "",
                        imageUrl: p.imageUrl || defaultPlaceholder(p.name || 'Product'),
                        dataAiHint: p.dataAiHint || (p.name ? p.name.toLowerCase().split(' ').slice(0, 2).join(' ') : 'product image'),
                        category: p.category || undefined,
                        description: p.description || undefined,
                    }));
                } else {
                   finalProducts = mockProducts.map(p => ({...p, imageUrl: p.imageUrl || defaultPlaceholder(p.name)}));
                }
            } catch (e) { 
              console.error("Failed to parse products from localStorage, using mock data.", e);
              finalProducts = mockProducts.map(p => ({...p, imageUrl: p.imageUrl || defaultPlaceholder(p.name)}));
            }
        } else {
            finalProducts = mockProducts.map(p => ({...p, imageUrl: p.imageUrl || defaultPlaceholder(p.name)}));
        }
        setProducts(finalProducts);

        const storedServices = localStorage.getItem('appServices');
        let finalServices: Service[] = [];
        if(storedServices) {
            try {
                const parsed = JSON.parse(storedServices);
                if(Array.isArray(parsed)) {
                    finalServices = parsed.map((s: any) => ({
                        id: s.id || `serv-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
                        name: s.name || "Unnamed Service",
                        sellingPrice: typeof s.sellingPrice === 'number' ? s.sellingPrice : 0,
                        serviceCode: s.serviceCode || undefined,
                        imageUrl: s.imageUrl || defaultPlaceholder(s.name || 'Service'),
                        dataAiHint: s.dataAiHint || (s.name ? s.name.toLowerCase().split(' ').slice(0, 2).join(' ') : 'service image'),
                        category: s.category || undefined,
                        description: s.description || undefined,
                        duration: s.duration || undefined,
                    }));
                } else {
                    finalServices = mockServices.map(s => ({...s, imageUrl: s.imageUrl || defaultPlaceholder(s.name)}));
                }
            } catch (e) { 
              console.error("Failed to parse services from localStorage, using mock data.", e);
              finalServices = mockServices.map(s => ({...s, imageUrl: s.imageUrl || defaultPlaceholder(s.name)}));
            }
        }
        setServices(finalServices);

        const allItems: SearchableItem[] = [
            ...finalProducts.map(p => ({ ...p, price: p.sellingPrice, type: 'product' as 'product' })), 
            ...finalServices.map(s => ({ ...s, price: s.sellingPrice, type: 'service' as 'service' }))  
        ].sort((a, b) => a.name.localeCompare(b.name));
        setSearchableItems(allItems);
        setFilteredSearchableItems(allItems);


        const storedInvoices = localStorage.getItem('appInvoices');
        const allInvoices: Invoice[] = storedInvoices ? JSON.parse(storedInvoices) : initialMockInvoices;
        const uniqueCusts: Record<string, ExistingCustomer> = {};
        allInvoices.forEach(inv => {
            if (inv.customerName) {
                const custId = `${inv.customerName.toLowerCase().replace(/\s/g, '_')}-${(inv.customerPhoneNumber || '').replace(/\D/g, '')}`;
                if (!uniqueCusts[custId]) {
                    uniqueCusts[custId] = {
                        id: custId,
                        name: inv.customerName,
                        phoneNumber: inv.customerPhoneNumber || ''
                    };
                }
            }
        });
        setExistingCustomers(Object.values(uniqueCusts).sort((a,b) => a.name.localeCompare(b.name)));
    }
  }, [isSettingsLoaded]);

   useEffect(() => {
    if (isSettingsLoaded && (products.length > 0 || services.length > 0) && typeof window !== 'undefined') {
        localStorage.setItem('appProducts', JSON.stringify(products));
        localStorage.setItem('appServices', JSON.stringify(services));
        const allItems: SearchableItem[] = [
          ...products.map(p => ({ ...p, price: p.sellingPrice, type: 'product' as 'product'})),
          ...services.map(s => ({ ...s, price: s.sellingPrice, type: 'service' as 'service'}))
        ].sort((a, b) => a.name.localeCompare(b.name));
        setSearchableItems(allItems);
        if (searchTerm) {
            setFilteredSearchableItems(
                allItems.filter(item =>
                    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
                )
            );
        } else {
            setFilteredSearchableItems(allItems);
        }
    }
  }, [products, services, isSettingsLoaded, searchTerm]);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredSearchableItems(searchableItems);
    } else {
      setFilteredSearchableItems(
        searchableItems.filter(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    }
  }, [searchTerm, searchableItems]);

  const subTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0); 
  const currentGstRate = (settingsGstRate || 0) / 100;
  const gstAmount = subTotal * currentGstRate;
  const totalAmount = subTotal + gstAmount;

  useEffect(() => {
    const numericAmountReceived = typeof amountReceived === 'string' ? parseFloat(amountReceived) : amountReceived;
    if (typeof numericAmountReceived === 'number' && !isNaN(numericAmountReceived) && totalAmount > 0) {
      setBalanceAmount(numericAmountReceived - totalAmount);
    } else {
      setBalanceAmount(0);
    }
  }, [amountReceived, totalAmount]);

  const handleAmountReceivedChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setAmountReceived('');
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setAmountReceived(numValue);
      }
    }
  };

  const checkAndNotifyLowStock = (product: Product, quantityInCart: number) => {
    const effectiveRemainingStock = product.stock - quantityInCart;
    if (effectiveRemainingStock < 15 && effectiveRemainingStock >= 0) {
      const message = `${product.name} is low on stock. ${effectiveRemainingStock} units will remain if this quantity is sold.`;
      toast({
        title: "Low Stock Warning",
        description: message,
        variant: "default",
        duration: 5000,
      });
      addNotification({
        type: 'lowStock',
        title: 'Low Stock Alert',
        description: message,
        link: `/products#${product.id}`
      });
    }
  };

  const handleAddItemToCart = (itemIdentifier: string, itemTypeFromSearch?: 'product' | 'service') => {
    let foundItem: SearchableItem | undefined;
    foundItem = filteredSearchableItems.find(item => item.id === itemIdentifier);
    if (!foundItem) {
        foundItem = searchableItems.find(item => item.id === itemIdentifier);
    }

    if (foundItem) {
      const type: 'product' | 'service' = 'stock' in foundItem ? 'product' : 'service';
      if (type === 'product') {
        const product = foundItem as Product; 
        const existingCartItem = cartItems.find(ci => ci.id === product.id);
        if (!existingCartItem && product.stock <= 0) {
          toast({ title: "Out of Stock", description: `${product.name} is currently out of stock.`, variant: "destructive" });
          return;
        }
        if (existingCartItem && existingCartItem.quantity >= product.stock) {
           toast({ title: "Stock Limit Reached", description: `Cannot add more ${product.name}. Max stock available.`, variant: "destructive" });
           return;
        }
        const currentQuantityInCart = existingCartItem ? existingCartItem.quantity : 0;
        const prospectiveQuantityInCart = currentQuantityInCart + 1;
        if (prospectiveQuantityInCart <= product.stock) {
          checkAndNotifyLowStock(product, prospectiveQuantityInCart);
        }
      }

      setCartItems((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === foundItem!.id);
        if (existingItem) {
          if (type === 'product') {
            const product = foundItem as Product;
            if (existingItem.quantity < product.stock) {
              return prevCart.map((item) =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
              );
            } else {
              return prevCart;
            }
          } else {
            return prevCart.map((item) =>
              item.id === foundItem!.id ? { ...item, quantity: item.quantity + 1 } : item
            );
          }
        } else {
          const cartItemToAdd: CartItem = {
            id: foundItem.id,
            name: foundItem.name,
            price: foundItem.price, // Use foundItem.price (which is derived from sellingPrice)
            quantity: 1,
            type: type,
            imageUrl: foundItem.imageUrl || defaultPlaceholder(foundItem.name),
            dataAiHint: foundItem.dataAiHint,
            category: foundItem.category,
            itemSpecificPhoneNumber: '', // Initialize for services
            ...(type === 'product' && {
              barcode: (foundItem as Product).barcode,
              stock: (foundItem as Product).stock,
              costPrice: (foundItem as Product).costPrice
            }),
            ...(type === 'service' && {
              serviceCode: (foundItem as Service).serviceCode,
              duration: (foundItem as Service).duration,
              costPrice: 0 
            }),
          };
          return [...prevCart, cartItemToAdd];
        }
      });
      playSound();
      toast({ title: "Item Added", description: `${foundItem.name} added to cart.` });
    } else {
      toast({ title: "Item Not Found", description: "No product or service matched your search.", variant: "destructive" });
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prevCart) => prevCart.filter((item) => item.id !== itemId));
    toast({ title: "Item Removed", description: "Item removed from cart." });
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    const cartItem = cartItems.find(ci => ci.id === itemId);
    if (!cartItem) return;
  
    let quantityToSet = newQuantity;
  
    if (quantityToSet <= 0) {
      handleRemoveItem(itemId);
      return;
    }
  
    const productDetails = products.find(p => p.id === itemId);
    if (cartItem.type === 'product' && productDetails) {
      if (quantityToSet > productDetails.stock) {
        toast({ title: "Stock Limit Exceeded", description: `Only ${productDetails.stock} units of ${cartItem.name} available. Quantity set to max.`, variant: "destructive" });
        quantityToSet = productDetails.stock;
      }
      checkAndNotifyLowStock(productDetails, quantityToSet);
    }
  
    setCartItems((prevCart) =>
      prevCart.map((item) => (item.id === itemId ? { ...item, quantity: quantityToSet } : item))
    );
  
    if (newQuantity > (cartItem.quantity || 0) && (cartItem.type !== 'product' || (productDetails && quantityToSet <= productDetails.stock))) {
        playSound(); 
    }
  };

  const handleUpdateItemPhoneNumber = (itemId: string, phoneNumber: string) => {
    setCartItems(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, itemSpecificPhoneNumber: phoneNumber } : item
      )
    );
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    return `INV-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
  };

  const handleGenerateInvoice = () => {
    if (cartItems.length === 0) {
      toast({ title: "Empty Cart", description: "Cannot generate invoice for an empty cart.", variant: "destructive" });
      return;
    }
    if (!customerName.trim()) {
      toast({ title: "Missing Information", description: "Customer Name is required.", variant: "destructive" });
      return;
    }
    if (!customerPhoneNumber.trim()) {
      toast({ title: "Missing Information", description: "Customer Phone Number is required.", variant: "destructive" });
      return;
    }
    if (!/^\d{10,}$/.test(customerPhoneNumber.replace(/\D/g, ''))) {
        toast({ title: "Invalid Phone Number", description: "Please enter a valid phone number (at least 10 digits).", variant: "destructive" });
        return;
    }

    if (paymentMethod === 'Card') {
      if (!cardNumber.trim() || !/^\d{13,19}$/.test(cardNumber.replace(/\s/g, ''))) {
        toast({ title: "Invalid Card Details", description: "Valid Card Number is required.", variant: "destructive" });
        return;
      }
      if (!cardExpiry.trim() || !/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cardExpiry)) {
        toast({ title: "Invalid Card Details", description: "Valid Card Expiry (MM/YY) is required.", variant: "destructive" });
        return;
      }
      if (!cardCvv.trim() || !/^\d{3,4}$/.test(cardCvv)) {
        toast({ title: "Invalid Card Details", description: "Valid CVV (3 or 4 digits) is required.", variant: "destructive" });
        return;
      }
    }

    if (paymentMethod === 'UPI') {
      if (!upiId.trim() || !/^[\w.-]+@[\w.-]+$/.test(upiId)) {
        toast({ title: "Invalid UPI ID", description: "Valid UPI ID is required (e.g., name@bank).", variant: "destructive" });
        return;
      }
    }

    const numericAmountReceived = typeof amountReceived === 'string' || amountReceived === '' ? parseFloat(amountReceived as string) : amountReceived as number;
    if (typeof numericAmountReceived !== 'number' || isNaN(numericAmountReceived) || numericAmountReceived < 0) {
        toast({ title: "Invalid Amount", description: "Please enter a valid Amount Received.", variant: "destructive" });
        return;
    }

    const invoiceStatus: 'Paid' | 'Due' = numericAmountReceived >= totalAmount ? 'Paid' : 'Due';

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
      customerName: customerName,
      customerPhoneNumber: customerPhoneNumber,
      items: cartItems,
      subTotal,
      gstRate: currentGstRate, // Store the decimal rate
      gstAmount,
      totalAmount,
      paymentMethod,
      date: new Date().toISOString(),
      amountReceived: numericAmountReceived,
      balanceAmount: numericAmountReceived - totalAmount,
      status: invoiceStatus,
      shopName: currentShopName,
    };
    setCurrentInvoice(newInvoice);
    setIsInvoiceDialogOpen(true);

    if (invoiceStatus === 'Due') {
        toast({
            title: "Invoice Generated (Payment Due)",
            description: `Amount received (${currencySymbol}${numericAmountReceived.toFixed(2)}) is less than total (${currencySymbol}${totalAmount.toFixed(2)}). Invoice status: 'Due'.`,
            variant: "default",
            duration: 7000
        });
    }
  };

  const handleFinalizeSale = () => {
    if (!currentInvoice) return;

    let paymentSuccessMessage = `Payment of ${currencySymbol}${currentInvoice.totalAmount.toFixed(2)} via ${paymentMethod} successful.`;
    if (currentInvoice.status === 'Due') {
        paymentSuccessMessage = `Invoice recorded with Due status. Total: ${currencySymbol}${currentInvoice.totalAmount.toFixed(2)}. Amount Paid: ${currencySymbol}${currentInvoice.amountReceived.toFixed(2)}.`;
    } else if (paymentMethod === 'Card') {
      paymentSuccessMessage = `Simulated: Card ending with ${cardNumber.slice(-4)} charged ${currencySymbol}${currentInvoice.totalAmount.toFixed(2)}.`;
    } else if (paymentMethod === 'UPI') {
      paymentSuccessMessage = `Simulated: UPI request for ${currencySymbol}${currentInvoice.totalAmount.toFixed(2)} sent to ${upiId}.`;
    } else if (paymentMethod === 'Cash' && currentInvoice.balanceAmount && currentInvoice.balanceAmount > 0) {
        paymentSuccessMessage += ` Change due: ${currencySymbol}${currentInvoice.balanceAmount.toFixed(2)}.`;
    }

    if (currentInvoice.status === 'Paid') {
        const updatedProducts = products.map(p => {
          const cartItem = cartItems.find(ci => ci.id === p.id && ci.type === 'product');
          if (cartItem) {
              return { ...p, stock: p.stock - cartItem.quantity };
          }
          return p;
        });
        setProducts(updatedProducts);
    }

    const storedAppInvoices = localStorage.getItem('appInvoices');
    let allAppInvoices: Invoice[] = storedAppInvoices ? JSON.parse(storedAppInvoices) : [];
    allAppInvoices = [currentInvoice, ...allAppInvoices];
    localStorage.setItem('appInvoices', JSON.stringify(allAppInvoices));

    const custId = `${currentInvoice.customerName.toLowerCase().replace(/\s/g, '_')}-${(currentInvoice.customerPhoneNumber || '').replace(/\D/g, '')}`;
    if(!existingCustomers.find(c => c.id === custId)){
        setExistingCustomers(prev => [...prev, {id: custId, name: currentInvoice.customerName, phoneNumber: currentInvoice.customerPhoneNumber || ''}].sort((a,b) => a.name.localeCompare(b.name)));
    }

    toast({
        title: currentInvoice.status === 'Paid' ? "Sale Finalized!" : "Invoice Saved (Payment Due)",
        description: `${paymentSuccessMessage} ${currentInvoice.status === 'Paid' ? 'Stock updated.' : 'Stock not updated.'}`
    });

    if (currentInvoice.customerPhoneNumber) {
        let baseMessage = `Hello ${currentInvoice.customerName || 'Customer'}, invoice ${currentInvoice.invoiceNumber} from ${currentInvoice.shopName || currentShopName || "Our Store"}. Total: ${currencySymbol}${currentInvoice.totalAmount.toFixed(2)}. Status: ${currentInvoice.status}.`;
        if (currentInvoice.status === 'Due') {
            baseMessage += ` Amount Paid: ${currencySymbol}${currentInvoice.amountReceived.toFixed(2)}. Balance Due: ${currencySymbol}${(currentInvoice.totalAmount - currentInvoice.amountReceived).toFixed(2)}.`;
        } else if (currentInvoice.balanceAmount && currentInvoice.balanceAmount > 0) {
            baseMessage += ` Amount Paid: ${currencySymbol}${currentInvoice.amountReceived.toFixed(2)}. Change: ${currencySymbol}${currentInvoice.balanceAmount.toFixed(2)}.`;
        } else {
            baseMessage += ` Amount Paid: ${currencySymbol}${currentInvoice.amountReceived.toFixed(2)}.`;
        }
        baseMessage += ` Thank you for your purchase!`;

        const whatsappUrl = `https://api.whatsapp.com/send?phone=${currentInvoice.customerPhoneNumber.replace(/\D/g, '')}&text=${encodeURIComponent(baseMessage)}`;
        toast({ title: "Simulated WhatsApp Sent", description: `To: ${currentInvoice.customerPhoneNumber}. Would open: ${whatsappUrl.substring(0,100)}...`});

        const smsMessage = `Invoice ${currentInvoice.invoiceNumber} from ${currentInvoice.shopName || currentShopName || 'Our Store'}. Total: ${currencySymbol}${currentInvoice.totalAmount.toFixed(2)}. Status: ${currentInvoice.status}. Thanks!`;
        toast({ title: "Simulated SMS Sent", description: `To: ${currentInvoice.customerPhoneNumber}. Message: ${smsMessage.substring(0,100)}...`});
    }

    setIsPrintFormatDialogOpen(true);
  };

  const performPrint = (mode: 'a4' | 'thermal') => {
    if (!currentInvoice) return;

    if (mode === 'a4') {
        document.body.classList.add('print-mode-a4');
        document.body.classList.remove('print-mode-thermal');
    } else {
        document.body.classList.add('print-mode-thermal');
        document.body.classList.remove('print-mode-a4');
    }

    setTimeout(() => {
        window.print();
        document.body.classList.remove('print-mode-a4');
        document.body.classList.remove('print-mode-thermal');


        setCartItems([]);
        setCustomerName('');
        setCustomerPhoneNumber('');
        setCardNumber('');
        setCardExpiry('');
        setCardCvv('');
        setUpiId('');
        setAmountReceived('');
        setBalanceAmount(0);
        setSearchTerm('');

        setCurrentInvoice(null);
        setIsInvoiceDialogOpen(false);
        setIsPrintFormatDialogOpen(false);
    }, 250); // Increased timeout slightly for styles to apply
  };


  const cartItemNames = cartItems.map(item => item.name);

  if (!isSettingsLoaded) {
    return (
      <div className="container mx-auto py-4 flex justify-center items-center h-screen">
        <ShoppingBag className="h-12 w-12 animate-pulse text-primary" />
         <p className="ml-4 text-xl">Loading POS...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-primary flex items-center gap-2">
          <ShoppingBag className="h-10 w-10" /> SwiftSale POS - Billing
        </h1>
        <p className="text-muted-foreground">Fast, smart, and efficient point of sale.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-6 w-6 text-primary"/> Add Items to Cart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                <Input
                  type="text"
                  placeholder="Search items by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 h-12 text-base w-full"
                />
              </div>
              <ItemGrid
                items={filteredSearchableItems}
                cartItems={cartItems}
                onItemSelect={handleAddItemToCart}
                onUpdateQuantity={handleUpdateQuantity}
                currencySymbol={currencySymbol}
              />
            </CardContent>
          </Card>

          <CartDisplay
            cartItems={cartItems}
            onRemoveItem={handleRemoveItem}
            onUpdateQuantity={handleUpdateQuantity}
            onUpdateItemPhoneNumber={handleUpdateItemPhoneNumber}
            currencySymbol={currencySymbol}
            gstRatePercentage={settingsGstRate}
          />
        </div>

        <div className="space-y-6">
          <SmartSuggestions cartItemNames={cartItemNames} />

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard className="h-6 w-6 text-primary"/> Finalize Sale</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-28rem)] md:h-auto pr-3">
                <div className="space-y-4">
                <div>
                    <Label htmlFor="existingCustomer" className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" /> Select Existing Customer (Optional)
                    </Label>
                    <Select
                        onValueChange={(value) => {
                        if (value === "new_customer_option") {
                            setCustomerName('');
                            setCustomerPhoneNumber('');
                        } else {
                            const selectedCust = existingCustomers.find(c => c.id === value);
                            if (selectedCust) {
                            setCustomerName(selectedCust.name);
                            setCustomerPhoneNumber(selectedCust.phoneNumber);
                            }
                        }
                        }}
                        value={existingCustomers.find(c=> c.name === customerName && c.phoneNumber === customerPhoneNumber)?.id || "new_customer_option" }
                    >
                        <SelectTrigger id="existingCustomer">
                        <SelectValue placeholder="Search or select a customer" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="new_customer_option">-- Add New Customer --</SelectItem>
                        {existingCustomers.map(cust => (
                            <SelectItem key={cust.id} value={cust.id}>
                            {cust.name} {cust.phoneNumber && `(${cust.phoneNumber})`}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    </div>

                  <div>
                    <Label htmlFor="customerName" className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" /> Customer Name <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="customerName"
                      placeholder="e.g., John Doe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhoneNumber" className="flex items-center">
                     <Phone className="h-4 w-4 mr-2 text-muted-foreground" /> Customer Phone <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="customerPhoneNumber"
                      type="tel"
                      placeholder="e.g., 9876543210"
                      value={customerPhoneNumber}
                      onChange={(e) => setCustomerPhoneNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                      <SelectTrigger id="paymentMethod">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Card">Credit/Debit Card</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Digital Wallet">Digital Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {paymentMethod === 'Card' && (
                    <div className="space-y-3 p-3 border rounded-md bg-muted/20">
                      <p className="text-sm font-medium text-foreground">Enter Card Details <span className="text-destructive ml-1">*</span></p>
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input id="cardNumber" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="cardExpiry">Expiry (MM/YY)</Label>
                          <Input id="cardExpiry" placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor="cardCvv">CVV</Label>
                          <Input id="cardCvv" placeholder="123" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} type="password" />
                        </div>
                      </div>
                       <p className="text-xs text-muted-foreground flex items-center gap-1"><AlertCircle size={14}/> Card payment is simulated. No real transaction will occur.</p>
                    </div>
                  )}

                  {paymentMethod === 'UPI' && (
                    <div className="space-y-3 p-3 border rounded-md bg-muted/20">
                      <p className="text-sm font-medium text-foreground">Enter UPI ID <span className="text-destructive ml-1">*</span></p>
                      <div>
                        <Label htmlFor="upiId">UPI ID</Label>
                        <Input id="upiId" placeholder="yourname@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                      </div>
                       <p className="text-xs text-muted-foreground flex items-center gap-1"><AlertCircle size={14}/> UPI payment is simulated. No real transaction will occur.</p>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="amountReceived" className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" /> Amount Received <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="amountReceived"
                      type="number"
                      placeholder="0.00"
                      value={amountReceived}
                      onChange={handleAmountReceivedChange}
                      step="0.01"
                    />
                  </div>

                  {totalAmount > 0 && (
                    <div className="text-right text-lg mt-2 space-y-1">
                      <p>Total: <span className="font-semibold">{currencySymbol}{totalAmount.toFixed(2)}</span></p>
                      {(typeof amountReceived === 'number' && !isNaN(amountReceived) && amountReceived !== '') &&
                        <p>Received: <span className="font-semibold">{currencySymbol}{Number(amountReceived).toFixed(2)}</span></p>
                      }
                      {(typeof amountReceived === 'number' && !isNaN(amountReceived) && balanceAmount >= 0 && amountReceived >= totalAmount) &&
                        <p>Change: <span className="font-bold text-green-600">{currencySymbol}{balanceAmount.toFixed(2)}</span></p>
                      }
                       {(typeof amountReceived === 'number' && !isNaN(amountReceived) && amountReceived < totalAmount && totalAmount > 0) &&
                        <p className="text-sm text-destructive font-semibold">Balance Due: {currencySymbol}{(totalAmount - amountReceived).toFixed(2)}</p>
                      }
                    </div>
                  )}


                   <Button onClick={handleGenerateInvoice} className="w-full h-12 text-lg mt-4" disabled={cartItems.length === 0}>
                    Generate Invoice
                  </Button>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {currentInvoice && isInvoiceDialogOpen && (
        <Dialog open={isInvoiceDialogOpen} onOpenChange={(open) => {
            if(!open) {
              setIsInvoiceDialogOpen(false);
              setCurrentInvoice(null);
            }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoice Preview - {currentInvoice.invoiceNumber} ({currentInvoice.status})</DialogTitle>
            </DialogHeader>
            <InvoiceView invoice={currentInvoice} />
            <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2 print-hide pt-4">
              <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (currentInvoice?.customerPhoneNumber) {
                        let baseMessage = `Hello ${currentInvoice.customerName || 'Customer'}, invoice ${currentInvoice.invoiceNumber} from ${currentInvoice.shopName || currentShopName || "Our Store"}. Total: ${currencySymbol}${currentInvoice.totalAmount.toFixed(2)}. Status: ${currentInvoice.status}.`;
                        if (currentInvoice.status === 'Due') {
                           baseMessage += ` Amount Paid: ${currencySymbol}${currentInvoice.amountReceived.toFixed(2)}. Balance Due: ${currencySymbol}${(currentInvoice.totalAmount - currentInvoice.amountReceived).toFixed(2)}.`;
                        } else if (currentInvoice.balanceAmount && currentInvoice.balanceAmount > 0) {
                           baseMessage += ` Amount Paid: ${currencySymbol}${currentInvoice.amountReceived.toFixed(2)}. Change: ${currencySymbol}${currentInvoice.balanceAmount.toFixed(2)}.`;
                        } else {
                           baseMessage += ` Amount Paid: ${currencySymbol}${currentInvoice.amountReceived.toFixed(2)}.`;
                        }
                        baseMessage += ` Thank you for your purchase!`;
                        const whatsappUrl = `https://api.whatsapp.com/send?phone=${currentInvoice.customerPhoneNumber.replace(/\D/g, '')}&text=${encodeURIComponent(baseMessage)}`;
                        toast({ title: "WhatsApp Share Simulated", description: `Would open WhatsApp for ${currentInvoice.customerPhoneNumber}. URL: ${whatsappUrl.substring(0,100)}...` });
                        window.open(whatsappUrl, '_blank');
                      } else {
                        toast({ title: "WhatsApp Share Failed", description: "Customer phone number not available for WhatsApp.", variant: "destructive" });
                      }
                    }}
                    disabled={!currentInvoice?.customerPhoneNumber}
                  >
                    Share via WhatsApp
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (currentInvoice?.customerPhoneNumber) {
                         const message = `Invoice ${currentInvoice.invoiceNumber} from ${currentInvoice.shopName || currentShopName || 'Our Store'}. Total: ${currencySymbol}${currentInvoice.totalAmount.toFixed(2)}. Status: ${currentInvoice.status}. Thanks!`;
                        toast({ title: "SMS Send Simulated", description: `SMS with invoice details would be sent to ${currentInvoice.customerPhoneNumber}. Msg: ${message.substring(0,100)}...` });
                      } else {
                        toast({ title: "SMS Send Failed", description: "Customer phone number not available for SMS.", variant: "destructive" });
                      }
                    }}
                    disabled={!currentInvoice?.customerPhoneNumber}
                  >
                    Send SMS (Simulated)
                  </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="button" variant="secondary" onClick={() => {setIsInvoiceDialogOpen(false); setCurrentInvoice(null);}}>Close</Button>
                <Button type="button" onClick={handleFinalizeSale}>
                    <Printer className="w-4 h-4 mr-2" />
                    {currentInvoice.status === 'Due' ? 'Save & Print Options' : 'Finalize & Print Options'}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {isPrintFormatDialogOpen && currentInvoice && (
         <AlertDialog open={isPrintFormatDialogOpen} onOpenChange={(open) => {
            if (!open) {
                setIsPrintFormatDialogOpen(false);
                // Do not clear currentInvoice here if InvoiceView is still meant to use it for printing
                // Clearing invoice and cart should happen AFTER print completes in performPrint
            }
         }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Select Print Format</AlertDialogTitle>
                <AlertDialogDescription>
                    Choose the format for printing your invoice. The invoice preview will be used for printing.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
                    <Button variant="outline" onClick={() => performPrint('a4')} className="w-full sm:w-auto">
                        <Printer className="w-4 h-4 mr-2" /> Print A4 / Save PDF
                    </Button>
                    <Button variant="outline" onClick={() => performPrint('thermal')} className="w-full sm:w-auto">
                        <Printer className="w-4 h-4 mr-2" /> Print Thermal (Receipt)
                    </Button>
                     <AlertDialogCancel onClick={() => {
                        // Reset state as if sale was cancelled after finalization but before printing
                        setIsPrintFormatDialogOpen(false);
                        setCurrentInvoice(null); 
                        setIsInvoiceDialogOpen(false);
                        setCartItems([]);
                        setCustomerName('');
                        setCustomerPhoneNumber('');
                        setCardNumber('');
                        setCardExpiry('');
                        setCardCvv('');
                        setUpiId('');
                        setAmountReceived('');
                        setBalanceAmount(0);
                        setSearchTerm('');
                     }} className="w-full sm:w-auto mt-2 sm:mt-0">Cancel Printing</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

