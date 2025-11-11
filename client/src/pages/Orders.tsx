import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Order, OrderItem } from "@shared/schema";

export default function Orders() {
  const { isLoading, isAuthenticated } = useAuth();
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

  const { data: orders = [] } = useQuery<Array<Order & { items: OrderItem[] }>>({
    queryKey: ['/api/orders'],
  });

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Header
        onCartClick={() => {}}
        onMenuClick={() => console.log('Menu clicked')}
        cartItemCount={0}
      />

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
        <h1 className="mb-12 text-3xl font-light" data-testid="text-orders-title">Your Orders</h1>

        {orders.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-center">
            <p className="text-muted-foreground">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="p-6" data-testid={`order-${order.id}`}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt!).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge data-testid={`badge-status-${order.id}`}>
                      {order.status}
                    </Badge>
                    <p className="mt-2 text-lg font-medium" data-testid={`text-total-${order.id}`}>
                      ${parseFloat(order.total).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm" data-testid={`order-item-${item.id}`}>
                        <span>
                          {item.productName} ({item.size}, {item.color}) × {item.quantity}
                        </span>
                        <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Shipping to:</span> {order.shippingAddress}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
