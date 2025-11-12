import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import type { Product, ProductVariant } from "@shared/schema";
import { useState, useEffect } from "react";

const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  sku: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  tags: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  compareAtPrice: z.string().optional(),
  costPrice: z.string().optional(),
  imageSrc: z.string().min(1, "At least one image is required"),
  images: z.string().optional(),
  coverImageIndex: z.number().default(0),
  lowStockThreshold: z.number().default(10),
  allowBackorders: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productFormSchema>;

export default function ProductEditor() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);

  const isNewProduct = id === "new";

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", id],
    enabled: !isNewProduct,
  });

  const { data: variants = [] } = useQuery<ProductVariant[]>({
    queryKey: ["/api/products", id, "variants"],
    enabled: !isNewProduct,
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      category: "",
      subcategory: "",
      tags: "",
      price: "",
      compareAtPrice: "",
      costPrice: "",
      imageSrc: "",
      images: "",
      coverImageIndex: 0,
      lowStockThreshold: 10,
      allowBackorders: false,
    },
  });

  // Reset form when product data loads
  useEffect(() => {
    if (product && !isNewProduct) {
      form.reset({
        name: product.name || "",
        description: product.description || "",
        sku: product.sku || "",
        category: product.category || "",
        subcategory: product.subcategory || "",
        tags: product.tags?.join(", ") || "",
        price: product.price || "",
        compareAtPrice: product.compareAtPrice || "",
        costPrice: product.costPrice || "",
        imageSrc: product.imageSrc || "",
        images: product.images?.join(",") || "",
        coverImageIndex: product.coverImageIndex || 0,
        lowStockThreshold: product.lowStockThreshold || 10,
        allowBackorders: product.allowBackorders || false,
      });
      
      // Initialize image state from product data
      if (product.images && product.images.length > 0) {
        setUploadedImages(product.images);
      }
      setCoverIndex(product.coverImageIndex || 0);
    }
  }, [product, isNewProduct, form]);

  const mutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      // Use current image state, ensuring cover index is valid
      const finalImages = uploadedImages.length > 0 ? uploadedImages : [];
      
      // Guard against empty images array - default to 0 and ensure it's non-negative
      let safeCoverIndex = 0;
      if (finalImages.length > 0) {
        safeCoverIndex = Math.min(Math.max(0, coverIndex), finalImages.length - 1);
      }
      
      const productData = {
        name: data.name,
        description: data.description,
        sku: data.sku || null,
        category: data.category || null,
        subcategory: data.subcategory || null,
        tags: data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        price: data.price,
        compareAtPrice: data.compareAtPrice || null,
        costPrice: data.costPrice || null,
        imageSrc: finalImages.length > 0 ? finalImages[safeCoverIndex] : data.imageSrc,
        images: finalImages,
        coverImageIndex: safeCoverIndex,
        lowStockThreshold: data.lowStockThreshold,
        allowBackorders: data.allowBackorders,
      };

      if (isNewProduct) {
        return apiRequest("/api/products", "POST", productData);
      } else {
        return apiRequest(`/api/products/${id}`, "PUT", productData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: isNewProduct ? "Product created" : "Product updated",
        description: `Product has been ${isNewProduct ? "created" : "updated"} successfully.`,
      });
      setLocation("/admin/owner");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async () => {
    return {
      method: "PUT" as const,
      url: await apiRequest("/api/objects/upload", "POST").then((res: any) => res.uploadURL),
    };
  };

  const handleImageUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const imageURL = result.successful[0].uploadURL;
      const res: any = await apiRequest("/api/product-images", "PUT", { imageURL });
      
      if (res.objectPath) {
        setUploadedImages(prev => [...prev, res.objectPath]);
        toast({
          title: "Image uploaded",
          description: "Image has been uploaded successfully.",
        });
      }
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      if (coverIndex >= newImages.length) {
        setCoverIndex(Math.max(0, newImages.length - 1));
      }
      return newImages;
    });
  };

  const displayImages = uploadedImages.length > 0 
    ? uploadedImages 
    : (product?.images || []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/admin/owner")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold">{isNewProduct ? "New Product" : "Edit Product"}</h1>
          <p className="text-muted-foreground">
            {isNewProduct ? "Create a new product" : "Update product details"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                  <CardDescription>Basic details about the product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
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
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={6}
                            placeholder="Product description... (Markdown supported)"
                            data-testid="input-product-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Optional product SKU" data-testid="input-product-sku" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Tops" data-testid="input-product-category" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subcategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subcategory</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., T-Shirts" data-testid="input-product-subcategory" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Comma-separated tags (e.g., summer, casual, cotton)" 
                            data-testid="input-product-tags"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                  <CardDescription>Set product pricing and cost information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00"
                            data-testid="input-product-price"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="compareAtPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compare-at Price (MSRP)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00"
                            data-testid="input-product-compare-price"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="costPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost Price</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00"
                            data-testid="input-product-cost-price"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Settings</CardTitle>
                  <CardDescription>Manage stock levels and backorder options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="lowStockThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Low Stock Threshold</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                            data-testid="input-low-stock-threshold"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allowBackorders"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-allow-backorders"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Allow Backorders</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Allow customers to order when out of stock
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>Upload and manage product images</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <ObjectUploader
                      maxNumberOfFiles={10}
                      maxFileSize={10485760}
                      onGetUploadParameters={handleImageUpload}
                      onComplete={handleImageUploadComplete}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Images
                    </ObjectUploader>
                  </div>

                  {displayImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-4">
                      {displayImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={img} 
                            alt={`Product ${index + 1}`}
                            className="w-full h-32 object-cover rounded-md border"
                          />
                          <div className="absolute top-2 right-2 space-x-1">
                            <Button
                              type="button"
                              size="icon"
                              variant={coverIndex === index ? "default" : "secondary"}
                              className="h-7 w-7"
                              onClick={() => setCoverIndex(index)}
                              data-testid={`button-set-cover-${index}`}
                            >
                              {coverIndex === index ? "★" : "☆"}
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="h-7 w-7"
                              onClick={() => removeImage(index)}
                              data-testid={`button-remove-image-${index}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="variants" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Variants</CardTitle>
                  <CardDescription>
                    {variants.length > 0 
                      ? `${variants.length} variants configured` 
                      : "No variants yet - add them from the main dashboard"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {variants.length > 0 ? (
                    <div className="space-y-2">
                      {variants.map((variant) => (
                        <div key={variant.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div>
                            <p className="font-medium">{variant.size} - {variant.color}</p>
                            <p className="text-sm text-muted-foreground">
                              Stock: {variant.stock} {variant.sku && `• SKU: ${variant.sku}`}
                            </p>
                          </div>
                          {variant.price && (
                            <p className="font-medium">${variant.price}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Save this product first, then add variants from the main dashboard
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/admin/owner")}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={mutation.isPending}
              data-testid="button-save-product"
            >
              {mutation.isPending ? "Saving..." : (isNewProduct ? "Create Product" : "Save Changes")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
