
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Phone, MessageSquareText, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ServiceDetailsDialogProps {
  isOpen: boolean;
  serviceName: string;
  onClose: () => void;
  onConfirm: (details: {
    baseServiceAmount: number;
    additionalServiceCharge: number;
    phoneNumber?: string;
    note?: string;
  }) => void;
}

export function ServiceDetailsDialog({ isOpen, serviceName, onClose, onConfirm }: ServiceDetailsDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [note, setNote] = useState('');
  const [baseServiceAmount, setBaseServiceAmount] = useState<string>('');
  const [additionalServiceCharge, setAdditionalServiceCharge] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Reset fields when dialog opens
      setPhoneNumber('');
      setNote('');
      setBaseServiceAmount('');
      setAdditionalServiceCharge('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const parsedBaseAmount = parseFloat(baseServiceAmount);
    const parsedAdditionalCharge = parseFloat(additionalServiceCharge);

    if (isNaN(parsedBaseAmount) || parsedBaseAmount <= 0) {
      toast({
        title: "Invalid Service Amount",
        description: "Please enter a valid Service Amount greater than 0.",
        variant: "destructive",
      });
      return;
    }
    if (isNaN(parsedAdditionalCharge) || parsedAdditionalCharge <= 0) {
      toast({
        title: "Invalid Service Charge",
        description: "Please enter a valid Service Charge greater than 0.",
        variant: "destructive",
      });
      return;
    }

    onConfirm({
      baseServiceAmount: parsedBaseAmount,
      additionalServiceCharge: parsedAdditionalCharge,
      phoneNumber,
      note
    });
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Details for: {serviceName}</DialogTitle>
          <DialogDescription>
            Enter charges and optional details for this service. Both monetary fields are required.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1">
            <Label htmlFor="serviceBaseAmount" className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
              Service Amount (₹) <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="serviceBaseAmount"
              type="number"
              placeholder="Enter base amount"
              value={baseServiceAmount}
              onChange={(e) => setBaseServiceAmount(e.target.value)}
              step="0.01"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="serviceAdditionalCharge" className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
              Service Charge (₹) <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="serviceAdditionalCharge"
              type="number"
              placeholder="Enter additional charge"
              value={additionalServiceCharge}
              onChange={(e) => setAdditionalServiceCharge(e.target.value)}
              step="0.01"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="servicePhoneNumber" className="flex items-center">
              <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
              Service Specific Phone (Optional)
            </Label>
            <Input
              id="servicePhoneNumber"
              type="tel"
              placeholder="e.g., 9876543210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="serviceNote" className="flex items-center">
              <MessageSquareText className="w-4 h-4 mr-2 text-muted-foreground" />
              Service Note (Optional)
            </Label>
            <Textarea
              id="serviceNote"
              placeholder="e.g., Customer prefers morning slot, specific instructions..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm}>Add to Cart</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
