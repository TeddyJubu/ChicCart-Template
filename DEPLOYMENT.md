# 🚀 Deployment Guide

This e-commerce application is now **100% portable** and can be deployed anywhere! Here are your deployment options:

## 🐳 Quick Start with Docker (Recommended)

### 1. Clone and Setup
```bash
git clone <your-repo>
cd your-ecommerce-app
cp .env.example .env
# Edit .env with your configuration
```

### 2. Start with Docker Compose
```bash
# Start all services (app + database)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The application will be available at `http://localhost:5000`

### 3. Database Setup
```bash
# Push database schema
npm run db:push

# Seed with sample data (optional)
npm run seed
```

## ☁️ Cloud Platform Deployment

### Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   ```
   DATABASE_URL=your-postgres-url
   SESSION_SECRET=your-session-secret
   JWT_SECRET=your-jwt-secret
   AWS_S3_BUCKET=your-s3-bucket
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_S3_REGION=us-east-1
   ```
3. Deploy automatically on git push

### Railway
1. Connect GitHub repository to Railway
2. Add PostgreSQL service
3. Configure environment variables
4. Deploy with automatic builds

### DigitalOcean App Platform
1. Create new app from GitHub repository
2. Add managed PostgreSQL database
3. Configure environment variables
4. Deploy with auto-scaling

### Render
1. Connect repository to Render
2. Create PostgreSQL database
3. Set environment variables
4. Deploy web service

## 🗄️ Database Options

### Option 1: PostgreSQL (Recommended)
- **Local**: Use Docker Compose provided
- **Cloud**: Neon, Supabase, PlanetScale, Railway, Render
- **Managed**: AWS RDS, Google Cloud SQL, Azure Database

### Option 2: Any PostgreSQL-compatible database
The app uses standard PostgreSQL, so it works with:
- CockroachDB
- YugabyteDB
- Amazon Aurora PostgreSQL

## 📁 File Storage Options

### Option 1: Local Storage (Development/Simple)
```bash
UPLOAD_DIR=./uploads
BASE_URL=https://your-domain.com
```

### Option 2: AWS S3
```bash
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket
AWS_S3_REGION=us-east-1
```

### Option 3: Cloudflare R2 (S3 Compatible, Cheaper)
```bash
AWS_ACCESS_KEY_ID=your-r2-token
AWS_SECRET_ACCESS_KEY=your-r2-secret
AWS_S3_BUCKET=your-r2-bucket
AWS_S3_REGION=auto
AWS_S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
```

### Option 4: DigitalOcean Spaces
```bash
AWS_ACCESS_KEY_ID=your-spaces-key
AWS_SECRET_ACCESS_KEY=your-spaces-secret
AWS_S3_BUCKET=your-space-name
AWS_S3_REGION=nyc3
AWS_S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
```

## 🔧 Production Checklist

### Security
- [ ] Change default secrets in `.env`
- [ ] Use strong SESSION_SECRET and JWT_SECRET
- [ ] Enable HTTPS in production
- [ ] Configure proper CORS settings
- [ ] Set up database connection pooling

### Performance
- [ ] Enable gzip compression
- [ ] Use CDN for static assets
- [ ] Configure caching headers
- [ ] Optimize database queries
- [ ] Monitor application performance

### Monitoring
- [ ] Set up error tracking (Sentry, Rollbar)
- [ ] Configure logging (Winston, Pino)
- [ ] Add health check endpoints
- [ ] Set up uptime monitoring
- [ ] Monitor database performance

## 🌍 Environment Variables Reference

### Required
```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@host:5432/db
SESSION_SECRET=your-secure-session-secret
JWT_SECRET=your-secure-jwt-secret
```

### File Storage (Choose One)
```bash
# Local Storage
UPLOAD_DIR=./uploads
BASE_URL=https://your-domain.com

# OR Cloud Storage
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket
AWS_S3_REGION=us-east-1
AWS_S3_ENDPOINT=optional-for-s3-compatible
```

## 🚨 Migration from Replit

If you're migrating from Replit:

1. **Export your database** from Replit's PostgreSQL
2. **Download uploaded files** from Replit storage
3. **Update environment variables** to use new services
4. **Test authentication** with new email/password system
5. **Re-upload product images** using new file upload system

## 📞 Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test database connection
4. Verify file storage configuration
5. Check network/firewall settings

The application is now completely independent and can run anywhere! 🎉