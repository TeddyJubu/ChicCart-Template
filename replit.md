# Minimal Modern Clothing E-commerce

## Overview

This is a minimal modern clothing e-commerce platform inspired by brands like COS and Everlane. The application features a photography-forward aesthetic with large product imagery, generous whitespace, and minimal UI elements. Users can browse products, add items to cart, manage orders, and admins can manage product inventory through a dedicated admin panel.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool and development server.

**Routing**: Client-side routing implemented with Wouter for lightweight, hook-based navigation.

**State Management**: 
- TanStack Query (React Query) for server state management with centralized query client configuration
- Local component state for UI interactions (cart open/close, selected variants, etc.)

**UI Component Library**: Shadcn UI components based on Radix UI primitives, configured with the "new-york" style preset. Components use Tailwind CSS with custom design tokens for consistent styling.

**Design System**:
- Typography: Inter font family with specific size/weight hierarchies for different content types
- Layout: Container-based max-width system (max-w-7xl) with responsive padding
- Spacing: Tailwind primitives (4, 6, 8, 12, 16, 20, 24, 32) for consistency
- Color System: HSL-based custom properties for theme support with neutral base color

**Key Pages**:
- Landing: Hero-driven landing page for logged-out users
- Shop: Product grid with quick-add functionality
- ProductPage: Detailed product view with variant selection
- Checkout: Order creation with address collection
- Orders: Order history view
- Admin: Product and inventory management (admin-only)

**Component Architecture**:
- Reusable components: Header, Footer, Cart (slide-in panel), ProductCard, ProductGrid, ProductDetail, Hero
- UI components: Extensive shadcn/ui library for forms, dialogs, buttons, inputs, etc.

### Backend Architecture

**Framework**: Express.js server with TypeScript running on Node.js.

**API Design**: RESTful API with route handlers organized in `/server/routes.ts`:
- Product endpoints: GET/POST/PUT/DELETE for products and variants
- Cart endpoints: Session-based cart management
- Order endpoints: Order creation and retrieval
- Auth endpoints: User session management

**Development Workflow**: 
- Vite middleware integration for HMR during development
- Separate build process for client (Vite) and server (esbuild)
- Production mode serves static client build from Express

**Error Handling**: Centralized error handling with 401 detection for unauthorized requests, triggering re-authentication flow.

### Data Storage

**Database**: PostgreSQL accessed via Neon serverless driver with WebSocket support.

**ORM**: Drizzle ORM for type-safe database operations with schema-first approach.

**Schema Design**:
- `users`: User accounts with Replit auth integration, admin flags
- `sessions`: PostgreSQL-based session storage for authentication
- `products`: Product catalog with name, description, price, images
- `productVariants`: Size/color combinations with stock levels
- `cartItems`: User shopping carts with product/variant references
- `orders`: Order records with customer info and status
- `orderItems`: Individual line items within orders

**Relationships**:
- Products have many variants (one-to-many)
- Cart items reference products and variants (many-to-one)
- Orders have many order items (one-to-many)
- Users have many cart items and orders (one-to-many)

**Data Validation**: Zod schemas generated from Drizzle schema definitions using `drizzle-zod` for runtime validation.

### Authentication & Authorization

**Authentication Provider**: Replit OpenID Connect (OIDC) authentication.

**Session Management**: 
- Express sessions stored in PostgreSQL via `connect-pg-simple`
- Passport.js strategy for OIDC integration
- 7-day session TTL with secure, HTTP-only cookies

**Authorization**: 
- `isAuthenticated` middleware for protected routes
- User role checking via `isAdmin` flag in database
- Client-side auth state via `useAuth` hook with React Query

**Flow**:
- Unauthenticated users see landing page
- Login redirects to `/api/login` (Replit OIDC)
- Successful auth creates session and user record
- Client detects 401 responses and redirects to login

### External Dependencies

**UI Framework**: 
- Radix UI primitives for accessible component foundations
- Tailwind CSS for utility-first styling with PostCSS processing

**Development Tools**:
- Replit-specific plugins for development banner, cartographer, and error overlays
- TypeScript for type safety across client and server

**Database**:
- Neon PostgreSQL serverless database
- Drizzle Kit for migrations

**Third-Party Services**:
- Google Fonts (Inter font family)
- Replit OIDC for authentication

**Key NPM Packages**:
- `@tanstack/react-query`: Server state management
- `react-hook-form` + `@hookform/resolvers`: Form handling with Zod validation
- `wouter`: Lightweight routing
- `date-fns`: Date formatting
- `nanoid`: Unique ID generation
- `memoizee`: Function memoization
- `class-variance-authority` + `clsx`: Dynamic className generation