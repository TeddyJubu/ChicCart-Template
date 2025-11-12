import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, ProductVariant, Order, OrderItem } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import type { z } from "zod";

import { 
  Plus, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Edit, 
  Trash2,
  AlertTriangle
} from "lucide-react";
import { VariantEditor } from "@/components/VariantEditor";

type ProductFormData = z.infer<typeof insertProductSchema>;

interface AdminMetrics {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: string;
  pendingOrders: number;
  lowStockVariants: number;
}

export default function OwnerDashboard() {
  const { toast } = useToast();
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [isVariantEditorOpen, setIsVariantEditorOpen] = useState(false);

  // Fetch metrics
  const { data: metrics } = useQuery<AdminMetrics>({
    queryKey: ['/api/admin/metrics'],
  });

  // Fetch products with variants
  const { data: products = [] } = useQuery<Array<Product & { variants: ProductVariant[] }>>({
    queryKey: ['/api/admin/products'],
  });

  // Fetch orders
  const { data: orders = [] } = useQuery<Array<Order & { items: OrderItem[] }>>({
    queryKey: ['/api/orders'],
  });

  const productForm = useForm<ProductFormData>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "0",
      imageSrc: "/attached_assets/generated_images/knit-cardigan_f7e76f76.png",
      images: [],
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      await apiRequest('/api/products', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/metrics'] });
      setIsAddProductOpen(false);
      productForm.reset();
      toast({
        title: "Success",
        description: "Product created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/products/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/metrics'] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
  });

  const updateVariantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { sku?: string; price?: string; costPrice?: string; stock?: number } }) => {
      await apiRequest(`/api/variants/${id}`, 'PATCH', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/metrics'] });
      setIsVariantEditorOpen(false);
      setSelectedVariant(null);
      toast({
        title: "Success",
        description: "Variant updated successfully",
      });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest(`/api/orders/${id}/status`, 'PATCH', { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Success",
        description: "Order status updated",
      });
    },
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container max-w-7xl py-6 space-y-6">
        {/* KPI Cards - Mobile First */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          <Card className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4" />
                <span className="text-xs md:text-sm">Products</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold" data-testid="metric-products">
                {metrics?.totalProducts || 0}
              </p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShoppingCart className="h-4 w-4" />
                <span className="text-xs md:text-sm">Orders</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold" data-testid="metric-orders">
                {metrics?.totalOrders || 0}
              </p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs md:text-sm">Revenue</span>
              </div>
              <p className="text-xl md:text-2xl font-bold" data-testid="metric-revenue">
                ${parseFloat(metrics?.totalRevenue || "0").toFixed(0)}
              </p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4" />
                <span className="text-xs md:text-sm">Pending</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold" data-testid="metric-pending">
                {metrics?.pendingOrders || 0}
              </p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs md:text-sm">Low Stock</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold" data-testid="metric-low-stock">
                {metrics?.lowStockVariants ?? 0}
              </p>
            </div>
          </Card>
        </div>

        {/* Products Section */}
        <Card className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-lg md:text-xl font-semibold">Products</h2>
            <Sheet open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
              <SheetTrigger asChild>
                <Button size="sm" data-testid="button-add-product" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Add New Product</SheetTitle>
                </SheetHeader>
                <Form {...productForm}>
                  <form 
                    onSubmit={productForm.handleSubmit((data) => createProductMutation.mutate(data))} 
                    className="space-y-4 mt-4"
                  >
                    <FormField
                      control={productForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-product-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={productForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} data-testid="input-product-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={productForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01" 
                              data-testid="input-product-price" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={productForm.control}
                      name="imageSrc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-product-image" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={createProductMutation.isPending} 
                      data-testid="button-submit-product"
                    >
                      {createProductMutation.isPending ? "Creating..." : "Create Product"}
                    </Button>
                  </form>
                </Form>
              </SheetContent>
            </Sheet>
          </div>

          {/* Product List - Mobile Optimized */}
          <div className="space-y-3">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No products yet</p>
                <p className="text-sm text-muted-foreground">Add your first product to get started</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="space-y-3">
                {products.map((product) => (
                  <AccordionItem 
                    key={product.id} 
                    value={product.id} 
                    className="border rounded-lg overflow-hidden"
                    data-testid={`product-item-${product.id}`}
                  >
                    <Card className="border-0">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline hover-elevate">
                        <div className="flex items-start gap-3 flex-1 text-left">
                          <img 
                            src={product.imageSrc} 
                            alt={product.name}
                            className="w-12 h-12 md:w-16 md:h-16 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{product.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {product.description}
                            </p>
                            <p className="text-sm font-medium mt-1">
                              ${parseFloat(product.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="px-4 pb-4 space-y-4">
                          <Separator />
                          
                          {/* Variants */}
                          <div>
                            <h4 className="text-sm font-medium mb-3">Variants & Stock</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {product.variants?.map((variant) => {
                                const isLowStock = variant.stock <= (product.lowStockThreshold ?? 5);
                                return (
                                  <div 
                                    key={variant.id} 
                                    className="flex items-center justify-between p-2 rounded border"
                                    data-testid={`variant-${variant.id}`}
                                  >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <div 
                                        className="w-4 h-4 rounded-full border flex-shrink-0" 
                                        style={{ backgroundColor: variant.colorHex }}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <p className="text-sm truncate">{variant.size}, {variant.color}</p>
                                          {isLowStock && (
                                            <Badge 
                                              variant="destructive" 
                                              className="text-xs px-1 py-0 h-4"
                                              data-testid={`badge-low-stock-${variant.id}`}
                                            >
                                              Low Stock
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                          Stock: {variant.stock}
                                          {variant.price && ` • $${parseFloat(variant.price).toFixed(2)}`}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-2 text-xs gap-1 flex-shrink-0"
                                      onClick={() => {
                                        setSelectedVariant(variant);
                                        setIsVariantEditorOpen(true);
                                      }}
                                      data-testid={`button-edit-variant-${variant.id}`}
                                    >
                                      <Edit className="h-3 w-3" />
                                      Edit
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <Separator />

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Link href={`/admin/products/${product.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                data-testid={`button-edit-${product.id}`}
                              >
                                <Edit className="h-4 w-4" />
                                Edit Product
                              </Button>
                            </Link>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-2"
                              onClick={() => {
                                if (confirm(`Delete ${product.name}?`)) {
                                  deleteProductMutation.mutate(product.id);
                                }
                              }}
                              data-testid={`button-delete-${product.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete Product
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </Card>

        {/* Orders Section */}
        <Card className="p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Recent Orders</h2>
          
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 10).map((order) => (
                <Card key={order.id} className="p-4" data-testid={`order-${order.id}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">#{order.id.slice(0, 8)}</span>
                        <Badge variant={
                          order.status === 'delivered' ? 'default' :
                          order.status === 'shipped' ? 'default' :
                          order.status === 'cancelled' ? 'destructive' : 'secondary'
                        }>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.customerName} • {order.customerEmail}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt!).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:items-end gap-2">
                      <p className="text-lg font-semibold">
                        ${parseFloat(order.total).toFixed(2)}
                      </p>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatusMutation.mutate({ 
                          id: order.id, 
                          status: e.target.value 
                        })}
                        className="h-8 rounded-md border border-border bg-background px-2 text-xs"
                        data-testid={`select-status-${order.id}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <>
                      <Separator className="my-3" />
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-xs text-muted-foreground">
                            <span>{item.productName} ({item.size}, {item.color}) × {item.quantity}</span>
                            <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Variant Editor Modal */}
      <VariantEditor
        variant={selectedVariant}
        open={isVariantEditorOpen}
        onClose={() => {
          setIsVariantEditorOpen(false);
          setSelectedVariant(null);
        }}
        onSave={(data) => {
          if (selectedVariant) {
            updateVariantMutation.mutate({
              id: selectedVariant.id,
              data,
            });
          }
        }}
        isSaving={updateVariantMutation.isPending}
      />
    </div>
  );
}
