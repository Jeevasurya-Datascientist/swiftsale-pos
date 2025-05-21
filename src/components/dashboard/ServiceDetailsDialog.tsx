
"use client";

import { useState } from 'react';
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
import { Phone, MessageSquareText } from 'lucide-react';

interface ServiceDetailsDialogProps {
  isOpen: boolean;
  serviceName: string;
  onClose: () => void;
  onConfirm: (details: { phoneNumber?: string; note?: string }) => void;
}

export function ServiceDetailsDialog({ isOpen, serviceName, onClose, onConfirm }: ServiceDetailsDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    onConfirm({ phoneNumber, note });
    // Reset fields for next time
    setPhoneNumber('');
    setNote('');
  };

  const handleClose = () => {
    // Reset fields on close as well
    setPhoneNumber('');
    setNote('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Details for: {serviceName}</DialogTitle>
          <DialogDescription>
            Add an optional phone number or note for this service.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
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
