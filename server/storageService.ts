import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Storage service interface
export interface StorageService {
  upload(file: Buffer, key: string, contentType?: string): Promise<string>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
  exists(key: string): Promise<boolean>;
  getPublicUrl(key: string): string;
}

// AWS S3 Compatible Storage Implementation
export class S3StorageService implements StorageService {
  private client: S3Client;
  private bucket: string;
  private region: string;

  constructor(config: {
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    region: string;
    endpoint?: string; // For S3-compatible services like Cloudflare R2
  }) {
    this.bucket = config.bucket;
    this.region = config.region;
    
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      ...(config.endpoint && {
        endpoint: config.endpoint,
        forcePathStyle: true, // Required for some S3-compatible services
      }),
    });
  }

  async upload(file: Buffer, key: string, contentType?: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: contentType || 'application/octet-stream',
    });

    await this.client.send(command);
    return this.getPublicUrl(key);
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.client, command, { expiresIn });
  }

  async exists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  getPublicUrl(key: string): string {
    // For AWS S3
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}

// Local Filesystem Storage Implementation
export class LocalStorageService implements StorageService {
  private uploadDir: string;
  private baseUrl: string;

  constructor(config: { uploadDir: string; baseUrl: string }) {
    this.uploadDir = config.uploadDir;
    this.baseUrl = config.baseUrl;
  }

  async upload(file: Buffer, key: string, contentType?: string): Promise<string> {
    const filePath = path.join(this.uploadDir, key);
    const dir = path.dirname(filePath);

    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(filePath, file);

    return this.getPublicUrl(key);
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.uploadDir, key);
    try {
      await fs.unlink(filePath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async getSignedUrl(key: string, expiresIn?: number): Promise<string> {
    // For local storage, we can just return the public URL
    // In a real implementation, you might want to add JWT-based temporary URLs
    return this.getPublicUrl(key);
  }

  async exists(key: string): Promise<boolean> {
    const filePath = path.join(this.uploadDir, key);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  getPublicUrl(key: string): string {
    return `${this.baseUrl}/uploads/${key}`;
  }
}

// Storage Factory
export function createStorageService(): StorageService {
  const env = process.env.NODE_ENV || 'development';
  
  // Use S3 in production or if AWS credentials are provided
  if (env === 'production' || (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)) {
    if (!process.env.AWS_S3_BUCKET || !process.env.AWS_S3_REGION) {
      throw new Error('AWS_S3_BUCKET and AWS_S3_REGION must be set for S3 storage');
    }
    
    return new S3StorageService({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      bucket: process.env.AWS_S3_BUCKET!,
      region: process.env.AWS_S3_REGION!,
      endpoint: process.env.AWS_S3_ENDPOINT, // Optional for S3-compatible services
    });
  }
  
  // Use local storage for development
  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  
  return new LocalStorageService({
    uploadDir,
    baseUrl,
  });
}

// Default storage service instance
export const storageService = createStorageService();

// Utility function to generate unique file keys
export function generateFileKey(originalName: string, userId?: string): string {
  const timestamp = Date.now();
  const randomId = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);
  
  // Sanitize the filename
  const safeName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
  
  const key = userId 
    ? `users/${userId}/${timestamp}-${randomId}-${safeName}${ext}`
    : `public/${timestamp}-${randomId}-${safeName}${ext}`;
    
  return key;
}

// File type validation
export function validateImageFile(file: { mimetype: string; size: number }): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.mimetype)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF images.',
    };
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 10MB.',
    };
  }
  
  return { valid: true };
}