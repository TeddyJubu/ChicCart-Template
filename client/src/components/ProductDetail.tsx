import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  inStock: boolean;
}

interface ProductDetailProps {
  name: string;
  price: number;
  description: string;
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  variants: ProductVariant[];
  onAddToCart?: (size: string, color: string) => void;
}

export default function ProductDetail({
  name,
  price,
  description,
  images,
  sizes,
  colors,
  variants,
  onAddToCart,
}: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const isInStock = variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  )?.inStock ?? false;

  const canAddToCart = selectedSize && selectedColor && isInStock;

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
      <div className="grid gap-12 lg:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-[3/4] w-full overflow-hidden bg-secondary">
            <img
              src={images[selectedImage]}
              alt={name}
              className="h-full w-full object-cover"
              data-testid="img-product-main"
            />
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`aspect-[3/4] overflow-hidden bg-secondary transition-opacity ${
                  selectedImage === idx ? "opacity-100" : "opacity-60 hover:opacity-80"
                }`}
                data-testid={`button-thumbnail-${idx}`}
              >
                <img
                  src={img}
                  alt={`${name} view ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-light" data-testid="text-product-name">{name}</h1>
            <p className="text-2xl font-medium" data-testid="text-product-price">${price}</p>
          </div>

          <p className="text-base font-light leading-relaxed text-foreground" data-testid="text-product-description">
            {description}
          </p>

          {/* Color Selection */}
          <div className="space-y-3">
            <label className="text-sm uppercase tracking-wider">Color</label>
            <div className="flex gap-3">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`relative h-10 w-10 rounded-full border-2 transition-all ${
                    selectedColor === color.name
                      ? "border-foreground scale-110"
                      : "border-border hover:border-muted-foreground"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  data-testid={`button-color-${color.name}`}
                >
                  {selectedColor === color.name && (
                    <Check className="absolute inset-0 m-auto h-5 w-5 text-white mix-blend-difference" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-3">
            <label className="text-sm uppercase tracking-wider">Size</label>
            <div className="grid grid-cols-5 gap-3">
              {sizes.map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  onClick={() => setSelectedSize(size)}
                  data-testid={`button-size-${size}`}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          {/* Stock Status */}
          {selectedSize && selectedColor && (
            <div data-testid="text-stock-status">
              {isInStock ? (
                <p className="text-sm text-success">In Stock</p>
              ) : (
                <p className="text-sm text-muted-foreground line-through">Out of Stock</p>
              )}
            </div>
          )}

          {/* Add to Cart */}
          <Button
            size="lg"
            className="w-full"
            disabled={!canAddToCart}
            onClick={() => canAddToCart && onAddToCart?.(selectedSize, selectedColor)}
            data-testid="button-add-to-cart"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </section>
  );
}
