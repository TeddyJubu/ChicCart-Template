import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductDetail from "@/components/ProductDetail";
import Cart from "@/components/Cart";
import type { Product, ProductVariant, CartItem } from "@shared/schema";

export default function ProductPage() {
  const [, params] = useRoute("/product/:id");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();

  const { data: product } = useQuery<Product>({
    queryKey: ['/api/products', params?.id],
    enabled: !!params?.id,
  });

  const { data: variants = [] } = useQuery<ProductVariant[]>({
    queryKey: ['/api/products', params?.id, 'variants'],
    queryFn: () => fetch(`/api/products/${params?.id}/variants`).then(r => r.json()),
    enabled: !!params?.id,
  });

  const { data: cartItems = [] } = useQuery<Array<CartItem & { product: Product; variant: ProductVariant }>>({
    queryKey: ['/api/cart'],
    retry: false,
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ size, color }: { size: string; color: string }) => {
      const variant = variants.find(v => v.size === size && v.color === color);
      if (!variant) throw new Error("Variant not found");
      
      await apiRequest('/api/cart', 'POST', {
        productId: product!.id,
        variantId: variant.id,
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
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/cart/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  if (!product) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  const uniqueSizes = Array.from(new Set(variants.map(v => v.size)));
  const colorMap = new Map<string, string>();
  variants.forEach(v => colorMap.set(v.color, v.colorHex));
  const uniqueColors = Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex }));

  const variantsForDisplay = variants.map(v => ({
    id: v.id,
    size: v.size,
    color: v.color,
    inStock: v.stock > 0,
  }));

  const cartItemsForDisplay = cartItems.map(item => ({
    id: item.id,
    name: item.product.name,
    price: parseFloat(item.product.price),
    quantity: item.quantity,
    size: item.variant.size,
    color: item.variant.color,
    imageSrc: item.product.imageSrc,
  }));

  return (
    <>
      <Header
        onCartClick={() => setIsCartOpen(true)}
        onMenuClick={() => console.log('Menu clicked')}
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
      />
      
      <main>
        <ProductDetail
          name={product.name}
          price={parseFloat(product.price)}
          description={product.description}
          images={product.images.length > 0 ? product.images : [product.imageSrc]}
          sizes={uniqueSizes}
          colors={uniqueColors}
          variants={variantsForDisplay}
          onAddToCart={(size, color) => addToCartMutation.mutate({ size, color })}
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
