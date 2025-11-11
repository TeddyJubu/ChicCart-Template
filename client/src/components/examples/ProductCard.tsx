import ProductCard from '../ProductCard'
import productImage from '@assets/generated_images/Black_wool_coat_product_27eb8f6f.png'

export default function ProductCardExample() {
  return (
    <div className="w-80">
      <ProductCard
        id="1"
        name="Wool Coat"
        price={295}
        imageSrc={productImage}
        colors={["#000000", "#1a1a1a", "#4a4a4a"]}
        onQuickAdd={(id) => console.log('Quick add:', id)}
      />
    </div>
  )
}
