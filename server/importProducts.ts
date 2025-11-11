import fs from 'fs';
import path from 'path';
import { db } from './db';
import { products, productVariants } from '../shared/schema';

interface CSVRow {
  ID: string;
  Type: string;
  SKU: string;
  Name: string;
  'Regular price': string;
  'Sale price': string;
  Stock: string;
  'In stock?': string;
  Categories: string;
  description: string;
  'Short description': string;
  Images: string;
  'Attribute 1 name': string;
  'Attribute 1 value(s)': string;
  'Attribute 2 name': string;
  'Attribute 2 value(s)': string;
}

// Helper function to parse CSV (simple implementation for structured data)
function parseCSV(content: string): CSVRow[] {
  const lines = content.split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = parseCSVLine(lines[i]);
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    rows.push(row as CSVRow);
  }
  
  return rows;
}

// Parse a CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Strip HTML tags from description
function stripHTML(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&bull;/g, '•')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract size from SKU (e.g., "MH01-L-Black" -> "L")
function extractSize(sku: string): string {
  const parts = sku.split('-');
  if (parts.length >= 2) {
    const sizeCandidate = parts[1];
    if (['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '29', '30', '31', '32', '33', '34', '36'].includes(sizeCandidate)) {
      return sizeCandidate;
    }
  }
  return 'M'; // Default size
}

// Extract color from SKU (e.g., "MH01-L-Black" -> "Black")
function extractColor(sku: string): string {
  const parts = sku.split('-');
  if (parts.length >= 3) {
    return parts.slice(2).join(' '); // Handle multi-word colors
  }
  return 'Black'; // Default color
}

// Color name to hex mapping
const colorMap: Record<string, string> = {
  'Black': '#000000',
  'White': '#FFFFFF',
  'Gray': '#808080',
  'Grey': '#808080',
  'Orange': '#FF8C00',
  'Purple': '#800080',
  'Red': '#DC143C',
  'Blue': '#4169E1',
  'Green': '#228B22',
  'Yellow': '#FFD700',
  'Beige': '#F5F5DC',
  'Brown': '#8B4513',
  'Khaki': '#F0E68C',
  'Navy': '#000080',
  'Cream': '#FFFDD0',
  'Charcoal': '#36454F',
};

function getColorHex(colorName: string): string {
  return colorMap[colorName] || '#808080';
}

// Placeholder image generator
function getPlaceholderImage(productName: string): string {
  // Use existing generated images or placeholder
  const baseImages = [
    '/attached_assets/generated_images/knit-cardigan_f7e76f76.png',
    '/attached_assets/generated_images/cotton-jacket_1e7f6e08.png',
    '/attached_assets/generated_images/cashmere-scarf_cc9feb39.png',
    '/attached_assets/generated_images/linen-shirt_08a5f9f1.png',
    '/attached_assets/generated_images/wool-coat_8dd0c3dc.png',
    '/attached_assets/generated_images/silk-blouse_e26299bd.png',
    '/attached_assets/generated_images/leather-jacket_53e40e46.png',
    '/attached_assets/generated_images/denim-jeans_d4b38f57.png',
  ];
  
  // Pick an image based on product name hash
  const hash = productName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return baseImages[hash % baseImages.length];
}

async function importProducts() {
  console.log('Starting product import...');
  
  // Read CSV file
  const csvPath = path.join(process.cwd(), 'attached_assets/Woo_Product_Dummy_Data_Set_Simple_and_Variable_1762857463498.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);
  
  console.log(`Parsed ${rows.length} rows from CSV`);
  
  // Group products by parent SKU
  const productMap = new Map<string, { parent: CSVRow | null; variations: CSVRow[] }>();
  
  for (const row of rows) {
    if (row.Type === 'variable') {
      const sku = row.SKU;
      if (!productMap.has(sku)) {
        productMap.set(sku, { parent: null, variations: [] });
      }
      productMap.get(sku)!.parent = row;
    } else if (row.Type === 'variation') {
      // Extract parent SKU (e.g., "MH01-L-Black" -> "MH01")
      const parentSKU = row.SKU.split('-')[0];
      if (!productMap.has(parentSKU)) {
        productMap.set(parentSKU, { parent: null, variations: [] });
      }
      productMap.get(parentSKU)!.variations.push(row);
    }
  }
  
  console.log(`Found ${productMap.size} unique products with variations`);
  
  // Clear existing products (optional - comment out if you want to keep existing)
  // await db.delete(productVariants);
  // await db.delete(products);
  
  let importedCount = 0;
  let variantCount = 0;
  
  // Import products and their variants
  for (const [sku, data] of productMap) {
    const parent = data.parent;
    const variations = data.variations;
    
    if (!parent || variations.length === 0) {
      console.log(`Skipping ${sku}: missing parent or variations`);
      continue;
    }
    
    // Take first 50 products to avoid overwhelming the database
    if (importedCount >= 50) {
      console.log('Reached limit of 50 products. Stopping import.');
      break;
    }
    
    const productName = parent.Name;
    const price = parent['Regular price'] || variations[0]?.['Regular price'] || '50';
    const description = stripHTML(parent.description || parent['Short description'] || `Premium ${productName}`);
    const imageSrc = getPlaceholderImage(productName);
    
    // Insert product
    const [insertedProduct] = await db.insert(products).values({
      name: productName,
      description: description.substring(0, 500), // Limit description length
      price: price,
      imageSrc: imageSrc,
    }).returning();
    
    console.log(`Imported product: ${productName} (${insertedProduct.id})`);
    importedCount++;
    
    // Insert variants
    for (const variant of variations) {
      const size = extractSize(variant.SKU);
      const color = extractColor(variant.SKU);
      const colorHex = getColorHex(color);
      const stock = parseInt(variant.Stock) || 100;
      
      await db.insert(productVariants).values({
        productId: insertedProduct.id,
        size: size,
        color: color,
        colorHex: colorHex,
        stock: stock,
      });
      
      variantCount++;
    }
    
    console.log(`  Added ${variations.length} variants`);
  }
  
  console.log(`\nImport complete!`);
  console.log(`Total products: ${importedCount}`);
  console.log(`Total variants: ${variantCount}`);
}

// Run import
importProducts()
  .then(() => {
    console.log('Import successful');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });
