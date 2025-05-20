"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { Product } from "@/lib/types";

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

const productFormSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters.").max(100),
  price: z.coerce.number().positive("Price must be a positive number."),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
  barcode: z.string().min(3, "Barcode must be at least 3 characters.").max(50),
  category: z.string().optional(),
  description: z.string().max(500, "Description too long.").optional(),
  imageUrl: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

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
      price: existingProduct.price,
      stock: existingProduct.stock,
      barcode: existingProduct.barcode,
      category: existingProduct.category || '',
      description: existingProduct.description || '',
      imageUrl: existingProduct.imageUrl || '',
    } : {
      name: "",
      price: 0,
      stock: 0,
      barcode: "",
      category: "",
      description: "",
      imageUrl: "",
    },
  });

  function handleFormSubmit(data: ProductFormValues) {
    onSubmit(data, existingProduct);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
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
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0.00" {...field} step="0.01" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
        </div>
        <FormField
          control={form.control}
          name="barcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Barcode</FormLabel>
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
              <FormLabel>Image URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.png" {...field} />
              </FormControl>
              <FormDescription>
                Link to an image of the product. Use https://placehold.co for placeholders.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{existingProduct ? 'Save Changes' : 'Add Product'}</Button>
        </div>
      </form>
    </Form>
  );
}

