import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageSrc: string;
  colors?: string[];
  onQuickAdd?: (id: string) => void;
}

export default function ProductCard({ id, name, price, imageSrc, colors = [], onQuickAdd }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`card-product-${id}`}
    >
      {/* Product Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary">
        <img
          src={imageSrc}
          alt={name}
          className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
        />
        
        {/* Quick Add Button - appears on hover */}
        <div
          className={`absolute inset-x-0 bottom-0 flex justify-center p-6 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Button
            size="sm"
            onClick={() => onQuickAdd?.(id)}
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 shadow-lg"
            data-testid={`button-quick-add-${id}`}
          >
            <Plus className="mr-2 h-4 w-4" />
            Quick Add
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="mt-4 space-y-2">
        <h3 className="text-base font-normal text-foreground" data-testid={`text-product-name-${id}`}>
          {name}
        </h3>
        <p className="text-base font-medium text-foreground" data-testid={`text-product-price-${id}`}>
          ${price}
        </p>
        
        {/* Color dots */}
        {colors.length > 0 && (
          <div className="flex gap-1.5" data-testid={`colors-${id}`}>
            {colors.map((color, idx) => (
              <div
                key={idx}
                className="h-3 w-3 rounded-full border border-border"
                style={{ backgroundColor: color }}
                data-testid={`color-dot-${id}-${idx}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
