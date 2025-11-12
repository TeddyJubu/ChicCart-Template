// From blueprint:javascript_log_in_with_replit
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertProductSchema, 
  insertProductVariantSchema, 
  insertCartItemSchema,
  insertOrderSchema,
  insertOrderItemSchema 
} from "@shared/schema";
import bcrypt from "bcrypt";

// Helper function to get user ID from either local session or OIDC
function getUserId(req: any): string | null {
  // Check local session first
  if (req.session?.userId) {
    return req.session.userId;
  }
  // Fall back to OIDC
  if (req.user?.claims?.sub) {
    return req.user.claims.sub;
  }
  return null;
}

// Helper function to exclude password from user object
function sanitizeUser(user: any) {
  if (!user) return user;
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// In-memory API request log (ring buffer of last 100 requests)
const apiLogs: Array<{
  method: string;
  path: string;
  status: number;
  duration: number;
  timestamp: string;
}> = [];

const MAX_LOGS = 100;

// System startup time for uptime calculation
const startupTime = Date.now();

export async function registerRoutes(app: Express): Promise<Server> {
  // Request logging middleware (for admin dashboard)
  app.use((req, res, next) => {
    const startTime = Date.now();
    
    // Capture response finish to log duration
    const originalSend = res.send;
    res.send = function (data) {
      const duration = Date.now() - startTime;
      
      // Only log API requests
      if (req.path.startsWith('/api')) {
        apiLogs.push({
          method: req.method,
          path: req.path,
          status: res.statusCode,
          duration,
          timestamp: new Date().toISOString(),
        });
        
        // Keep only last MAX_LOGS entries
        if (apiLogs.length > MAX_LOGS) {
          apiLogs.shift();
        }
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  });

  // Auth middleware
  await setupAuth(app);

  // Local login endpoint (username/password)
  app.post('/api/local-login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Compare hashed password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Regenerate session to prevent session fixation attacks
      await new Promise<void>((resolve, reject) => {
        (req as any).session.regenerate((err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Set up session for local login
      (req as any).session.userId = user.id;
      
      await new Promise<void>((resolve, reject) => {
        (req as any).session.save((err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });

      res.json({ 
        success: true,
        user: sanitizeUser(user)
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check for local login session first
      if (req.session?.userId) {
        const user = await storage.getUser(req.session.userId);
        if (user) {
          return res.json(sanitizeUser(user));
        }
      }
      
      // Fall back to OIDC authentication
      if (!req.user?.claims?.sub) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      res.json(sanitizeUser(user));
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Logout endpoint for local auth
  app.post('/api/local-logout', async (req: any, res) => {
    try {
      await new Promise<void>((resolve, reject) => {
        req.session.destroy((err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Object storage routes for product images
  app.post('/api/objects/upload', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { ObjectStorageService } = await import('./objectStorage');
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  app.put('/api/product-images', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      if (!req.body.imageURL) {
        return res.status(400).json({ error: "imageURL is required" });
      }

      const { ObjectStorageService } = await import('./objectStorage');
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: userId,
          visibility: "public",
        },
      );

      res.status(200).json({ objectPath });
    } catch (error) {
      console.error("Error setting product image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const { ObjectStorageService, ObjectNotFoundError } = await import('./objectStorage');
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      const { ObjectNotFoundError } = await import('./objectStorage');
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Product routes
  app.get('/api/products', async (_req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validated = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validated);
      res.status(201).json(product);
    } catch (error: any) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: error.message || "Failed to create product" });
    }
  });

  app.patch('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: error.message || "Failed to update product" });
    }
  });

  app.delete('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Product variant routes
  app.get('/api/products/:productId/variants', async (req, res) => {
    try {
      const variants = await storage.getProductVariants(req.params.productId);
      res.json(variants);
    } catch (error) {
      console.error("Error fetching variants:", error);
      res.status(500).json({ message: "Failed to fetch variants" });
    }
  });

  app.post('/api/variants', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validated = insertProductVariantSchema.parse(req.body);
      const variant = await storage.createProductVariant(validated);
      res.status(201).json(variant);
    } catch (error: any) {
      console.error("Error creating variant:", error);
      res.status(400).json({ message: error.message || "Failed to create variant" });
    }
  });

  app.patch('/api/variants/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const variant = await storage.updateProductVariant(req.params.id, req.body);
      if (!variant) {
        return res.status(404).json({ message: "Variant not found" });
      }
      res.json(variant);
    } catch (error: any) {
      console.error("Error updating variant:", error);
      res.status(400).json({ message: error.message || "Failed to update variant" });
    }
  });

  app.delete('/api/variants/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteProductVariant(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting variant:", error);
      res.status(500).json({ message: "Failed to delete variant" });
    }
  });

  // Cart routes
  app.get('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const items = await storage.getCartItems(userId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const validated = insertCartItemSchema.parse({ ...req.body, userId });
      const item = await storage.addToCart(validated);
      res.status(201).json(item);
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      res.status(400).json({ message: error.message || "Failed to add to cart" });
    }
  });

  app.patch('/api/cart/:id', isAuthenticated, async (req, res) => {
    try {
      const { quantity } = req.body;
      const item = await storage.updateCartItem(req.params.id, quantity);
      if (!item) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json(item);
    } catch (error: any) {
      console.error("Error updating cart item:", error);
      res.status(400).json({ message: error.message || "Failed to update cart item" });
    }
  });

  app.delete('/api/cart/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.removeFromCart(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  // Order routes
  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { customerEmail, customerName, shippingAddress, items } = req.body;
      
      // Calculate total
      const total = items.reduce((sum: number, item: any) => 
        sum + (parseFloat(item.price) * item.quantity), 0
      );

      const order = await storage.createOrder(
        {
          userId,
          customerEmail,
          customerName,
          shippingAddress,
          total: total.toString(),
          status: 'pending',
        },
        items
      );

      // Clear cart after order
      await storage.clearCart(userId);

      res.status(201).json(order);
    } catch (error: any) {
      console.error("Error creating order:", error);
      res.status(400).json({ message: error.message || "Failed to create order" });
    }
  });

  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      
      // Admins can see all orders
      const orders = user?.isAdmin 
        ? await storage.getOrders()
        : await storage.getOrders(userId);
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const order = await storage.getOrder(req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const user = await storage.getUser(userId);
      
      // Check if user owns this order or is admin
      if (order.userId !== userId && !user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.patch('/api/orders/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error: any) {
      console.error("Error updating order status:", error);
      res.status(400).json({ message: error.message || "Failed to update order status" });
    }
  });

  // Admin API endpoints
  app.get('/api/admin/metrics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const metrics = await storage.getAdminMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching admin metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  app.get('/api/admin/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const products = await storage.getProductsWithVariants();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products with variants:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/admin/health', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const uptime = Math.floor((Date.now() - startupTime) / 1000);
      res.json({
        status: "healthy",
        uptime,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error fetching health:", error);
      res.status(500).json({ message: "Failed to fetch health" });
    }
  });

  app.get('/api/admin/db-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getDatabaseStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching database stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/admin/logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Return logs in reverse chronological order
      res.json([...apiLogs].reverse());
    } catch (error) {
      console.error("Error fetching logs:", error);
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
