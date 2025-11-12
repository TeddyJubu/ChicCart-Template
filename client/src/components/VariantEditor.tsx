import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { ProductVariant } from "@shared/schema";

const variantFormSchema = z.object({
  sku: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  costPrice: z.string().optional(),
  stock: z.coerce.number().min(0, "Stock must be non-negative"),
});

type VariantFormData = z.infer<typeof variantFormSchema>;

interface VariantEditorProps {
  variant: ProductVariant | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: VariantFormData) => void;
  isSaving: boolean;
}

export function VariantEditor({ variant, open, onClose, onSave, isSaving }: VariantEditorProps) {
  const form = useForm<VariantFormData>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: {
      sku: "",
      price: "",
      costPrice: "",
      stock: 0,
    },
  });

  // Reset form when variant changes
  useEffect(() => {
    if (variant && open) {
      form.reset({
        sku: variant.sku || "",
        price: variant.price || "",
        costPrice: variant.costPrice || "",
        stock: variant.stock || 0,
      });
    }
  }, [variant?.id, open, form]);

  const handleSubmit = (data: VariantFormData) => {
    onSave(data);
  };

  if (!variant) return null;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent key={variant?.id} side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            Edit Variant: {variant.size}, {variant.color}
          </SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div 
                className="w-8 h-8 rounded-full border" 
                style={{ backgroundColor: variant.colorHex }}
              />
              <span className="text-sm text-muted-foreground">
                {variant.size} / {variant.color}
              </span>
            </div>

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Optional SKU" data-testid="input-variant-sku" />
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
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      step="0.01" 
                      data-testid="input-variant-price" 
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
                  <FormLabel>Cost Price ($)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      step="0.01" 
                      placeholder="Optional cost price"
                      data-testid="input-variant-cost-price" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? 0 : parseInt(value));
                      }}
                      data-testid="input-variant-stock" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
                data-testid="button-cancel-variant"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving}
                className="flex-1"
                data-testid="button-save-variant"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
