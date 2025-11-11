import ProductDetail from '../ProductDetail'
import coat from '@assets/generated_images/Black_wool_coat_product_27eb8f6f.png'
import detail from '@assets/generated_images/Detail_shot_white_shirt_446b0a8e.png'

//todo: remove mock functionality
const mockData = {
  name: "Wool Coat",
  price: 295,
  description: "A timeless wool coat crafted from premium Italian wool. Features a minimalist design with clean lines, a relaxed fit, and subtle details. Perfect for layering in cooler weather.",
  images: [coat, detail, coat, detail],
  sizes: ["XS", "S", "M", "L", "XL"],
  colors: [
    { name: "Black", hex: "#000000" },
    { name: "Charcoal", hex: "#3a3a3a" },
    { name: "Navy", hex: "#1a2847" },
  ],
  variants: [
    { id: "1", size: "M", color: "Black", inStock: true },
    { id: "2", size: "L", color: "Black", inStock: true },
    { id: "3", size: "M", color: "Charcoal", inStock: false },
    { id: "4", size: "L", color: "Navy", inStock: true },
  ],
}

export default function ProductDetailExample() {
  return (
    <ProductDetail
      {...mockData}
      onAddToCart={(size, color) => console.log('Add to cart:', size, color)}
    />
  )
}
