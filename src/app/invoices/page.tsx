"use client";

import { useState } from 'react';
import type { Invoice } from '@/lib/types';
import { mockInvoices } from '@/lib/mockData'; // Assuming you'll add mock invoices
import { InvoiceListItem } from '@/components/invoices/InvoiceListItem';
import { InvoiceView } from '@/components/invoices/InvoiceView';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices); // Use mockInvoices
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewOpen(true);
  };

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );


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
            placeholder="Search invoices by number or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full md:w-1/2 lg:w-1/3"
          />
        </div>
      </div>

      {filteredInvoices.length > 0 ? (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <InvoiceListItem key={invoice.id} invoice={invoice} onViewDetails={handleViewDetails} />
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
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoice Details - {selectedInvoice.invoiceNumber}</DialogTitle>
            </DialogHeader>
            <InvoiceView invoice={selectedInvoice} currencySymbol="$" />
            <DialogFooter>
                <Button type="button" onClick={() => { /* Logic for printing */ alert("Printing (simulated)...") }}>Print</Button>
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
