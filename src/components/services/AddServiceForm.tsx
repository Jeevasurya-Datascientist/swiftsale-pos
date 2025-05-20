
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { Service } from "@/lib/types";

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

const serviceFormSchema = z.object({
  name: z.string().min(2, "Service name must be at least 2 characters.").max(100),
  price: z.coerce.number().positive("Price must be a positive number."),
  serviceCode: z.string().max(50).optional(),
  category: z.string().optional(),
  description: z.string().max(500, "Description too long.").optional(),
  duration: z.string().max(50).optional(),
  imageUrl: z.string().url("Must be a valid URL for image.").optional().or(z.literal('')),
});

type ServiceFormValues = Omit<Service, 'id' | 'dataAiHint'>;

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
      price: existingService.price,
      serviceCode: existingService.serviceCode || '',
      category: existingService.category || '',
      description: existingService.description || '',
      duration: existingService.duration || '',
      imageUrl: existingService.imageUrl || '',
    } : {
      name: "",
      price: 0,
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

  return (
    <Form {...form}>
      <ScrollArea className="max-h-[calc(100vh-12rem)] p-1 pr-3"> {/* Adjusted max height */}
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
                <FormLabel>Image URL (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/image.png" {...field} />
                </FormControl>
                <FormDescription>
                  Link to an image for the service. Use https://placehold.co for placeholders.
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
