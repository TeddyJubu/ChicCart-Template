import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import Cart from "@/components/Cart";
import type { Product, ProductVariant, CartItem } from "@shared/schema";

export default function Shop() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: cartItems = [] } = useQuery<Array<CartItem & { product: Product; variant: ProductVariant }>>({
    queryKey: ['/api/cart'],
    retry: false,
  });

  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      // Get first available variant for quick add
      const variants = await fetch(`/api/products/${productId}/variants`).then(r => r.json());
      const availableVariant = variants.find((v: ProductVariant) => v.stock > 0);
      
      if (!availableVariant) {
        throw new Error("Product is out of stock");
      }

      await apiRequest('/api/cart', 'POST', {
        productId,
        variantId: availableVariant.id,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      setIsCartOpen(true);
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to add to cart",
        variant: "destructive",
      });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      await apiRequest(`/api/cart/${id}`, 'PATCH', { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to update cart",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/cart/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Removed",
        description: "Item removed from cart",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    },
  });

  const cartItemsForDisplay = cartItems.map(item => ({
    id: item.id,
    name: item.product.name,
    price: parseFloat(item.product.price),
    quantity: item.quantity,
    size: item.variant.size,
    color: item.variant.color,
    imageSrc: item.product.imageSrc,
  }));

  const productsForDisplay = products.map(product => ({
    id: product.id,
    name: product.name,
    price: parseFloat(product.price),
    imageSrc: product.imageSrc,
    colors: [],
  }));

  return (
    <>
      <Header
        onCartClick={() => setIsCartOpen(true)}
        onMenuClick={() => console.log('Menu clicked')}
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
      />
      
      <main>
        <section className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
          <h1 className="text-3xl font-light tracking-wide">All Products</h1>
        </section>
        
        <ProductGrid
          products={productsForDisplay}
          onQuickAdd={(id) => addToCartMutation.mutate(id)}
        />
      </main>

      <Footer />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItemsForDisplay}
        onUpdateQuantity={(id, qty) => updateQuantityMutation.mutate({ id, quantity: qty })}
        onRemoveItem={(id) => removeItemMutation.mutate(id)}
        onCheckout={() => window.location.href = '/checkout'}
      />
    </>
  );
}
