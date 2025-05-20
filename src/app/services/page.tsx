
"use client";

import { useState, useEffect } from 'react';
import type { Service } from '@/lib/types';
import { mockServices } from '@/lib/mockData'; // Assuming you'll create mockServices
import { ServiceCard } from '@/components/services/ServiceCard';
import { AddServiceForm } from '@/components/services/AddServiceForm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Search, ConciergeBell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/context/SettingsContext';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>(undefined);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { currencySymbol, isSettingsLoaded } = useSettings();

  // Load services from localStorage or use mockServices
  useEffect(() => {
    const storedServices = localStorage.getItem('appServices');
    if (storedServices) {
      try {
        setServices(JSON.parse(storedServices));
      } catch (e) {
        setServices(mockServices); // fallback to mock if parsing fails
      }
    } else {
      setServices(mockServices); // initialize with mock if nothing in localStorage
    }
  }, []);

  // Save services to localStorage whenever they change
  useEffect(() => {
    if (isSettingsLoaded) { // Ensure settings (and thus the app) are loaded before saving
        localStorage.setItem('appServices', JSON.stringify(services));
    }
  }, [services, isSettingsLoaded]);


  const handleFormSubmit = (data: Omit<Service, 'id' | 'dataAiHint'>, existingService?: Service) => {
    const serviceDataAiHint = data.name.toLowerCase().split(' ').slice(0,2).join(' ');
    if (existingService) {
      setServices(services.map(s => s.id === existingService.id ? { ...existingService, ...data, dataAiHint: serviceDataAiHint } : s));
      toast({ title: "Service Updated", description: `${data.name} has been updated.` });
    } else {
      const newService: Service = {
        id: `serv-${Date.now()}`,
        ...data,
        dataAiHint: serviceDataAiHint,
      };
      setServices([newService, ...services]);
      toast({ title: "Service Added", description: `${data.name} has been added.` });
    }
    setIsFormOpen(false);
    setEditingService(undefined);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (serviceId: string) => {
    setServiceToDelete(serviceId);
  };

  const handleDeleteService = () => {
    if (serviceToDelete) {
      const serviceName = services.find(s => s.id === serviceToDelete)?.name;
      setServices(services.filter(s => s.id !== serviceToDelete));
      toast({ title: "Service Deleted", description: `${serviceName || 'Service'} has been deleted.`, variant: 'destructive' });
      setServiceToDelete(null);
    }
  };
  
  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.serviceCode && service.serviceCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (service.category && service.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isSettingsLoaded) {
     return (
      <div className="container mx-auto py-4 flex justify-center items-center h-screen">
        <ConciergeBell className="h-12 w-12 animate-pulse text-primary" />
         <p className="ml-4 text-xl">Loading services...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-primary flex items-center gap-2">
            <ConciergeBell className="h-10 w-10" /> Service Management
          </h1>
          <p className="text-muted-foreground">View, add, edit, or delete your services.</p>
        </div>
        <Button onClick={() => { setEditingService(undefined); setIsFormOpen(true); }}>
          <PlusCircle className="w-5 h-5 mr-2" /> Add New Service
        </Button>
      </header>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="text"
            placeholder="Search services by name, code, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full md:w-1/2 lg:w-1/3"
          />
        </div>
      </div>

      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              onEdit={handleEditService} 
              onDelete={() => openDeleteConfirm(service.id)}
              currencySymbol={currencySymbol} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ConciergeBell className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Services Found</h2>
          <p className="text-muted-foreground">
            {searchTerm ? "Try adjusting your search or " : "Get started by "} 
            <Button variant="link" className="p-0 h-auto" onClick={() => { setEditingService(undefined); setIsFormOpen(true); }}>adding a new service</Button>.
          </p>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) setEditingService(undefined);
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <DialogDescription>
              {editingService ? 'Update the details of this service.' : 'Fill in the details to add a new service.'}
            </DialogDescription>
          </DialogHeader>
          <AddServiceForm 
            onSubmit={handleFormSubmit} 
            existingService={editingService}
            onClose={() => { setIsFormOpen(false); setEditingService(undefined); }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!serviceToDelete} onOpenChange={(open) => !open && setServiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the service
              "{services.find(s => s.id === serviceToDelete)?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setServiceToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteService} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
