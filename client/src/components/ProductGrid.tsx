import ProductCard from "./ProductCard";

interface Product {
  id: string;
  name: string;
  price: number;
  imageSrc: string;
  colors?: string[];
}

interface ProductGridProps {
  products: Product[];
  onQuickAdd?: (id: string) => void;
}

export default function ProductGrid({ products, onQuickAdd }: ProductGridProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-12 lg:py-24">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            onQuickAdd={onQuickAdd}
          />
        ))}
      </div>
    </section>
  );
}
