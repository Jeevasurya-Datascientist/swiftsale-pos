
"use client";

import type { SearchableItem, CartItem } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Minus, Package, ConciergeBell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ItemTileProps {
  item: SearchableItem;
  cartItem: CartItem | undefined;
  onItemSelect: (itemId: string, itemType: 'product' | 'service') => void;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  currencySymbol: string;
}

function ItemTile({ item, cartItem, onItemSelect, onUpdateQuantity, currencySymbol }: ItemTileProps) {
  const isInCart = !!cartItem;
  const quantityInCart = cartItem?.quantity || 0;
  const itemType = 'barcode' in item && item.barcode !== undefined ? 'product' : 'service'; 

  const handleMainClick = () => {
    onItemSelect(item.id, itemType);
  };

  return (
    <Card
      className={cn(
        "flex flex-col h-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden",
        isInCart ? "border-green-500 ring-2 ring-green-500 bg-green-500/10" : "border-border"
      )}
      onClick={!isInCart ? handleMainClick : undefined}
    >
      <CardHeader className="p-3 relative">
        <div className="aspect-square w-full relative mb-2">
          <Image
            src={item.imageUrl || `https://placehold.co/150x150.png`}
            alt={item.name}
            fill
            className="rounded-md object-cover"
            data-ai-hint={item.dataAiHint || item.name.split(" ").slice(0,2).join(" ")}
          />
        </div>
        <CardTitle className="text-sm font-semibold leading-tight truncate h-10" title={item.name}>{item.name}</CardTitle>
        {itemType === 'product' ?
            <Package size={14} className="absolute top-2 right-2 text-muted-foreground" title="Product"/> :
            <ConciergeBell size={14} className="absolute top-2 right-2 text-muted-foreground" title="Service"/>
        }
      </CardHeader>
      <CardContent className="p-3 pt-0 flex-grow">
        <p className="text-lg font-bold text-primary">{currencySymbol}{(item.price || 0).toFixed(2)}</p> 
        {itemType === 'product' && 'stock' in item && typeof item.stock === 'number' && (
          <p className={cn("text-xs", item.stock > 0 ? "text-muted-foreground" : "text-destructive")}>
            Stock: {item.stock}
          </p>
        )}
      </CardContent>
      {isInCart && (
        <CardFooter className="p-2 border-t bg-green-500/20">
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-background hover:bg-muted"
              onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, quantityInCart - 1); }}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold text-green-700 w-8 text-center">{quantityInCart}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-background hover:bg-muted"
              onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, quantityInCart + 1); }}
              disabled={itemType === 'product' && 'stock' in item && typeof item.stock === 'number' && quantityInCart >= item.stock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
      {!isInCart && (
         <CardFooter className="p-2 border-t">
            <Button variant="outline" size="sm" className="w-full" onClick={handleMainClick}>
                Add to Cart
            </Button>
         </CardFooter>
      )}
    </Card>
  );
}


interface ItemGridProps {
  items: SearchableItem[];
  cartItems: CartItem[];
  onItemSelect: (itemId: string, itemType: 'product' | 'service') => void;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  currencySymbol: string;
}

export function ItemGrid({ items, cartItems, onItemSelect, onUpdateQuantity, currencySymbol }: ItemGridProps) {
  if (!items || items.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No items available to display.</p>;
  }

  return (
    <ScrollArea className="h-[calc(100vh-20rem)] md:h-[calc(100vh-25rem)] lg:h-[450px] pr-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {items.map((item) => {
          const cartItem = cartItems.find(ci => ci.id === item.id);
          return (
            <ItemTile
              key={item.id}
              item={item}
              cartItem={cartItem}
              onItemSelect={onItemSelect}
              onUpdateQuantity={onUpdateQuantity}
              currencySymbol={currencySymbol}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
}
