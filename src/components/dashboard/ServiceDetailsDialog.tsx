
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
  // defaultPrice prop removed as service price is always dynamic now
  onClose: () => void;
  onConfirm: (details: { phoneNumber?: string; note?: string; customPrice: number }) => void; // customPrice is now mandatory
}

export function ServiceDetailsDialog({ isOpen, serviceName, onClose, onConfirm }: ServiceDetailsDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [note, setNote] = useState('');
  const [customPrice, setCustomPrice] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Reset fields when dialog opens
      setPhoneNumber('');
      setNote('');
      setCustomPrice(''); // Always clear custom price for new entry
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const parsedPrice = parseFloat(customPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast({
        title: "Invalid Service Charge",
        description: "Please enter a valid service charge greater than 0.",
        variant: "destructive",
      });
      return;
    }
    // customPrice is now mandatory
    onConfirm({ phoneNumber, note, customPrice: parsedPrice });
    // Fields will be reset by useEffect when dialog reopens
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
            Enter the service charge and optional details for this service.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1">
            <Label htmlFor="serviceCustomPrice" className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
              Service Charge <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="serviceCustomPrice"
              type="number"
              placeholder="Enter amount"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
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
