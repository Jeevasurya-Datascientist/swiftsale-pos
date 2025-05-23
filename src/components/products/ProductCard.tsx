
"use client";

import type { Product } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Package, Edit3, Trash2, TrendingUp, Percent } from 'lucide-react'; // Added Percent

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  currencySymbol: string;
}

export function ProductCard({ product, onEdit, onDelete, currencySymbol }: ProductCardProps) {
  const getStockBadgeVariant = () => {
    if (product.stock === 0) return "destructive";
    if (product.stock < 15) return "warning";
    return "outline";
  };

  const costPriceNum = typeof product.costPrice === 'number' ? product.costPrice : 0;
  const sellingPriceNum = typeof product.sellingPrice === 'number' ? product.sellingPrice : 0;
  const gstPercentageNum = typeof product.gstPercentage === 'number' ? product.gstPercentage : 0;

  const costPriceDisplay = costPriceNum.toFixed(2);
  const sellingPriceDisplay = sellingPriceNum.toFixed(2);

  const profitMargin = sellingPriceNum - costPriceNum;
  const profitPercentage = costPriceNum > 0 ? (profitMargin / costPriceNum) * 100 : (sellingPriceNum > 0 ? Infinity : 0) ;


  return (
    <Card
      id={`product-card-${product.id}`}
      className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
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
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm text-muted-foreground">Cost: {currencySymbol}{costPriceDisplay}</p>
          <Badge variant="secondary" className="text-sm">
            Sell: {currencySymbol}{sellingPriceDisplay}
          </Badge>
        </div>
         {gstPercentageNum > 0 && (
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs text-muted-foreground flex items-center">
              GST: {gstPercentageNum}% <Percent className="w-3 h-3 ml-0.5"/>
            </p>
          </div>
        )}
        <div className="flex justify-between items-center mb-2">
           <Badge variant={getStockBadgeVariant()}>
            Stock: {product.stock}
          </Badge>
          {profitMargin > 0 && (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Profit: {currencySymbol}{profitMargin.toFixed(2)}
              {isFinite(profitPercentage) && ` (${profitPercentage.toFixed(0)}%)`}
            </Badge>
          )}
           {profitMargin <= 0 && sellingPriceNum > 0 && ( 
             <Badge variant="destructive" className="flex items-center gap-1">
               Loss: {currencySymbol}{Math.abs(profitMargin).toFixed(2)}
            </Badge>
           )}
        </div>
        <p className="text-xs text-muted-foreground">Category: {product.category || 'N/A'}</p>
        <p className="text-xs text-muted-foreground">Barcode: {product.barcode || 'N/A'}</p>
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
