
"use client";

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Invoice } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';

const editInvoiceSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerPhoneNumber: z.string().optional().refine(val => !val || /^\d{10,}$/.test(val.replace(/\D/g, '')), {
    message: "Must be a valid 10-digit phone number if provided.",
  }),
  status: z.enum(['Paid', 'Due']),
  amountReceived: z.coerce.number().min(0, "Amount received cannot be negative."),
});

type EditInvoiceFormValues = z.infer<typeof editInvoiceSchema>;

interface EditInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onSave: (updatedInvoice: Invoice) => void;
  currencySymbol: string;
}

export function EditInvoiceDialog({ isOpen, onClose, invoice, onSave, currencySymbol }: EditInvoiceDialogProps) {
  const { toast } = useToast();
  const { control, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm<EditInvoiceFormValues>({
    resolver: zodResolver(editInvoiceSchema),
    defaultValues: {
      customerName: invoice.customerName,
      customerPhoneNumber: invoice.customerPhoneNumber || '',
      status: invoice.status,
      amountReceived: invoice.amountReceived,
    },
  });

  const watchedStatus = watch('status');
  const watchedAmountReceived = watch('amountReceived');

  useEffect(() => {
    reset({
      customerName: invoice.customerName,
      customerPhoneNumber: invoice.customerPhoneNumber || '',
      status: invoice.status,
      amountReceived: invoice.amountReceived,
    });
  }, [invoice, reset]);

  // Auto-update amountReceived if status changes to 'Paid' and current amountReceived is less than total
  useEffect(() => {
    if (watchedStatus === 'Paid' && invoice.status === 'Due') {
      if (watchedAmountReceived < invoice.totalAmount) {
        setValue('amountReceived', invoice.totalAmount, { shouldDirty: true });
        toast({
          title: "Amount Auto-Adjusted",
          description: `Amount received set to total invoice amount (${currencySymbol}${invoice.totalAmount.toFixed(2)}) as status changed to 'Paid'.`,
          duration: 5000,
        });
      }
    }
  }, [watchedStatus, invoice, setValue, watchedAmountReceived, currencySymbol, toast]);


  const handleFormSubmit = (data: EditInvoiceFormValues) => {
    let newBalanceAmount = data.amountReceived - invoice.totalAmount;

    // If status is 'Paid', ensure amountReceived covers totalAmount, or adjust
    if (data.status === 'Paid' && data.amountReceived < invoice.totalAmount) {
        toast({
            variant: "destructive",
            title: "Payment Shortfall",
            description: `For 'Paid' status, Amount Received (${currencySymbol}${data.amountReceived.toFixed(2)}) must be at least Total Amount (${currencySymbol}${invoice.totalAmount.toFixed(2)}). It has been auto-adjusted.`,
            duration: 7000,
        });
        setValue('amountReceived', invoice.totalAmount); // Auto-correct
        data.amountReceived = invoice.totalAmount; // use corrected value for save
        newBalanceAmount = 0;
    }


    const updatedInvoice: Invoice = {
      ...invoice,
      customerName: data.customerName,
      customerPhoneNumber: data.customerPhoneNumber,
      status: data.status,
      amountReceived: data.amountReceived,
      balanceAmount: newBalanceAmount,
    };
    onSave(updatedInvoice);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Invoice - {invoice.invoiceNumber}</DialogTitle>
          <DialogDescription>Modify customer details or payment status. Item details cannot be changed.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(100vh-15rem)] p-1 pr-3">
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 p-2">
            <div className="p-4 border rounded-md bg-muted/50">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Original Invoice Summary</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <p>Total Amount:</p><p className="font-semibold text-right">{currencySymbol}{invoice.totalAmount.toFixed(2)}</p>
                    <p>GST ({ (invoice.gstRate * 100).toFixed(invoice.gstRate * 100 % 1 === 0 ? 0 : 2) }%):</p><p className="text-right">{currencySymbol}{invoice.gstAmount.toFixed(2)}</p>
                    <p>Original Status:</p><p className="text-right">{invoice.status}</p>
                </div>
            </div>

            <FormField
                control={control}
                name="customerName"
                render={({ field }) => (
                <FormItem>
                    <Label htmlFor="customerNameEdit">Customer Name</Label>
                    <Input id="customerNameEdit" {...field} />
                    {errors.customerName && <p className="text-sm text-destructive mt-1">{errors.customerName.message}</p>}
                </FormItem>
                )}
            />
            <FormField
                control={control}
                name="customerPhoneNumber"
                render={({ field }) => (
                <FormItem>
                    <Label htmlFor="customerPhoneNumberEdit">Customer Phone (Optional)</Label>
                    <Input id="customerPhoneNumberEdit" type="tel" {...field} />
                    {errors.customerPhoneNumber && <p className="text-sm text-destructive mt-1">{errors.customerPhoneNumber.message}</p>}
                </FormItem>
                )}
            />
            <FormField
                control={control}
                name="status"
                render={({ field }) => (
                <FormItem>
                    <Label htmlFor="invoiceStatusEdit">Invoice Status</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="invoiceStatusEdit">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Due">Due</SelectItem>
                    </SelectContent>
                    </Select>
                    {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
                </FormItem>
                )}
            />
            <FormField
                control={control}
                name="amountReceived"
                render={({ field }) => (
                <FormItem>
                    <Label htmlFor="amountReceivedEdit">Amount Received</Label>
                    <Input id="amountReceivedEdit" type="number" step="0.01" {...field} />
                    {errors.amountReceived && <p className="text-sm text-destructive mt-1">{errors.amountReceived.message}</p>}
                </FormItem>
                )}
            />
            
            {isDirty && watchedStatus === 'Paid' && invoice.status === 'Due' && (
                 <div className="p-3 border border-yellow-500 bg-yellow-50 rounded-md text-yellow-700 text-xs flex items-start gap-2">
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5"/>
                    <span>Changing status from 'Due' to 'Paid' will update product stock levels for items in this invoice. This action cannot be easily undone.</span>
                </div>
            )}

            <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={!isDirty}>Save Changes</Button>
            </DialogFooter>
            </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
// Helper to ensure correct use of FormField, FormItem, Label, Input
const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-1", className)} {...props} />
));
FormItem.displayName = "FormItem";

const FormField = Controller; // react-hook-form's Controller can act as FormField here
