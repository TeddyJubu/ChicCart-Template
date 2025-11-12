import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import type { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { storage } from './storage';
import type { User } from '@shared/schema';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-change-this';
const JWT_EXPIRES_IN = '7d';

// Session configuration
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: 'sessions',
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-this',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

// JWT utilities
export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Authentication middleware
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Check session first
  const sessionUserId = (req.session as any)?.userId;
  if (sessionUserId) {
    (req as any).userId = sessionUserId;
    return next();
  }

  // Check Authorization header for JWT
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  (req as any).userId = decoded.id;
  (req as any).userEmail = decoded.email;
  (req as any).isAdmin = decoded.isAdmin;
  
  next();
}

// Admin middleware
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, async () => {
    const userId = (req as any).userId;
    
    try {
      const user = await storage.getUser(userId);
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Error checking admin status' });
    }
  });
}

// Setup authentication routes
export function setupAuth(app: Express) {
  // Apply session middleware
  app.use(getSession());
  
  // Register route
  app.post('/api/register', async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });

      // Generate token
      const token = generateToken(user);
      
      // Set session
      (req.session as any).userId = user.id;

      // Remove password from response
      const { password: _, ...userResponse } = user;
      
      res.status(201).json({
        message: 'User created successfully',
        user: userResponse,
        token,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Login route
  app.post('/api/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Get user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate token
      const token = generateToken(user);
      
      // Set session
      (req.session as any).userId = user.id;

      // Remove password from response
      const { password: _, ...userResponse } = user;
      
      res.json({
        message: 'Login successful',
        user: userResponse,
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get current user route
  app.get('/api/me', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Remove password from response
      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Logout route
  app.post('/api/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).json({ message: 'Could not log out' });
      }
      res.json({ message: 'Logout successful' });
    });
  });

  // Update password route
  app.patch('/api/change-password', requireAuth, async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = (req as any).userId;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      }

      const user = await storage.getUser(userId);
      if (!user || !user.password) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isValidPassword = await comparePassword(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Hash new password and update
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(userId, { password: hashedPassword });

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}

// Helper function to get user ID from request (for compatibility)
export function getUserId(req: any): string | null {
  return req.userId || req.session?.userId || null;
}

// Helper function to sanitize user object (remove password)
export function sanitizeUser(user: any) {
  if (!user) return user;
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}