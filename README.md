# 🛒 Modern E-Commerce Platform

A fully-featured, portable e-commerce platform built with React, TypeScript, and Node.js. Originally designed for minimal aesthetic inspired by brands like COS and Everlane.

## ✨ Features

### 🔐 Authentication & User Management
- Email/password registration and login
- JWT token-based authentication
- Session management with PostgreSQL
- Role-based access control (Admin/Customer)
- Password hashing with bcrypt

### 🛍️ E-Commerce Functionality
- Product catalog with variants (size, color, stock)
- Shopping cart with persistence
- Order management and history
- Admin dashboard with metrics
- Inventory management
- Customer order tracking

### 📁 File Management
- Drag & drop file uploads
- Multiple storage backends (Local, AWS S3, Cloudflare R2, DigitalOcean Spaces)
- Image validation and processing
- Secure file access controls

### 🎨 Modern UI/UX
- Clean, minimal design
- Responsive layout (mobile-first)
- Photography-forward product display
- Generous whitespace and typography
- Smooth animations and transitions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- (Optional) Docker for easy setup

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd ecommerce-platform
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Database Setup
```bash
# Option A: Use Docker
docker-compose up -d db

# Option B: Use your own PostgreSQL
# Update DATABASE_URL in .env

# Push database schema
npm run db:push

# Seed with sample data
npm run seed
```

### 4. Start Development
```bash
npm run dev
```

Visit `http://localhost:5173` for the frontend and `http://localhost:5000` for the API.

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library with hooks and context
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible components
- **TanStack Query** - Server state management
- **Wouter** - Lightweight client-side routing

### Backend  
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server development
- **Drizzle ORM** - Type-safe SQL toolkit
- **JWT + Sessions** - Authentication strategy
- **Multer** - File upload handling

### Database & Storage
- **PostgreSQL** - Primary database
- **AWS S3 Compatible** - File storage (S3, R2, Spaces)
- **Local Filesystem** - Development storage option

### Development Tools
- **Vite** - Fast build tool and dev server
- **ESBuild** - Fast bundler for production
- **Drizzle Kit** - Database migrations and introspection

## 📊 Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── pages/         # Route components
├── server/                # Express.js backend
│   ├── auth.ts           # Authentication logic
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   └── storageService.ts # File storage abstraction
├── shared/               # Shared TypeScript schemas
│   └── schema.ts        # Database schema definitions
├── attached_assets/     # Static assets and images
└── docker-compose.yml   # Container orchestration
```

## 🔧 Configuration

### Environment Variables
See `.env.example` for complete configuration options.

#### Required
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
SESSION_SECRET=your-secure-session-secret
JWT_SECRET=your-secure-jwt-secret
```

#### File Storage Options
Choose between local storage or cloud providers:

```bash
# Local Storage (Development)
UPLOAD_DIR=./uploads
BASE_URL=http://localhost:5000

# AWS S3 (Production)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket
AWS_S3_REGION=us-east-1

# Cloudflare R2 (Cost-effective S3 alternative)
AWS_S3_ENDPOINT=https://account-id.r2.cloudflarestorage.com
```

## 🚀 Deployment

This application is **100% portable** and can be deployed anywhere:

### Docker (Recommended)
```bash
docker-compose up -d
```

### Cloud Platforms
- **Vercel** - Frontend + Serverless functions
- **Railway** - Full-stack deployment
- **Render** - Web services + PostgreSQL
- **DigitalOcean Apps** - Managed platform
- **AWS/GCP/Azure** - Virtual machines or containers

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment guides.

## 🧪 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run check        # TypeScript type checking
npm run db:push      # Push database schema
npm run seed         # Seed sample data
```

### Database Operations
```bash
# Generate new migration
npx drizzle-kit generate

# Apply migrations
npm run db:push

# View database in browser
npx drizzle-kit studio
```

### Adding New Features
1. Update database schema in `shared/schema.ts`
2. Run `npm run db:push` to update database
3. Add API routes in `server/routes.ts`
4. Create React components in `client/src/components/`
5. Add pages in `client/src/pages/`

## 🔒 Security

- **Authentication**: JWT tokens + HTTP-only session cookies
- **Password Security**: bcrypt hashing with 12 salt rounds
- **File Upload**: Type validation, size limits, virus scanning
- **SQL Injection**: Parameterized queries via Drizzle ORM
- **XSS Protection**: Content Security Policy headers
- **CSRF Protection**: Same-site cookie attributes

## 📈 Performance

- **Frontend**: Code splitting, lazy loading, image optimization
- **Backend**: Connection pooling, query optimization, caching
- **Database**: Proper indexing, foreign key constraints
- **Files**: CDN integration, compressed images, lazy loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Design inspiration from COS and Everlane
- Built with modern React and Node.js best practices
- Uses industry-standard authentication and security patterns
- Designed for scalability and maintainability

---

**Ready to deploy anywhere! No platform lock-in.** 🚀