// From blueprint:javascript_database and blueprint:javascript_log_in_with_replit
import {
  users,
  products,
  productVariants,
  cartItems,
  orders,
  orderItems,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type ProductVariant,
  type InsertProductVariant,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations - required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Product operations
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;
  
  // Product variant operations
  getProductVariants(productId: string): Promise<ProductVariant[]>;
  createProductVariant(variant: InsertProductVariant): Promise<ProductVariant>;
  updateProductVariant(id: string, variant: Partial<InsertProductVariant>): Promise<ProductVariant | undefined>;
  deleteProductVariant(id: string): Promise<void>;
  
  // Cart operations
  getCartItems(userId: string): Promise<Array<CartItem & { product: Product; variant: ProductVariant }>>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrders(userId?: string): Promise<Array<Order & { items: OrderItem[] }>>;
  getOrder(id: string): Promise<(Order & { items: OrderItem[] }) | undefined>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  
  // Admin operations
  getAdminMetrics(): Promise<{
    totalProducts: number;
    totalOrders: number;
    totalRevenue: string;
    pendingOrders: number;
  }>;
  getProductsWithVariants(): Promise<Array<Product & { variants: ProductVariant[] }>>;
  getDatabaseStats(): Promise<{
    totalUsers: number;
    totalProducts: number;
    totalVariants: number;
    totalOrders: number;
    totalCartItems: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations - required for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Product operations
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Product variant operations
  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    return await db.select().from(productVariants).where(eq(productVariants.productId, productId));
  }

  async createProductVariant(variant: InsertProductVariant): Promise<ProductVariant> {
    const [newVariant] = await db.insert(productVariants).values(variant).returning();
    return newVariant;
  }

  async updateProductVariant(id: string, variant: Partial<InsertProductVariant>): Promise<ProductVariant | undefined> {
    const [updated] = await db
      .update(productVariants)
      .set({ ...variant, updatedAt: new Date() })
      .where(eq(productVariants.id, id))
      .returning();
    return updated;
  }

  async deleteProductVariant(id: string): Promise<void> {
    await db.delete(productVariants).where(eq(productVariants.id, id));
  }

  // Cart operations
  async getCartItems(userId: string): Promise<Array<CartItem & { product: Product; variant: ProductVariant }>> {
    const items = await db.query.cartItems.findMany({
      where: eq(cartItems.userId, userId),
      with: {
        product: true,
        variant: true,
      },
    });
    return items as Array<CartItem & { product: Product; variant: ProductVariant }>;
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existing = await db.query.cartItems.findFirst({
      where: and(
        eq(cartItems.userId, item.userId),
        eq(cartItems.productId, item.productId),
        eq(cartItems.variantId, item.variantId)
      ),
    });

    if (existing) {
      // Update quantity
      const [updated] = await db
        .update(cartItems)
        .set({ 
          quantity: (existing.quantity ?? 1) + (item.quantity ?? 1),
          updatedAt: new Date()
        })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return updated;
    }

    const [newItem] = await db.insert(cartItems).values(item).returning();
    return newItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const [updated] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, id))
      .returning();
    return updated;
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order operations
  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    await db.insert(orderItems).values(
      items.map(item => ({
        ...item,
        orderId: newOrder.id,
      }))
    );

    return newOrder;
  }

  async getOrders(userId?: string): Promise<Array<Order & { items: OrderItem[] }>> {
    const ordersQuery = userId
      ? await db.query.orders.findMany({
          where: eq(orders.userId, userId),
          with: { items: true },
          orderBy: desc(orders.createdAt),
        })
      : await db.query.orders.findMany({
          with: { items: true },
          orderBy: desc(orders.createdAt),
        });
    
    return ordersQuery as Array<Order & { items: OrderItem[] }>;
  }

  async getOrder(id: string): Promise<(Order & { items: OrderItem[] }) | undefined> {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: { items: true },
    });
    return order as (Order & { items: OrderItem[] }) | undefined;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [updated] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  // Admin operations
  async getAdminMetrics() {
    const result = await db.execute(
      `SELECT 
        (SELECT COUNT(*)::int FROM products) as "totalProducts",
        (SELECT COUNT(*)::int FROM orders) as "totalOrders",
        (SELECT COALESCE(SUM(total), 0)::text FROM orders) as "totalRevenue",
        (SELECT COUNT(*)::int FROM orders WHERE status = 'pending') as "pendingOrders"`
    );
    
    const row = result.rows[0] as any;
    
    return {
      totalProducts: row.totalProducts as number,
      totalOrders: row.totalOrders as number,
      totalRevenue: row.totalRevenue as string,
      pendingOrders: row.pendingOrders as number,
    };
  }

  async getProductsWithVariants() {
    const productsWithVariants = await db.query.products.findMany({
      with: { variants: true },
      orderBy: desc(products.createdAt),
    });
    
    return productsWithVariants as Array<Product & { variants: ProductVariant[] }>;
  }

  async getDatabaseStats() {
    const result = await db.execute(
      `SELECT 
        (SELECT COUNT(*)::int FROM users) as "totalUsers",
        (SELECT COUNT(*)::int FROM products) as "totalProducts",
        (SELECT COUNT(*)::int FROM product_variants) as "totalVariants",
        (SELECT COUNT(*)::int FROM orders) as "totalOrders",
        (SELECT COUNT(*)::int FROM cart_items) as "totalCartItems"`
    );
    
    const row = result.rows[0] as any;
    
    return {
      totalUsers: row.totalUsers as number,
      totalProducts: row.totalProducts as number,
      totalVariants: row.totalVariants as number,
      totalOrders: row.totalOrders as number,
      totalCartItems: row.totalCartItems as number,
    };
  }
}

export const storage = new DatabaseStorage();
