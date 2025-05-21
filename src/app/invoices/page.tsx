
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Invoice, Product } from '@/lib/types';
import { mockInvoices as fallbackMockInvoices } from '@/lib/mockData'; 
import { InvoiceView } from '@/components/invoices/InvoiceView';
import { EditInvoiceDialog } from '@/components/invoices/EditInvoiceDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { FileText, Search, Printer, MessageSquare, Download, Eye, Share2, Calendar as CalendarIconLucide } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { ReportTimeFilter } from '@/lib/types';
import type { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPrintOptionsOpen, setIsPrintOptionsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { currencySymbol, shopName: currentShopName, isSettingsLoaded } = useSettings();
  const { toast } = useToast();

  const [timeFilter, setTimeFilter] = useState<ReportTimeFilter>('allTime');
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
  const [isDateFilterPopoverOpen, setIsDateFilterPopoverOpen] = useState(false);


  const loadInvoices = useCallback(() => {
    if (isSettingsLoaded) {
        let storedInvoices = localStorage.getItem('appInvoices');
        if (!storedInvoices) { // Fallback to mock if nothing in localStorage
            localStorage.setItem('appInvoices', JSON.stringify(fallbackMockInvoices));
            storedInvoices = JSON.stringify(fallbackMockInvoices);
        }
        const loadedInvoices: Invoice[] = storedInvoices ? JSON.parse(storedInvoices) : fallbackMockInvoices;
        
        let currentFilteredInvoices = loadedInvoices;
        if (timeFilter !== 'allTime') {
            const now = new Date();
            let startDate: Date | null = null;
            let endDate: Date | null = null;

            switch (timeFilter) {
                case 'today':
                    startDate = new Date(new Date(now).setHours(0, 0, 0, 0)); // ensure 'now' is not mutated for start
                    endDate = new Date(new Date(now).setHours(23, 59, 59, 999)); 
                    break;
                case 'last7days':
                    startDate = new Date(new Date().setDate(now.getDate() - 6));
                    startDate.setHours(0,0,0,0);
                    endDate = new Date(new Date(now).setHours(23, 59, 59, 999));
                    break;
                case 'last30days':
                    startDate = new Date(new Date().setDate(now.getDate() - 29));
                    startDate.setHours(0,0,0,0);
                    endDate = new Date(new Date(now).setHours(23, 59, 59, 999));
                    break;
                case 'thisMonth':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                    break;
                case 'custom':
                    if (customDateRange?.from) {
                        startDate = new Date(new Date(customDateRange.from).setHours(0,0,0,0));
                        endDate = customDateRange.to ? new Date(new Date(customDateRange.to).setHours(23,59,59,999)) : new Date(new Date(customDateRange.from).setHours(23,59,59,999));
                    }
                    break;
            }
            if (startDate && endDate) {
                currentFilteredInvoices = currentFilteredInvoices.filter(inv => {
                    const invDate = new Date(inv.date);
                    return invDate >= startDate! && invDate <= endDate!;
                });
            }
        }
        currentFilteredInvoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setInvoices(currentFilteredInvoices);
    }
  }, [isSettingsLoaded, timeFilter, customDateRange]); 
  
  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  useEffect(() => {
    (window as any).invoicePageContext = {
        setIsViewOpen, setSelectedInvoice, setInvoiceToEdit, setIsEditOpen
    };
    return () => {
        delete (window as any).invoicePageContext;
    }
  }, [setIsViewOpen, setSelectedInvoice, setInvoiceToEdit, setIsEditOpen]);


  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setInvoiceToEdit(invoice);
    setIsEditOpen(true);
  };

  const handleSaveEditedInvoice = (updatedInvoice: Invoice) => {
    const originalInvoice = invoices.find(inv => inv.id === updatedInvoice.id);
    if (originalInvoice && originalInvoice.status === 'Due' && updatedInvoice.status === 'Paid') {
        const storedProducts = localStorage.getItem('appProducts');
        let currentProducts: Product[] = storedProducts ? JSON.parse(storedProducts) : [];
        
        updatedInvoice.items.forEach(cartItem => {
            if (cartItem.type === 'product') {
                currentProducts = currentProducts.map(p => {
                    if (p.id === cartItem.id) {
                        return { ...p, stock: p.stock - cartItem.quantity };
                    }
                    return p;
                });
            }
        });
        localStorage.setItem('appProducts', JSON.stringify(currentProducts));
        toast({title: "Stock Updated", description: "Product stock levels adjusted for newly paid invoice."})
    }

    const allStoredInvoices = JSON.parse(localStorage.getItem('appInvoices') || '[]') as Invoice[];
    const updatedAllInvoices = allStoredInvoices.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv);
    localStorage.setItem('appInvoices', JSON.stringify(updatedAllInvoices));
    
    loadInvoices(); 

    setIsEditOpen(false);
    setInvoiceToEdit(null);
    if (isViewOpen && selectedInvoice?.id === updatedInvoice.id) {
        setSelectedInvoice(updatedInvoice); 
    }
    toast({ title: "Invoice Updated", description: `Invoice ${updatedInvoice.invoiceNumber} has been successfully updated.` });
  };

  const performActualPrint = (mode: 'a4' | 'thermal', invoiceToPrint: Invoice | null) => {
    if (!invoiceToPrint) return;

    const originalSelectedInvoice = selectedInvoice;
    const originalIsViewOpen = isViewOpen;
    const dialogAlreadyOpenForThisInvoice = isViewOpen && selectedInvoice?.id === invoiceToPrint.id;

    setSelectedInvoice(invoiceToPrint); 
    if(!dialogAlreadyOpenForThisInvoice) setIsViewOpen(true); 


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
        setIsPrintOptionsOpen(false); 
        
        if(!dialogAlreadyOpenForThisInvoice) {
            setIsViewOpen(false); 
            setSelectedInvoice(null);
        } else if (originalIsViewOpen && originalSelectedInvoice?.id !== invoiceToPrint.id) {
            setSelectedInvoice(originalSelectedInvoice);
            setIsViewOpen(true);
        }

    }, 250);
  };

  const handleShareInvoiceRow = (invoiceToShare: Invoice) => {
    if (invoiceToShare?.customerPhoneNumber) {
        let phoneNumber = invoiceToShare.customerPhoneNumber.replace(/\D/g, ''); 
        if (phoneNumber.length === 10 && !phoneNumber.startsWith('91')) { 
            phoneNumber = `91${phoneNumber}`;
        }

        const message = `Hello ${invoiceToShare.customerName || 'Customer'}, here is your invoice ${invoiceToShare.invoiceNumber} from ${invoiceToShare.shopName || currentShopName || "Our Store"}. Status: ${invoiceToShare.status}. Total: ${currencySymbol}${invoiceToShare.totalAmount.toFixed(2)}. Amount Paid: ${currencySymbol}${invoiceToShare.amountReceived.toFixed(2)}. ${invoiceToShare.status === 'Due' && invoiceToShare.amountReceived !== undefined ? `Balance Due: ${currencySymbol}${(invoiceToShare.totalAmount - invoiceToShare.amountReceived).toFixed(2)}.` : (invoiceToShare.balanceAmount && invoiceToShare.balanceAmount > 0 ? `Change: ${currencySymbol}${invoiceToShare.balanceAmount.toFixed(2)}.` : '')} Thank you for your purchase!`;
        
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        toast({ title: "WhatsApp Redirecting...", description: `Opening WhatsApp for ${invoiceToShare.customerPhoneNumber}.` });

    } else {
        toast({ title: "WhatsApp Share Failed", description: "Customer phone number not available for WhatsApp.", variant: "destructive" });
    }
  };

  const filteredInvoicesBySearch = invoices.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.status && invoice.status.toLowerCase().includes(searchTerm.toLowerCase()))
  );


  if (!isSettingsLoaded) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center h-screen">
        <FileText className="h-12 w-12 animate-pulse text-primary" />
         <p className="ml-4 text-xl">Loading invoices...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-primary flex items-center">
          Invoices
        </h1>
        <Popover open={isDateFilterPopoverOpen} onOpenChange={setIsDateFilterPopoverOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline">
                    <CalendarIconLucide className="mr-2 h-4 w-4" /> Filter by Date
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
                <div className="p-4 space-y-3">
                    <Select value={timeFilter} onValueChange={(value) => {
                        setTimeFilter(value as ReportTimeFilter);
                        if (value !== 'custom') setCustomDateRange(undefined);
                        if (value !== 'custom') setIsDateFilterPopoverOpen(false); 
                    }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select time range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="allTime">All Time</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="last7days">Last 7 Days</SelectItem>
                            <SelectItem value="last30days">Last 30 Days</SelectItem>
                            <SelectItem value="thisMonth">This Month</SelectItem>
                            <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                    </Select>
                    {timeFilter === 'custom' && (
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={customDateRange?.from}
                            selected={customDateRange}
                            onSelect={(range) => {
                                setCustomDateRange(range);
                                if (range?.from && range?.to) setIsDateFilterPopoverOpen(false); 
                                else if (range?.from && !range.to) {} 
                                else if (!range?.from) setIsDateFilterPopoverOpen(true); 
                            }}
                            numberOfMonths={1}
                            className="[&_button]:h-8 [&_button]:w-8 [&_caption_label]:text-sm"
                        />
                    )}
                </div>
            </PopoverContent>
        </Popover>
      </header>

      <Card className="shadow-lg">
        <CardHeader className="border-b px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <CardTitle className="text-xl">All Invoices</CardTitle>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        type="text"
                        placeholder="Search invoices by #, customer, status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-9"
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
            {filteredInvoicesBySearch.length > 0 ? (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[150px] px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Invoice #</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
                    <TableHead className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredInvoicesBySearch.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{invoice.invoiceNumber}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{format(new Date(invoice.date), 'dd-MM-yyyy')}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        <div className="font-medium text-foreground">{invoice.customerName}</div>
                        {invoice.customerPhoneNumber && <div className="text-xs">{invoice.customerPhoneNumber}</div>}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{currencySymbol}{invoice.totalAmount.toFixed(2)}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={invoice.status === 'Paid' ? 'default' : 'secondary'}>
                        {invoice.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-center space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetails(invoice)} title="View Details">
                            <Eye className="h-5 w-5 text-muted-foreground hover:text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => performActualPrint('a4', invoice)} title="Download PDF / Print A4">
                            <Download className="h-5 w-5 text-muted-foreground hover:text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleShareInvoiceRow(invoice)} title="Share via WhatsApp">
                            <Share2 className="h-5 w-5 text-muted-foreground hover:text-primary" />
                        </Button>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            ) : (
            <div className="text-center py-12 px-6">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-3" />
                <h2 className="text-xl font-semibold mb-1">No Invoices Found</h2>
                <p className="text-muted-foreground text-sm">
                {searchTerm ? "Try adjusting your search criteria. " : (timeFilter !== 'allTime' || customDateRange) ? "No invoices match the selected date filter. " : "Your generated invoices will appear here."}
                </p>
            </div>
            )}
        </CardContent>
      </Card>

      {selectedInvoice && (
        <Dialog open={isViewOpen} onOpenChange={(open) => {
            setIsViewOpen(open);
            if (!open) setSelectedInvoice(null);
        }}>
          <DialogContent className="max-w-2xl invoice-view-dialog-content">
            <DialogHeader>
              <DialogTitle>Invoice Details - {selectedInvoice.invoiceNumber} ({selectedInvoice.status})</DialogTitle>
            </DialogHeader>
            <InvoiceView invoice={selectedInvoice} />
            <DialogFooter className="print-hide flex-col sm:flex-row sm:justify-between gap-2 pt-4">
              <div className='flex gap-2'>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleShareInvoiceRow(selectedInvoice)}
                    disabled={!selectedInvoice?.customerPhoneNumber}
                >
                    <MessageSquare className="w-4 h-4 mr-2"/> Share via WhatsApp
                </Button>
                 <Button
                    type="button"
                    variant="outline"
                    onClick={() => { handleEditOpen(selectedInvoice); }}
                >
                    Edit Invoice
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="button" onClick={() => setIsPrintOptionsOpen(true)}>
                  <Printer className="w-4 h-4 mr-2" /> Print / Download Options
                </Button>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Close</Button>
                </DialogClose>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {selectedInvoice && isPrintOptionsOpen && (
         <AlertDialog open={isPrintOptionsOpen} onOpenChange={(open) => {
            if (!open) {
                setIsPrintOptionsOpen(false);
            }
         }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Select Print Format</AlertDialogTitle>
                <AlertDialogDescription>
                    Choose the format for printing your invoice. "Print A4" can also be used to "Save as PDF" via your browser's print dialog.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
                    <Button variant="outline" onClick={() => performActualPrint('a4', selectedInvoice)} className="w-full sm:w-auto">
                        <Download className="w-4 h-4 mr-2" /> Print A4 / Save PDF
                    </Button>
                    <Button variant="outline" onClick={() => performActualPrint('thermal', selectedInvoice)} className="w-full sm:w-auto">
                        <Printer className="w-4 h-4 mr-2" /> Print Thermal (Receipt)
                    </Button>
                     <AlertDialogCancel onClick={() => setIsPrintOptionsOpen(false)} className="w-full sm:w-auto mt-2 sm:mt-0">Cancel</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}

      {invoiceToEdit && (
        <EditInvoiceDialog
          isOpen={isEditOpen}
          onClose={() => { setIsEditOpen(false); setInvoiceToEdit(null); }}
          invoice={invoiceToEdit}
          onSave={handleSaveEditedInvoice}
          currencySymbol={currencySymbol}
        />
      )}
    </div>
  );
}

// Helper to open edit dialog from view dialog
const handleEditOpen = (invoice: Invoice | null) => {
    if (invoice) {
        const context = (window as any).invoicePageContext;
        if (context) {
            if (context.setIsViewOpen) context.setIsViewOpen(false);
            if (context.setSelectedInvoice) context.setSelectedInvoice(null);
            if (context.setInvoiceToEdit) context.setInvoiceToEdit(invoice);
            if (context.setIsEditOpen) context.setIsEditOpen(true);
        }
    }
};
