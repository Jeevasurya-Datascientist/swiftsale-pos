
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import type { Product } from "@/lib/types";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UploadCloud, Percent } from "lucide-react"; // Added Percent

const productFormSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters.").max(100),
  costPrice: z.coerce.number().min(0, "Cost price must be a non-negative number."),
  sellingPrice: z.coerce.number().positive("Selling price must be a positive number."),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
  barcode: z.string().min(3, "Barcode must be at least 3 characters if provided.").max(50).optional().or(z.literal('')),
  category: z.string().optional(),
  description: z.string().max(500, "Description too long.").optional(),
  imageUrl: z.string().min(1, "Image is required. Provide a URL or upload an image."),
  gstPercentage: z.coerce.number().min(0, "GST rate cannot be negative.").max(100, "GST rate seems too high."), // New GST field
}).refine(data => data.sellingPrice >= data.costPrice, {
  message: "Selling price should typically be greater than or equal to cost price.",
  path: ["sellingPrice"], 
});

type ProductFormValues = Omit<Product, 'id' | 'dataAiHint'>;

interface AddProductFormProps {
  onSubmit: (data: ProductFormValues, existingProduct?: Product) => void;
  existingProduct?: Product;
  onClose: () => void;
}

export function AddProductForm({ onSubmit, existingProduct, onClose }: AddProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: existingProduct ? {
      name: existingProduct.name,
      costPrice: existingProduct.costPrice,
      sellingPrice: existingProduct.sellingPrice,
      stock: existingProduct.stock,
      barcode: existingProduct.barcode || '',
      category: existingProduct.category || '',
      description: existingProduct.description || '',
      imageUrl: existingProduct.imageUrl,
      gstPercentage: typeof existingProduct.gstPercentage === 'number' ? existingProduct.gstPercentage : 0, // Initialize GST
    } : {
      name: "",
      costPrice: 0,
      sellingPrice: 0,
      stock: 0,
      barcode: "",
      category: "",
      description: "",
      imageUrl: "",
      gstPercentage: 0, // Default GST to 0 for new products
    },
  });

  function handleFormSubmit(data: ProductFormValues) {
    onSubmit(data, existingProduct);
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        form.setValue('imageUrl', dataUrl, { shouldDirty: true, shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <ScrollArea className="max-h-[calc(100vh-12rem)] p-1 pr-3">
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 p-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Fresh Milk 1L" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="costPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Price</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} step="0.01" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sellingPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selling Price</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} step="0.01" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gstPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    GST <Percent className="w-3 h-3 ml-1 text-muted-foreground" />
                  </FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 5 for 5%" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barcode (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., SWSP001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Groceries" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Short product description..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Image <span className="text-destructive">*</span></FormLabel>
                 <div className="mt-1 flex items-center gap-4">
                    {field.value && (
                        <img
                        src={field.value}
                        alt="Product Preview"
                        width={64}
                        height={64}
                        className="rounded-md object-contain border"
                        style={{maxWidth: '64px', maxHeight: '64px'}} 
                        data-ai-hint="product image"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                    )}
                    <div className="flex-grow">
                        <Input
                            id="productImageUrlInput"
                            placeholder="Enter image URL or upload"
                            value={field.value || ''}
                            onChange={field.onChange}
                        />
                    </div>
                    <Button type="button" variant="outline" asChild className="relative">
                        <div>
                        <UploadCloud className="w-4 h-4 mr-2" /> Upload
                        <input 
                            type="file" 
                            id="productImageUpload"
                            accept="image/*" 
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        </div>
                    </Button>
                 </div>
                <FormDescription>
                  Link to an image or upload one. Use https://placehold.co for placeholders. Required.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-2 pt-4 sticky bottom-0 bg-background pb-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">{existingProduct ? 'Save Changes' : 'Add Product'}</Button>
          </div>
        </form>
      </ScrollArea>
    </Form>
  );
}
