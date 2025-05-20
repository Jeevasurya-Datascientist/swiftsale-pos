
"use client";

import { useState, useEffect } from 'react';
import type { Invoice } from '@/lib/types';
import { mockInvoices as fallbackMockInvoices } from '@/lib/mockData'; 
import { InvoiceListItem } from '@/components/invoices/InvoiceListItem';
import { InvoiceView } from '@/components/invoices/InvoiceView';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Search, Printer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/hooks/use-toast';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { currencySymbol, isSettingsLoaded } = useSettings();
  const { toast } = useToast();

  useEffect(() => {
    if (isSettingsLoaded) {
        const storedInvoices = localStorage.getItem('appInvoices');
        const loadedInvoices = storedInvoices ? JSON.parse(storedInvoices) : fallbackMockInvoices;
        // Sort invoices by date, most recent first
        loadedInvoices.sort((a: Invoice, b: Invoice) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setInvoices(loadedInvoices);
    }
  }, [isSettingsLoaded]);


  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewOpen(true);
  };

  const handlePrintInvoice = () => {
    // Basic browser print
    window.print();
    toast({ title: "Printing Invoice", description: "Your invoice should be printing." });
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
            if (!open) setSelectedInvoice(null); // Clear selection when dialog closes
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoice Details - {selectedInvoice.invoiceNumber} ({selectedInvoice.status || 'N/A'})</DialogTitle>
            </DialogHeader>
            <InvoiceView invoice={selectedInvoice} /> {/* Currency symbol from context */}
            <DialogFooter className="print-hide">
                <Button type="button" onClick={handlePrintInvoice}>
                  <Printer className="w-4 h-4 mr-2" /> Print
                </Button>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Close</Button>
                </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
