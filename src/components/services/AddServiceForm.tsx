
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import type { Service } from "@/lib/types";
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
import { UploadCloud } from "lucide-react";

// Removed sellingPrice from schema
const serviceFormSchema = z.object({
  name: z.string().min(2, "Service name must be at least 2 characters.").max(100),
  // sellingPrice: z.coerce.number().positive("Price must be a positive number."), // Removed
  serviceCode: z.string().max(50).optional(),
  category: z.string().optional(),
  description: z.string().max(500, "Description too long.").optional(),
  duration: z.string().max(50).optional(),
  imageUrl: z.string().min(1, "Image is required. Provide a URL or upload an image."),
});

type ServiceFormValues = Omit<Service, 'id' | 'dataAiHint' | 'sellingPrice'>; // sellingPrice removed

interface AddServiceFormProps {
  onSubmit: (data: ServiceFormValues, existingService?: Service) => void;
  existingService?: Service;
  onClose: () => void;
}

export function AddServiceForm({ onSubmit, existingService, onClose }: AddServiceFormProps) {
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: existingService ? {
      name: existingService.name,
      // sellingPrice: existingService.sellingPrice, // Removed
      serviceCode: existingService.serviceCode || '',
      category: existingService.category || '',
      description: existingService.description || '',
      duration: existingService.duration || '',
      imageUrl: existingService.imageUrl,
    } : {
      name: "",
      // sellingPrice: 0, // Removed
      serviceCode: "",
      category: "",
      description: "",
      duration: "",
      imageUrl: "",
    },
  });

  function handleFormSubmit(data: ServiceFormValues) {
    onSubmit(data, existingService);
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
                <FormLabel>Service Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Basic Haircut" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Selling Price field removed */}
          <FormField
            control={form.control}
            name="serviceCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Code (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., SERV001" {...field} />
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
                  <Input placeholder="e.g., Salon" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 30 minutes, 1 hour" {...field} />
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
                  <Textarea placeholder="Short service description..." {...field} />
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
                <FormLabel>Service Image <span className="text-destructive">*</span></FormLabel>
                <div className="mt-1 flex items-center gap-4">
                    {field.value && (
                        <img
                        src={field.value}
                        alt="Service Preview"
                        width={64}
                        height={64}
                        className="rounded-md object-contain border"
                        style={{maxWidth: '64px', maxHeight: '64px'}}
                        data-ai-hint="service image"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                    )}
                    <div className="flex-grow">
                        <Input
                            id="serviceImageUrlInput"
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
                            id="serviceImageUpload"
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
              <Button type="submit">{existingService ? 'Save Changes' : 'Add Service'}</Button>
          </div>
        </form>
      </ScrollArea>
    </Form>
  );
}
