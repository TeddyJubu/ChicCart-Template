import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Cart from "@/components/Cart";
import Footer from "@/components/Footer";
import ProductDetail from "@/components/ProductDetail";
import NotFound from "@/pages/not-found";

import heroImage from '@assets/generated_images/Hero_lifestyle_fashion_image_83b2bf3f.png';
import coat from '@assets/generated_images/Black_wool_coat_product_27eb8f6f.png';
import tshirt from '@assets/generated_images/White_cotton_t-shirt_product_ec7defdc.png';
import sweater from '@assets/generated_images/Navy_merino_sweater_product_efd24800.png';
import trousers from '@assets/generated_images/Charcoal_tailored_trousers_product_e9ee5545.png';
import shirt from '@assets/generated_images/Beige_linen_shirt_product_61060a7e.png';
import scarf from '@assets/generated_images/Black_cashmere_scarf_product_6d3c2c4b.png';
import jacket from '@assets/generated_images/Olive_green_jacket_product_cc9a14e8.png';
import cardigan from '@assets/generated_images/Cream_knit_cardigan_product_2967f5bf.png';
import detail from '@assets/generated_images/Detail_shot_white_shirt_446b0a8e.png';

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
];

//todo: remove mock functionality
const mockProductDetail = {
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
    { id: "1", size: "XS", color: "Black", inStock: true },
    { id: "2", size: "S", color: "Black", inStock: true },
    { id: "3", size: "M", color: "Black", inStock: true },
    { id: "4", size: "L", color: "Black", inStock: true },
    { id: "5", size: "XL", color: "Black", inStock: false },
    { id: "6", size: "M", color: "Charcoal", inStock: false },
    { id: "7", size: "L", color: "Navy", inStock: true },
  ],
};

function HomePage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  //todo: remove mock functionality
  const [cartItems, setCartItems] = useState([
    { id: "1", name: "Wool Coat", price: 295, quantity: 1, size: "M", color: "Black", imageSrc: coat },
    { id: "3", name: "Merino Sweater", price: 125, quantity: 2, size: "L", color: "Navy", imageSrc: sweater },
  ]);

  const handleQuickAdd = (productId: string) => {
    console.log('Quick add product:', productId);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  return (
    <>
      <Header
        onCartClick={() => setIsCartOpen(true)}
        onMenuClick={() => console.log('Menu clicked')}
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
      />
      
      <main>
        <Hero
          imageSrc={heroImage}
          title="Timeless Essentials"
          subtitle="Minimal designs crafted for modern living"
          ctaText="Explore Collection"
          onCtaClick={() => console.log('Hero CTA clicked')}
        />
        
        <ProductGrid
          products={mockProducts}
          onQuickAdd={handleQuickAdd}
        />
      </main>

      <Footer />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => console.log('Checkout clicked')}
      />
    </>
  );
}

function ProductPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  //todo: remove mock functionality
  const [cartItems, setCartItems] = useState([]);

  const handleAddToCart = (size: string, color: string) => {
    console.log('Add to cart:', size, color);
    setIsCartOpen(true);
  };

  return (
    <>
      <Header
        onCartClick={() => setIsCartOpen(true)}
        onMenuClick={() => console.log('Menu clicked')}
        cartItemCount={cartItems.length}
      />
      
      <main>
        <ProductDetail
          {...mockProductDetail}
          onAddToCart={handleAddToCart}
        />
      </main>

      <Footer />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={(id, qty) => console.log('Update:', id, qty)}
        onRemoveItem={(id) => console.log('Remove:', id)}
        onCheckout={() => console.log('Checkout clicked')}
      />
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/product/:id" component={ProductPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
