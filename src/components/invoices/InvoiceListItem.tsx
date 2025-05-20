"use client";

import type { Invoice } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { FileText, User, CalendarDays, CreditCard, Eye } from 'lucide-react';
import { Button } from '../ui/button';

interface InvoiceListItemProps {
  invoice: Invoice;
  onViewDetails: (invoice: Invoice) => void;
  currencySymbol?: string;
}

export function InvoiceListItem({ invoice, onViewDetails, currencySymbol = '$' }: InvoiceListItemProps) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Invoice {invoice.invoiceNumber}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => onViewDetails(invoice)}>
            <Eye className="w-4 h-4 mr-1" /> View
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <User className="w-4 h-4" />
          <span>Customer:</span>
          <span className="font-medium text-foreground">{invoice.customerName}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <CalendarDays className="w-4 h-4" />
          <span>Date:</span>
          <span className="font-medium text-foreground">{format(new Date(invoice.date), 'MMM dd, yyyy HH:mm')}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <CreditCard className="w-4 h-4" />
          <span>Payment:</span>
          <Badge variant="secondary" className="text-xs">{invoice.paymentMethod}</Badge>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <strong className="text-foreground">Total:</strong>
          <span className="font-semibold text-lg text-primary">{currencySymbol}{invoice.totalAmount.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
