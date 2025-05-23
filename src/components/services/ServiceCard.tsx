
"use client";

import type { Service } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit3, Trash2, Clock } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
  currencySymbol: string; // Kept for consistency, but price is not shown here
}

export function ServiceCard({ service, onEdit, onDelete, currencySymbol }: ServiceCardProps) {
  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-4">
        {service.imageUrl && (
            <div className="aspect-[3/2] relative w-full mb-2">
            <Image
                src={service.imageUrl || `https://placehold.co/300x200.png`}
                alt={service.name}
                fill
                className="rounded-md object-cover"
                data-ai-hint={service.dataAiHint || service.name.split(" ").slice(0,2).join(" ")}
            />
            </div>
        )}
        <CardTitle className="text-lg leading-tight">{service.name}</CardTitle>
        {service.description && <CardDescription className="text-xs h-8 overflow-hidden text-ellipsis">{service.description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        {/* Selling price display removed as it's dynamic */}
        <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-muted-foreground">Price: Dynamic</p>
            {service.duration && (
                <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {service.duration}
                </Badge>
            )}
        </div>
        <p className="text-xs text-muted-foreground">Category: {service.category || 'N/A'}</p>
        {service.serviceCode && <p className="text-xs text-muted-foreground">Service Code: {service.serviceCode}</p>}
      </CardContent>
      <CardFooter className="p-4 border-t flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(service)} className="flex-1">
          <Edit3 className="w-4 h-4 mr-1" /> Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(service.id)} className="flex-1">
          <Trash2 className="w-4 h-4 mr-1" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
