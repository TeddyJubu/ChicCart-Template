import ProductGrid from '../ProductGrid'
import coat from '@assets/generated_images/Black_wool_coat_product_27eb8f6f.png'
import tshirt from '@assets/generated_images/White_cotton_t-shirt_product_ec7defdc.png'
import sweater from '@assets/generated_images/Navy_merino_sweater_product_efd24800.png'
import trousers from '@assets/generated_images/Charcoal_tailored_trousers_product_e9ee5545.png'
import shirt from '@assets/generated_images/Beige_linen_shirt_product_61060a7e.png'
import scarf from '@assets/generated_images/Black_cashmere_scarf_product_6d3c2c4b.png'
import jacket from '@assets/generated_images/Olive_green_jacket_product_cc9a14e8.png'
import cardigan from '@assets/generated_images/Cream_knit_cardigan_product_2967f5bf.png'

//todo: remove mock functionality
const mockProducts = [
  { id: "1", name: "Wool Coat", price: 295, imageSrc: coat, colors: ["#000000", "#1a1a1a"] },
  { id: "2", name: "Cotton T-Shirt", price: 45, imageSrc: tshirt, colors: ["#FFFFFF", "#F8F8F8"] },
  { id: "3", name: "Merino Sweater", price: 125, imageSrc: sweater, colors: ["#1a2847", "#000000"] },
  { id: "4", name: "Tailored Trousers", price: 165, imageSrc: trousers, colors: ["#3a3a3a", "#000000"] },
  { id: "5", name: "Linen Shirt", price: 85, imageSrc: shirt, colors: ["#d4c5b0", "#FFFFFF"] },
  { id: "6", name: "Cashmere Scarf", price: 95, imageSrc: scarf, colors: ["#000000", "#3a3a3a"] },
  { id: "7", name: "Cotton Jacket", price: 185, imageSrc: jacket, colors: ["#5a6b4a", "#3a3a3a"] },
  { id: "8", name: "Knit Cardigan", price: 145, imageSrc: cardigan, colors: ["#e8dcc8", "#FFFFFF"] },
]

export default function ProductGridExample() {
  return (
    <ProductGrid
      products={mockProducts}
      onQuickAdd={(id) => console.log('Quick add:', id)}
    />
  )
}
