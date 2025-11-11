import { useState } from 'react'
import Cart from '../Cart'
import { Button } from '@/components/ui/button'
import coat from '@assets/generated_images/Black_wool_coat_product_27eb8f6f.png'
import sweater from '@assets/generated_images/Navy_merino_sweater_product_efd24800.png'

//todo: remove mock functionality
const mockItems = [
  { id: "1", name: "Wool Coat", price: 295, quantity: 1, size: "M", color: "Black", imageSrc: coat },
  { id: "2", name: "Merino Sweater", price: 125, quantity: 2, size: "L", color: "Navy", imageSrc: sweater },
]

export default function CartExample() {
  const [isOpen, setIsOpen] = useState(true)
  const [items, setItems] = useState(mockItems)

  return (
    <div className="min-h-screen p-8">
      <Button onClick={() => setIsOpen(true)}>Open Cart</Button>
      <Cart
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={items}
        onUpdateQuantity={(id, qty) => {
          setItems(items.map(item => item.id === id ? { ...item, quantity: qty } : item))
          console.log('Update quantity:', id, qty)
        }}
        onRemoveItem={(id) => {
          setItems(items.filter(item => item.id !== id))
          console.log('Remove item:', id)
        }}
        onCheckout={() => console.log('Checkout clicked')}
      />
    </div>
  )
}
