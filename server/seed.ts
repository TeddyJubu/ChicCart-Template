import { db } from "./db";
import { products, productVariants } from "@shared/schema";

const sampleProducts = [
  {
    name: "Wool Coat",
    description: "A timeless wool coat crafted from premium Italian wool. Features a minimalist design with clean lines, a relaxed fit, and subtle details. Perfect for layering in cooler weather.",
    price: "295.00",
    imageSrc: "/assets/generated_images/Black_wool_coat_product_27eb8f6f.png",
    images: [
      "/assets/generated_images/Black_wool_coat_product_27eb8f6f.png",
      "/assets/generated_images/Detail_shot_white_shirt_446b0a8e.png"
    ],
    variants: [
      { size: "XS", color: "Black", colorHex: "#000000", stock: 5 },
      { size: "S", color: "Black", colorHex: "#000000", stock: 10 },
      { size: "M", color: "Black", colorHex: "#000000", stock: 15 },
      { size: "L", color: "Black", colorHex: "#000000", stock: 12 },
      { size: "XL", color: "Black", colorHex: "#000000", stock: 8 },
      { size: "M", color: "Charcoal", colorHex: "#3a3a3a", stock: 0 },
      { size: "L", color: "Navy", colorHex: "#1a2847", stock: 6 },
    ],
  },
  {
    name: "Cotton T-Shirt",
    description: "Essential cotton t-shirt in premium organic cotton. Classic crew neck, relaxed fit. A wardrobe staple that pairs with everything.",
    price: "45.00",
    imageSrc: "/assets/generated_images/White_cotton_t-shirt_product_ec7defdc.png",
    images: ["/assets/generated_images/White_cotton_t-shirt_product_ec7defdc.png"],
    variants: [
      { size: "XS", color: "White", colorHex: "#FFFFFF", stock: 20 },
      { size: "S", color: "White", colorHex: "#FFFFFF", stock: 25 },
      { size: "M", color: "White", colorHex: "#FFFFFF", stock: 30 },
      { size: "L", color: "White", colorHex: "#FFFFFF", stock: 20 },
      { size: "XL", color: "White", colorHex: "#FFFFFF", stock: 15 },
      { size: "M", color: "Off-White", colorHex: "#F8F8F8", stock: 12 },
    ],
  },
  {
    name: "Merino Sweater",
    description: "Luxurious merino wool sweater with exceptional softness. Breathable, temperature-regulating, and naturally odor-resistant.",
    price: "125.00",
    imageSrc: "/assets/generated_images/Navy_merino_sweater_product_efd24800.png",
    images: ["/assets/generated_images/Navy_merino_sweater_product_efd24800.png"],
    variants: [
      { size: "S", color: "Navy", colorHex: "#1a2847", stock: 8 },
      { size: "M", color: "Navy", colorHex: "#1a2847", stock: 12 },
      { size: "L", color: "Navy", colorHex: "#1a2847", stock: 10 },
      { size: "XL", color: "Navy", colorHex: "#1a2847", stock: 5 },
      { size: "M", color: "Black", colorHex: "#000000", stock: 15 },
    ],
  },
  {
    name: "Tailored Trousers",
    description: "Precision-cut trousers in premium wool blend. Modern tailored fit with clean lines. Designed for versatility and comfort.",
    price: "165.00",
    imageSrc: "/assets/generated_images/Charcoal_tailored_trousers_product_e9ee5545.png",
    images: ["/assets/generated_images/Charcoal_tailored_trousers_product_e9ee5545.png"],
    variants: [
      { size: "28", color: "Charcoal", colorHex: "#3a3a3a", stock: 6 },
      { size: "30", color: "Charcoal", colorHex: "#3a3a3a", stock: 10 },
      { size: "32", color: "Charcoal", colorHex: "#3a3a3a", stock: 12 },
      { size: "34", color: "Charcoal", colorHex: "#3a3a3a", stock: 8 },
      { size: "32", color: "Black", colorHex: "#000000", stock: 10 },
    ],
  },
  {
    name: "Linen Shirt",
    description: "Lightweight linen shirt perfect for warmer months. Natural breathability with a relaxed, lived-in feel. Classic collar and button-front.",
    price: "85.00",
    imageSrc: "/assets/generated_images/Beige_linen_shirt_product_61060a7e.png",
    images: ["/assets/generated_images/Beige_linen_shirt_product_61060a7e.png"],
    variants: [
      { size: "S", color: "Beige", colorHex: "#d4c5b0", stock: 15 },
      { size: "M", color: "Beige", colorHex: "#d4c5b0", stock: 20 },
      { size: "L", color: "Beige", colorHex: "#d4c5b0", stock: 15 },
      { size: "M", color: "White", colorHex: "#FFFFFF", stock: 18 },
    ],
  },
  {
    name: "Cashmere Scarf",
    description: "Pure cashmere scarf with exceptional softness and warmth. A timeless accessory for cooler days.",
    price: "95.00",
    imageSrc: "/assets/generated_images/Black_cashmere_scarf_product_6d3c2c4b.png",
    images: ["/assets/generated_images/Black_cashmere_scarf_product_6d3c2c4b.png"],
    variants: [
      { size: "One Size", color: "Black", colorHex: "#000000", stock: 25 },
      { size: "One Size", color: "Charcoal", colorHex: "#3a3a3a", stock: 20 },
    ],
  },
  {
    name: "Cotton Jacket",
    description: "Durable cotton jacket with clean minimal design. Features functional pockets and a comfortable fit. Built to last.",
    price: "185.00",
    imageSrc: "/assets/generated_images/Olive_green_jacket_product_cc9a14e8.png",
    images: ["/assets/generated_images/Olive_green_jacket_product_cc9a14e8.png"],
    variants: [
      { size: "S", color: "Olive", colorHex: "#5a6b4a", stock: 8 },
      { size: "M", color: "Olive", colorHex: "#5a6b4a", stock: 12 },
      { size: "L", color: "Olive", colorHex: "#5a6b4a", stock: 10 },
      { size: "M", color: "Charcoal", colorHex: "#3a3a3a", stock: 10 },
    ],
  },
  {
    name: "Knit Cardigan",
    description: "Soft knit cardigan in premium cotton blend. Versatile layering piece with a relaxed fit and classic button-front.",
    price: "145.00",
    imageSrc: "/assets/generated_images/Cream_knit_cardigan_product_2967f5bf.png",
    images: ["/assets/generated_images/Cream_knit_cardigan_product_2967f5bf.png"],
    variants: [
      { size: "S", color: "Cream", colorHex: "#e8dcc8", stock: 12 },
      { size: "M", color: "Cream", colorHex: "#e8dcc8", stock: 15 },
      { size: "L", color: "Cream", colorHex: "#e8dcc8", stock: 12 },
      { size: "M", color: "White", colorHex: "#FFFFFF", stock: 10 },
    ],
  },
];

async function seed() {
  console.log("Seeding database...");

  for (const product of sampleProducts) {
    const { variants, ...productData } = product;

    // Insert product
    const [insertedProduct] = await db
      .insert(products)
      .values(productData)
      .returning();

    console.log(`Created product: ${insertedProduct.name}`);

    // Insert variants
    for (const variant of variants) {
      await db.insert(productVariants).values({
        ...variant,
        productId: insertedProduct.id,
      });
    }

    console.log(`  Added ${variants.length} variants`);
  }

  console.log("Seeding completed!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
