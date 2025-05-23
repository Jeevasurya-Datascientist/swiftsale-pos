
"use client";

import { useState, useEffect, ChangeEvent, useRef } from 'react';
import type { Product, Service, CartItem, Invoice, SearchableItem, ExistingCustomer } from '@/lib/types';
import { ItemGrid } from '@/components/dashboard/ItemGrid';
import { CartDisplay } from '@/components/dashboard/CartDisplay';
import { ServiceDetailsDialog } from '@/components/dashboard/ServiceDetailsDialog';
import { SmartSuggestions } from '@/components/dashboard/SmartSuggestions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { InvoiceView } from '@/components/invoices/InvoiceView';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ShoppingBag, CreditCard, Phone, User, DollarSign, AlertCircle, Users, Search, Printer, MessageSquare } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useNotifications } from '@/context/NotificationContext';
import { ScrollArea } from '@/components/ui/scroll-area';

declare var html2pdf: any; // For html2pdf.js if used via CDN

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
  const [isCurrentInvoiceFinalized, setIsCurrentInvoiceFinalized] = useState(false);


  const [isServiceDetailsDialogOpen, setIsServiceDetailsDialogOpen] = useState(false);
  const [currentItemForServiceDialog, setCurrentItemForServiceDialog] = useState<SearchableItem | null>(null);


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
       // Check for html2pdf and guide user if not found
      if (typeof html2pdf === 'undefined') {
        console.warn(
          'html2pdf.js is not loaded. PDF download functionality will not work. Please include it via CDN or install as a package.'
        );
      }
    }
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => console.warn("Audio play failed:", error));
    }
  };
  
  const resetBillingState = () => {
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
    setIsCurrentInvoiceFinalized(false);
  };

  useEffect(() => {
    if (isSettingsLoaded && typeof window !== 'undefined') {
        const storedProductsString = localStorage.getItem('appProducts');
        let loadedProducts: Product[] = [];
        if (storedProductsString) {
            try {
                const parsed = JSON.parse(storedProductsString);
                if(Array.isArray(parsed)) {
                    loadedProducts = parsed.map((p: any) => {
                        const pName = p.name || "Unnamed Product";
                        return {
                            id: p.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
                            name: pName,
                            costPrice: typeof p.costPrice === 'number' ? p.costPrice : (typeof p.sellingPrice === 'number' ? p.sellingPrice : (typeof p.price === 'number' ? p.price : 0)),
                            sellingPrice: typeof p.sellingPrice === 'number' ? p.sellingPrice : (typeof p.price === 'number' ? p.price : 0),
                            stock: typeof p.stock === 'number' ? p.stock : 0,
                            barcode: p.barcode || "",
                            imageUrl: p.imageUrl || defaultPlaceholder(pName),
                            dataAiHint: p.dataAiHint || (pName ? pName.toLowerCase().split(' ').slice(0, 2).join(' ') : 'product image'),
                            category: p.category || undefined,
                            description: p.description || undefined,
                        };
                    });
                }
            } catch (e) {
              console.error("Failed to parse products from localStorage, starting with empty list.", e);
            }
        }
        setProducts(loadedProducts);

        const storedServicesString = localStorage.getItem('appServices');
        let loadedServices: Service[] = [];
        if(storedServicesString) {
            try {
                const parsed = JSON.parse(storedServicesString);
                if(Array.isArray(parsed)) {
                    loadedServices = parsed.map((s: any) => {
                        const sName = s.name || "Unnamed Service";
                        return {
                            id: s.id || `serv-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
                            name: sName,
                            sellingPrice: typeof s.sellingPrice === 'number' ? s.sellingPrice : (typeof s.price === 'number' ? s.price : 0),
                            serviceCode: s.serviceCode || undefined,
                            imageUrl: s.imageUrl || defaultPlaceholder(sName),
                            dataAiHint: s.dataAiHint || (sName ? sName.toLowerCase().split(' ').slice(0, 2).join(' ') : 'service image'),
                            category: s.category || undefined,
                            description: s.description || undefined,
                            duration: s.duration || undefined,
                        };
                    });
                }
            } catch (e) {
              console.error("Failed to parse services from localStorage, starting with empty list.", e);
            }
        }
        setServices(loadedServices);

        const allInvoiceData = localStorage.getItem('appInvoices');
        let allInvoices: Invoice[] = [];
        if (allInvoiceData) {
          try {
            const parsed = JSON.parse(allInvoiceData);
            if (Array.isArray(parsed)) {
              allInvoices = parsed;
            }
          } catch (e) {
            // console.error("Failed to parse invoices from localStorage for customer list, using empty list.", e);
          }
        }
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
    if (isSettingsLoaded && (products.length > 0 || services.length > 0)) {
        const allItems: SearchableItem[] = [
          ...products.map(p => ({ ...p, price: p.sellingPrice, type: 'product' as 'product'})),
          ...services.map(s => ({ ...s, price: s.sellingPrice, type: 'service' as 'service'}))
        ].sort((a, b) => a.name.localeCompare(b.name));
        setSearchableItems(allItems);
    } else if (isSettingsLoaded) {
        setSearchableItems([]);
    }
  }, [products, services, isSettingsLoaded]);

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

  const handleAddItemToCart = (itemIdentifier: string) => {
    let foundItem = filteredSearchableItems.find(item => item.id === itemIdentifier);
    if (!foundItem) {
        foundItem = searchableItems.find(item => item.id === itemIdentifier);
    }

    if (foundItem) {
      if (foundItem.type === 'service') {
        setCurrentItemForServiceDialog(foundItem);
        setIsServiceDetailsDialogOpen(true);
        return;
      }

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

      let canAdd = true;
      if (foundItem.type === 'product') {
          const productDetails = products.find(p => p.id === foundItem.id);
          if (productDetails && prospectiveQuantityInCart > productDetails.stock) {
              canAdd = false;
          }
      }

      if (canAdd) {
        setCartItems((prevCart) => {
            const existingItem = prevCart.find((item) => item.id === foundItem!.id);
            if (existingItem) {
                playSound();
                return prevCart.map((item) =>
                item.id === foundItem!.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                playSound();
                const cartItemToAdd: CartItem = {
                    id: foundItem!.id, name: foundItem!.name, price: (foundItem as any).sellingPrice, quantity: 1, type: foundItem!.type,
                    imageUrl: foundItem!.imageUrl || defaultPlaceholder(foundItem!.name),
                    dataAiHint: foundItem!.dataAiHint, category: foundItem!.category,
                    costPrice: (foundItem as Product).costPrice,
                    barcode: (foundItem as Product).barcode, stock: (foundItem as Product).stock,
                    serviceCode: (foundItem as Service).serviceCode, duration: (foundItem as Service).duration,
                    itemSpecificPhoneNumber: '',
                    itemSpecificNote: '',
                    isPriceOverridden: false,
                };
                return [...prevCart, cartItemToAdd];
            }
        });
        toast({ title: "Item Added", description: `${foundItem.name} added to cart.` });
        if (foundItem.type === 'product') {
            checkAndNotifyLowStock(foundItem as Product, prospectiveQuantityInCart);
        }
      } else {
           toast({ title: "Stock Limit Reached", description: `Cannot add more ${foundItem.name}. Max stock available.`, variant: "destructive" });
      }

    } else {
      toast({ title: "Item Not Found", description: "No product matched your search.", variant: "destructive" });
    }
  };

  const handleConfirmAddServiceToCart = (details: { phoneNumber?: string; note?: string, customPrice?: number }) => {
    if (!currentItemForServiceDialog || currentItemForServiceDialog.type !== 'service') return;

    const service = currentItemForServiceDialog as Service;
    const priceToUse = details.customPrice !== undefined ? details.customPrice : service.sellingPrice;
    const isPriceOverridden = details.customPrice !== undefined;


    setCartItems((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === service.id && item.itemSpecificNote === details.note && item.itemSpecificPhoneNumber === details.phoneNumber && item.price === priceToUse);

        if (existingItem) {
          return prevCart.map((item) =>
            item.id === service.id && item.itemSpecificNote === details.note && item.itemSpecificPhoneNumber === details.phoneNumber && item.price === priceToUse
            ? { ...item, quantity: item.quantity + 1 }
            : item
          );
        } else {
            const cartItemToAdd: CartItem = {
                id: service.id, name: service.name, price: priceToUse, quantity: 1, type: 'service',
                imageUrl: service.imageUrl || defaultPlaceholder(service.name),
                dataAiHint: service.dataAiHint, category: service.category,
                serviceCode: service.serviceCode, duration: service.duration, costPrice: 0,
                itemSpecificPhoneNumber: details.phoneNumber || '',
                itemSpecificNote: details.note || '',
                isPriceOverridden: isPriceOverridden,
            };
            return [...prevCart, cartItemToAdd];
        }
    });
    playSound();
    toast({ title: "Service Added", description: `${service.name} added to cart.` });
    setIsServiceDetailsDialogOpen(false);
    setCurrentItemForServiceDialog(null);
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

    const previousQuantity = cartItem.quantity;

    setCartItems((prevCart) =>
      prevCart.map((item) => (item.id === itemId ? { ...item, quantity: quantityToSet } : item))
    );

    if (quantityToSet > previousQuantity && (cartItem.type !== 'product' || (productDetails && quantityToSet <= productDetails.stock))) {
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
  const handleUpdateItemNote = (itemId: string, note: string) => {
     setCartItems(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, itemSpecificNote: note } : item
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
      gstRate: currentGstRate,
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
    setIsCurrentInvoiceFinalized(false); // Reset finalized state for new invoice preview
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
  
  const finalizeAndSaveCurrentInvoice = (): boolean => {
    if (!currentInvoice) {
        toast({ title: "Error", description: "No current invoice to finalize.", variant: "destructive" });
        return false;
    }

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
      try {
        const updatedProducts = products.map(p => {
          const cartItem = currentInvoice.items.find(ci => ci.id === p.id && ci.type === 'product');
          if (cartItem) {
              return { ...p, stock: p.stock - cartItem.quantity };
          }
          return p;
        });
        setProducts(updatedProducts);
        localStorage.setItem('appProducts', JSON.stringify(updatedProducts));
      } catch (error) {
        console.error("Error updating product stock in localStorage:", error);
        toast({title: "Stock Update Error", description: "Could not update product stock due to storage issue.", variant: "destructive"});
      }
    }

    try {
      const storedAppInvoices = localStorage.getItem('appInvoices');
      let allAppInvoices: Invoice[] = [];
       if (storedAppInvoices) {
            try {
                const parsed = JSON.parse(storedAppInvoices);
                if (Array.isArray(parsed)) {
                    allAppInvoices = parsed;
                }
            } catch (e) {
                 // console.error("Failed to parse existing invoices for saving, starting with empty list", e);
            }
        }
      allAppInvoices = [currentInvoice, ...allAppInvoices];
      localStorage.setItem('appInvoices', JSON.stringify(allAppInvoices));
    } catch (error) {
      console.error("Error saving invoice to localStorage:", error);
      toast({title: "Invoice Save Error", description: "Could not save invoice due to storage issue.", variant: "destructive"});
      return false;
    }


    const custId = `${currentInvoice.customerName.toLowerCase().replace(/\s/g, '_')}-${(currentInvoice.customerPhoneNumber || '').replace(/\D/g, '')}`;
    if(!existingCustomers.find(c => c.id === custId)){
        setExistingCustomers(prev => [...prev, {id: custId, name: currentInvoice.customerName, phoneNumber: currentInvoice.customerPhoneNumber || ''}].sort((a,b) => a.name.localeCompare(b.name)));
    }

    toast({
        title: currentInvoice.status === 'Paid' ? "Sale Finalized!" : "Invoice Saved (Payment Due)",
        description: `${paymentSuccessMessage} ${currentInvoice.status === 'Paid' ? 'Stock updated.' : 'Stock not updated.'}`
    });
    return true;
  };


  const handlePrintOptionsOpen = () => {
    if (!currentInvoice) return;
    if (!isCurrentInvoiceFinalized) {
        const success = finalizeAndSaveCurrentInvoice();
        if (!success) {
            toast({ title: "Save Failed", description: "Could not save invoice before printing.", variant: "destructive" });
            return;
        }
        setIsCurrentInvoiceFinalized(true);
    }
    setIsPrintFormatDialogOpen(true);
  };

  const handleDownloadCurrentInvoiceAsPdf = async () => {
    if (!currentInvoice) {
      toast({ title: "Download Error", description: "No invoice to download.", variant: "destructive" });
      return;
    }
    if (typeof html2pdf === 'undefined') {
        toast({ title: "PDF Library Missing", description: "html2pdf.js is not loaded. Cannot download PDF.", variant: "destructive" });
        return;
    }

    if (!isCurrentInvoiceFinalized) {
        const success = finalizeAndSaveCurrentInvoice();
         if (!success) {
            toast({ title: "Save Failed", description: "Could not save invoice before PDF download.", variant: "destructive" });
            return;
        }
        setIsCurrentInvoiceFinalized(true); // Mark as finalized since we are proceeding to generate PDF
    }

    const invoiceElement = document.getElementById('invoice-view-content');
    if (!invoiceElement) {
      toast({ title: "Download Error", description: "Invoice content not found for PDF generation.", variant: "destructive" });
      return;
    }

    document.body.classList.add('print-mode-a4'); // Apply A4 styling for PDF generation

    const options = {
      margin: 10, // mm
      filename: `invoice-${currentInvoice.invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().from(invoiceElement).set(options).save();
      toast({ title: "PDF Downloaded", description: `Invoice ${currentInvoice.invoiceNumber}.pdf has been downloaded.` });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({ title: "PDF Generation Error", description: "Could not generate PDF.", variant: "destructive" });
    } finally {
      document.body.classList.remove('print-mode-a4');
      // Close dialogs and reset state after PDF generation attempt
      setIsPrintFormatDialogOpen(false); 
      setIsInvoiceDialogOpen(false);
      resetBillingState(); 
    }
  };


  const performPrint = (mode: 'a4' | 'thermal') => {
    if (!currentInvoice) {
      toast({ title: "Print Error", description: "No invoice selected to print.", variant: "destructive" });
      setIsPrintFormatDialogOpen(false);
      setIsInvoiceDialogOpen(false);
      return;
    }
    
    // Invoice is already finalized by handlePrintOptionsOpen or the primary finalize button
    // So, no need to call finalizeAndSaveCurrentInvoice() here again.

    setIsPrintFormatDialogOpen(false); // Close format dialog before system print dialog

    if (mode === 'a4') {
        document.body.classList.add('print-mode-a4');
        document.body.classList.remove('print-mode-thermal');
    } else {
        document.body.classList.add('print-mode-thermal');
        document.body.classList.remove('print-mode-a4');
    }

    setTimeout(() => {
        window.print();
        document.body.classList.remove('print-mode-a4', 'print-mode-thermal');
        setIsInvoiceDialogOpen(false); // Ensure main preview dialog is also closed
        resetBillingState();
    }, 150); 
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
            onUpdateItemNote={handleUpdateItemNote}
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
                        <p className="text-sm text-destructive font-semibold">Balance Due: {currencySymbol}{(totalAmount - Number(amountReceived)).toFixed(2)}</p>
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

      {isServiceDetailsDialogOpen && currentItemForServiceDialog && (
        <ServiceDetailsDialog
          isOpen={isServiceDetailsDialogOpen}
          serviceName={currentItemForServiceDialog.name}
          defaultPrice={(currentItemForServiceDialog as Service).sellingPrice || 0}
          onClose={() => {
            setIsServiceDetailsDialogOpen(false);
            setCurrentItemForServiceDialog(null);
          }}
          onConfirm={handleConfirmAddServiceToCart}
        />
      )}

      {currentInvoice && isInvoiceDialogOpen && (
        <Dialog open={isInvoiceDialogOpen} onOpenChange={(openState) => {
            if (!openState) { // If dialog is closing
                if (!isPrintFormatDialogOpen) { // And print format dialog is NOT open
                    resetBillingState(); // Then reset everything
                }
                // If print format dialog IS open, let its onOpenChange handle the reset
            }
            setIsInvoiceDialogOpen(openState);
        }}>
          <DialogContent className="max-w-2xl invoice-view-dialog-content">
            <DialogHeader>
              <DialogTitle>Invoice Preview - {currentInvoice.invoiceNumber} ({currentInvoice.status})</DialogTitle>
            </DialogHeader>
            <InvoiceView invoice={currentInvoice} />
            <DialogFooter className="flex flex-col space-y-2 pt-4 sm:flex-row sm:space-y-0 sm:justify-between sm:items-center print-hide gap-2">
              <div className="flex flex-col space-y-2 xs:flex-row xs:space-y-0 xs:space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full xs:w-auto"
                    onClick={() => {
                      if (currentInvoice?.customerPhoneNumber) {
                        let phoneNumber = currentInvoice.customerPhoneNumber.replace(/\D/g, '');
                        if (phoneNumber.length === 10 && !phoneNumber.startsWith('91')) {
                            phoneNumber = `91${phoneNumber}`;
                        }
                        let baseMessage = `Hello ${currentInvoice.customerName || 'Customer'}, invoice ${currentInvoice.invoiceNumber} from ${currentInvoice.shopName || currentShopName || "Our Store"}. Total: ${currencySymbol}${currentInvoice.totalAmount.toFixed(2)}. Status: ${currentInvoice.status}.`;
                        if (currentInvoice.status === 'Due') {
                           baseMessage += ` Amount Paid: ${currencySymbol}${currentInvoice.amountReceived.toFixed(2)}. Balance Due: ${currencySymbol}${(currentInvoice.totalAmount - currentInvoice.amountReceived).toFixed(2)}.`;
                        } else if (currentInvoice.balanceAmount && currentInvoice.balanceAmount > 0) {
                           baseMessage += ` Amount Paid: ${currencySymbol}${currentInvoice.amountReceived.toFixed(2)}. Change: ${currencySymbol}${currentInvoice.balanceAmount.toFixed(2)}.`;
                        } else {
                           baseMessage += ` Amount Paid: ${currencySymbol}${currentInvoice.amountReceived.toFixed(2)}.`;
                        }
                        baseMessage += ` Thank you for your purchase!`;
                        const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(baseMessage)}`;
                        toast({ title: "WhatsApp Share Simulated", description: `Would open WhatsApp for ${currentInvoice.customerPhoneNumber}.` });
                        window.open(whatsappUrl, '_blank');
                      } else {
                        toast({ title: "WhatsApp Share Failed", description: "Customer phone number not available for WhatsApp.", variant: "destructive" });
                      }
                    }}
                    disabled={!currentInvoice?.customerPhoneNumber}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" /> Share via WhatsApp (+91)
                  </Button>
              </div>
              <div className="flex flex-col space-y-2 xs:flex-row xs:space-y-0 xs:space-x-2 sm:justify-end">
                 <Button 
                    type="button" 
                    variant="secondary" 
                    className="w-full xs:w-auto"
                    onClick={() => {
                        setIsInvoiceDialogOpen(false); 
                        resetBillingState();
                    }}
                  >
                    Close
                  </Button>
                <Button 
                    type="button" 
                    className="w-full xs:w-auto"
                    onClick={() => {
                        if(!isCurrentInvoiceFinalized) {
                            const success = finalizeAndSaveCurrentInvoice();
                            if(success) setIsCurrentInvoiceFinalized(true);
                            else return; // Stop if finalization failed
                        }
                        // If already finalized, or finalized successfully, open print options
                        setIsPrintFormatDialogOpen(true); 
                    }}
                    disabled={isCurrentInvoiceFinalized && currentInvoice.status === 'Paid'} // Disable if already finalized & paid
                >
                    <Printer className="w-4 h-4 mr-2" />
                    {isCurrentInvoiceFinalized 
                        ? (currentInvoice.status === 'Due' ? 'Print Options (Due)' : 'Print Options (Paid)') 
                        : (currentInvoice.status === 'Due' ? 'Save & Print Options' : 'Finalize & Print Options')}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {isPrintFormatDialogOpen && currentInvoice && (
         <AlertDialog open={isPrintFormatDialogOpen} onOpenChange={(open) => {
             if(!open) { // If dialog is closing
                setIsPrintFormatDialogOpen(false);
                setIsInvoiceDialogOpen(false); // Ensure main preview is also closed
                resetBillingState(); // Always reset state when print flow is done/cancelled
             }
         }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Select Print Format</AlertDialogTitle>
                <AlertDialogDescription>
                    Choose the format for printing your invoice. The invoice preview will be used for printing.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:space-x-2">
                    <AlertDialogCancel
                        onClick={() => {
                            setIsPrintFormatDialogOpen(false);
                            setIsInvoiceDialogOpen(false);
                            resetBillingState();
                        }}
                        className="w-full sm:w-auto"
                    >
                        Cancel Printing
                    </AlertDialogCancel>
                    <Button variant="outline" onClick={handleDownloadCurrentInvoiceAsPdf} className="whitespace-normal h-auto w-full sm:w-auto">
                        <Download className="w-4 h-4 mr-2" /> Download PDF (A4)
                    </Button>
                    <Button variant="outline" onClick={() => performPrint('thermal')} className="w-full sm:w-auto">
                        <Printer className="w-4 h-4 mr-2" /> Print Thermal (Receipt)
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

