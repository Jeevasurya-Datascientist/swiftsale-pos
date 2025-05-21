
"use client";

import { useState, useEffect } from 'react';
import type { Invoice, Product } from '@/lib/types';
import { mockInvoices as fallbackMockInvoices } from '@/lib/mockData'; 
import { InvoiceListItem } from '@/components/invoices/InvoiceListItem';
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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { FileText, Search, Printer, MessageSquare, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/hooks/use-toast';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPrintOptionsOpen, setIsPrintOptionsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { currencySymbol, isSettingsLoaded } = useSettings();
  const { toast } = useToast();

  const loadInvoices = () => {
    if (isSettingsLoaded) {
        const storedInvoices = localStorage.getItem('appInvoices');
        const loadedInvoices: Invoice[] = storedInvoices ? JSON.parse(storedInvoices) : fallbackMockInvoices;
        loadedInvoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setInvoices(loadedInvoices);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [isSettingsLoaded]);


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

    const updatedInvoices = invoices.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv);
    updatedInvoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    localStorage.setItem('appInvoices', JSON.stringify(updatedInvoices));
    setInvoices(updatedInvoices);
    setIsEditOpen(false);
    setInvoiceToEdit(null);
    if (isViewOpen && selectedInvoice?.id === updatedInvoice.id) {
        setSelectedInvoice(updatedInvoice); // Update the viewed invoice if it was the one edited
    }
    toast({ title: "Invoice Updated", description: `Invoice ${updatedInvoice.invoiceNumber} has been successfully updated.` });
  };

  const handleOpenPrintOptions = () => {
    if (selectedInvoice) {
        setIsPrintOptionsOpen(true);
    }
  };

  const performActualPrint = (mode: 'a4' | 'thermal') => {
    if (!selectedInvoice) return;

    if (mode === 'a4') {
        document.body.classList.add('print-mode-a4');
        document.body.classList.remove('print-mode-thermal');
    } else {
        document.body.classList.add('print-mode-thermal');
        document.body.classList.remove('print-mode-a4');
    }

    setTimeout(() => { // Timeout to allow styles to apply
        window.print();
        document.body.classList.remove('print-mode-a4', 'print-mode-thermal');
        setIsPrintOptionsOpen(false);
        // Optionally close the main view dialog after printing
        // setIsViewOpen(false); 
        // setSelectedInvoice(null);
    }, 100);
  };

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.status && invoice.status.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isSettingsLoaded) {
    return (
      <div className="container mx-auto py-4 flex justify-center items-center h-screen">
        <FileText className="h-12 w-12 animate-pulse text-primary" />
         <p className="ml-4 text-xl">Loading invoices...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-primary flex items-center gap-2">
          <FileText className="h-10 w-10" /> Invoice History
        </h1>
        <p className="text-muted-foreground">Review all your past transactions and invoices.</p>
      </header>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="text"
            placeholder="Search invoices by number, customer, or status (Paid/Due)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full md:w-1/2 lg:w-1/3"
          />
        </div>
      </div>

      {filteredInvoices.length > 0 ? (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <InvoiceListItem 
              key={invoice.id} 
              invoice={invoice} 
              onViewDetails={handleViewDetails} 
              onEditDetails={handleEditInvoice}
              currencySymbol={currencySymbol}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Invoices Found</h2>
          <p className="text-muted-foreground">
            {searchTerm ? "Try adjusting your search criteria. " : "Your generated invoices will appear here."}
          </p>
        </div>
      )}

      {selectedInvoice && (
        <Dialog open={isViewOpen} onOpenChange={(open) => {
            setIsViewOpen(open);
            if (!open) setSelectedInvoice(null);
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoice Details - {selectedInvoice.invoiceNumber} ({selectedInvoice.status})</DialogTitle>
            </DialogHeader>
            <InvoiceView invoice={selectedInvoice} />
            <DialogFooter className="print-hide flex-col sm:flex-row sm:justify-between gap-2 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                    if (selectedInvoice?.customerPhoneNumber) {
                        const message = `Hello ${selectedInvoice.customerName || 'Customer'}, here is your invoice ${selectedInvoice.invoiceNumber} from ${selectedInvoice.shopName || "Our Store"}. Status: ${selectedInvoice.status}. Total: ${currencySymbol}${selectedInvoice.totalAmount.toFixed(2)}. Amount Paid: ${currencySymbol}${selectedInvoice.amountReceived.toFixed(2)}. ${selectedInvoice.status === 'Due' && selectedInvoice.amountReceived !== undefined ? `Balance Due: ${currencySymbol}${(selectedInvoice.totalAmount - selectedInvoice.amountReceived).toFixed(2)}.` : (selectedInvoice.balanceAmount && selectedInvoice.balanceAmount > 0 ? `Change: ${currencySymbol}${selectedInvoice.balanceAmount.toFixed(2)}.` : '')} Thank you for your purchase!`;
                        toast({ title: "WhatsApp Share Simulated", description: `Would open WhatsApp for ${selectedInvoice.customerPhoneNumber}. Message: ${message.substring(0,100)}...` });
                    } else {
                        toast({ title: "WhatsApp Share Failed", description: "Customer phone number not available for WhatsApp.", variant: "destructive" });
                    }
                    }}
                    disabled={!selectedInvoice?.customerPhoneNumber}
                >
                    <MessageSquare className="w-4 h-4 mr-2"/> Share via WhatsApp
                </Button>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="button" onClick={handleOpenPrintOptions}>
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
                // Optionally close the main invoice dialog as well if print options are dismissed
                // setIsViewOpen(false); 
                // setSelectedInvoice(null);
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
                    <Button variant="outline" onClick={() => performActualPrint('a4')} className="w-full sm:w-auto">
                        <Download className="w-4 h-4 mr-2" /> Print A4 / Save PDF
                    </Button>
                    <Button variant="outline" onClick={() => performActualPrint('thermal')} className="w-full sm:w-auto">
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
