import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Product, ProductVariant, CartItem } from "@shared/schema";

const checkoutSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Invalid email address"),
  shippingAddress: z.string().min(10, "Please enter a complete address"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: cartItems = [] } = useQuery<Array<CartItem & { product: Product; variant: ProductVariant }>>({
    queryKey: ['/api/cart'],
  });

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: user ? `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() : '',
      customerEmail: (user as any)?.email || '',
      shippingAddress: '',
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      const items = cartItems.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.product.price,
        productName: item.product.name,
        size: item.variant.size,
        color: item.variant.color,
      }));

      await apiRequest('/api/orders', 'POST', {
        ...data,
        items,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Order placed!",
        description: "Your order has been successfully placed.",
      });
      setTimeout(() => {
        window.location.href = '/orders';
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    },
  });

  const subtotal = cartItems.reduce((sum, item) => 
    sum + (parseFloat(item.product.price) * item.quantity), 0
  );

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Header
        onCartClick={() => {}}
        onMenuClick={() => console.log('Menu clicked')}
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
      />

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
        <h1 className="mb-12 text-3xl font-light" data-testid="text-checkout-title">Checkout</h1>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Order Summary */}
          <div className="space-y-6">
            <h2 className="text-xl font-normal uppercase tracking-wider">Order Summary</h2>
            
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4" data-testid={`checkout-item-${item.id}`}>
                  <div className="h-24 w-20 flex-shrink-0 overflow-hidden bg-secondary">
                    <img
                      src={item.product.imageSrc}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-normal">{item.product.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Size: {item.variant.size} • Color: {item.variant.color}
                    </p>
                    <p className="mt-2 text-sm">
                      Qty: {item.quantity} × ${parseFloat(item.product.price)}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between text-lg">
                <span className="uppercase tracking-wider">Total</span>
                <span className="font-medium" data-testid="text-checkout-total">${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="space-y-6">
            <h2 className="text-xl font-normal uppercase tracking-wider">Shipping Details</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createOrderMutation.mutate(data))} className="space-y-6">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm uppercase tracking-wider">Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-customer-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm uppercase tracking-wider">Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} data-testid="input-customer-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shippingAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm uppercase tracking-wider">Shipping Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={4}
                          data-testid="input-shipping-address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={createOrderMutation.isPending || cartItems.length === 0}
                  data-testid="button-place-order"
                >
                  {createOrderMutation.isPending ? "Placing Order..." : "Place Order"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
