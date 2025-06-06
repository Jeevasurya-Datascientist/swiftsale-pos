
"use client";

import { useState, useEffect } from 'react';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/products/ProductCard';
import { AddProductForm } from '@/components/products/AddProductForm';
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
import { PlusCircle, Package, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/context/SettingsContext';

const defaultPlaceholder = (name = "Product") => `https://placehold.co/300x200.png?text=${encodeURIComponent(name)}`;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { currencySymbol, isSettingsLoaded } = useSettings();

 useEffect(() => {
    let loadedProducts: Product[] = [];
    if (typeof window !== 'undefined') {
        const storedProducts = localStorage.getItem('appProducts');
        if (storedProducts) {
            try {
                const parsed = JSON.parse(storedProducts);
                if (Array.isArray(parsed)) {
                    loadedProducts = parsed.map((p: any) => {
                        const pName = p.name || "Unnamed Product";
                        return {
                            id: p.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
                            name: pName,
                            costPrice: typeof p.costPrice === 'number' ? p.costPrice : 0,
                            sellingPrice: typeof p.sellingPrice === 'number' ? p.sellingPrice : (typeof p.price === 'number' ? p.price : 0), // Fallback for old data
                            stock: typeof p.stock === 'number' ? p.stock : 0,
                            barcode: p.barcode || "",
                            imageUrl: p.imageUrl || defaultPlaceholder(pName),
                            dataAiHint: p.dataAiHint || (pName ? pName.toLowerCase().split(' ').slice(0, 2).join(' ') : 'product image'),
                            category: p.category || undefined,
                            description: p.description || undefined,
                            gstPercentage: typeof p.gstPercentage === 'number' ? p.gstPercentage : 0,
                        };
                    });
                } else {
                    loadedProducts = []; 
                }
            } catch (e) {
                console.error("Failed to parse products from localStorage, starting with empty list.", e);
                loadedProducts = []; 
            }
        } else {
            loadedProducts = []; 
        }
    }
    setProducts(loadedProducts);
  }, []);


  useEffect(() => {
    if (isSettingsLoaded && typeof window !== 'undefined') { 
        // Always save the current state of products, even if it's an empty array
        localStorage.setItem('appProducts', JSON.stringify(products));
    }
  }, [products, isSettingsLoaded]);

  useEffect(() => {
    if (!isSettingsLoaded || products.length === 0 || typeof window === 'undefined') return;

    const hash = window.location.hash;
    if (hash) {
      const productId = hash.substring(1); 
      const element = document.getElementById(`product-card-${productId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'transition-all', 'duration-1000', 'ease-out');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
          if (window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }, 2500); 
      }
    }
  }, [isSettingsLoaded, products]);


  const handleFormSubmit = (data: Omit<Product, 'id' | 'dataAiHint'>, existingProduct?: Product) => {
    const productDataAiHint = data.name.toLowerCase().split(' ').slice(0,2).join(' ');
    const imageUrl = data.imageUrl || defaultPlaceholder(data.name);

    if (existingProduct) {
      setProducts(products.map(p => p.id === existingProduct.id ? { ...existingProduct, ...data, imageUrl, dataAiHint: productDataAiHint } : p));
      toast({ title: "Product Updated", description: `${data.name} has been updated.` });
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
        ...data,
        imageUrl,
        dataAiHint: productDataAiHint,
      };
      setProducts([newProduct, ...products]);
      toast({ title: "Product Added", description: `${data.name} has been added.` });
    }
    setIsFormOpen(false);
    setEditingProduct(undefined);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (productId: string) => {
    setProductToDelete(productId);
  };

  const handleDeleteProduct = () => {
    if (productToDelete) {
      const productName = products.find(p => p.id === productToDelete)?.name;
      setProducts(products.filter(p => p.id !== productToDelete));
      toast({ title: "Product Deleted", description: `${productName || 'Product'} has been deleted.`, variant: 'destructive' });
      setProductToDelete(null);
    }
  };
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isSettingsLoaded) {
     return (
      <div className="container mx-auto py-4 flex justify-center items-center h-screen">
        <Package className="h-12 w-12 animate-pulse text-primary" />
         <p className="ml-4 text-xl">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-primary flex items-center gap-2">
            <Package className="h-10 w-10" /> Product Management
          </h1>
          <p className="text-muted-foreground">View, add, edit, or delete your products.</p>
        </div>
        <Button onClick={() => { setEditingProduct(undefined); setIsFormOpen(true); }}>
          <PlusCircle className="w-5 h-5 mr-2" /> Add New Product
        </Button>
      </header>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="text"
            placeholder="Search products by name, barcode, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full md:w-1/2 lg:w-1/3"
          />
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onEdit={handleEditProduct} 
              onDelete={() => openDeleteConfirm(product.id)}
              currencySymbol={currencySymbol} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Products Found</h2>
          <p className="text-muted-foreground">
            {searchTerm ? "Try adjusting your search or " : "Get started by "} 
            <Button variant="link" className="p-0 h-auto" onClick={() => { setEditingProduct(undefined); setIsFormOpen(true); }}>adding a new product</Button>.
          </p>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) setEditingProduct(undefined);
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update the details of this product.' : 'Fill in the details to add a new product to your inventory.'}
            </DialogDescription>
          </DialogHeader>
          <AddProductForm 
            onSubmit={handleFormSubmit} 
            existingProduct={editingProduct}
            onClose={() => { setIsFormOpen(false); setEditingProduct(undefined); }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              "{products.find(p => p.id === productToDelete)?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

