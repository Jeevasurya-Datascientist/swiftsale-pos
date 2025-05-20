
"use client";

import type { Product } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Package, Edit3, Trash2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  currencySymbol: string; // Now explicitly required
}

export function ProductCard({ product, onEdit, onDelete, currencySymbol }: ProductCardProps) {
  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-4">
        <div className="aspect-[3/2] relative w-full mb-2">
          <Image
            src={product.imageUrl || `https://placehold.co/300x200.png`}
            alt={product.name}
            fill
            className="rounded-md object-cover"
            data-ai-hint={product.dataAiHint || product.name.split(" ").slice(0,2).join(" ")}
          />
        </div>
        <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
        {product.description && <CardDescription className="text-xs h-8 overflow-hidden text-ellipsis">{product.description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex justify-between items-center mb-2">
          <Badge variant="secondary" className="text-sm">
            {currencySymbol}{product.price.toFixed(2)}
          </Badge>
          <Badge variant={product.stock > 0 ? 'outline' : 'destructive'}>
            Stock: {product.stock}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">Category: {product.category || 'N/A'}</p>
        <p className="text-xs text-muted-foreground">Barcode: {product.barcode}</p>
      </CardContent>
      <CardFooter className="p-4 border-t flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(product)} className="flex-1">
          <Edit3 className="w-4 h-4 mr-1" /> Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(product.id)} className="flex-1">
          <Trash2 className="w-4 h-4 mr-1" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
