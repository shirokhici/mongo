import { promises as fs } from 'fs';
import path from 'path';
import { IncomingForm, File } from 'formidable';
import { NextRequest } from 'next/server';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  filename?: string;
}

/**
 * Allowed file types untuk upload
 */
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/svg+xml',
  'image/webp'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Ensure uploads directory exists
 */
export async function ensureUploadsDir(): Promise<void> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(originalName).toLowerCase();
  const nameWithoutExt = path.basename(originalName, ext);
  
  // Sanitize filename
  const sanitizedName = nameWithoutExt
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 20);
  
  return `${sanitizedName}-${timestamp}-${random}${ext}`;
}

/**
 * Validate file type and size
 */
export function validateFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype || '')) {
    return {
      isValid: false,
      error: `File type not allowed. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }

  return { isValid: true };
}

/**
 * Save uploaded file to uploads directory
 */
export async function saveUploadedFile(file: File): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Ensure uploads directory exists
    await ensureUploadsDir();

    // Generate unique filename
    const filename = generateUniqueFilename(file.originalFilename || 'upload');
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', filename);

    // Read file data
    const fileData = await fs.readFile(file.filepath);
    
    // Save file
    await fs.writeFile(uploadPath, fileData);

    // Clean up temp file
    try {
      await fs.unlink(file.filepath);
    } catch (error) {
      console.warn('Failed to clean up temp file:', error);
    }

    return {
      success: true,
      url: `/uploads/${filename}`,
      filename
    };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: 'Failed to save file'
    };
  }
}

/**
 * Delete file from uploads directory
 */
export async function deleteUploadedFile(url: string): Promise<boolean> {
  try {
    if (!url.startsWith('/uploads/')) {
      return false;
    }

    const filename = path.basename(url);
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
    
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error('File deletion error:', error);
    return false;
  }
}

/**
 * Parse multipart form data
 */
export async function parseFormData(request: NextRequest): Promise<{ fields: any; files: any }> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      uploadDir: '/tmp',
      keepExtensions: true,
      maxFileSize: MAX_FILE_SIZE,
    });

    // Convert NextRequest to Node.js IncomingMessage-like object
    const req = request as any;
    
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
}

/**
 * Get file info from URL
 */
export async function getFileInfo(url: string): Promise<{ exists: boolean; size?: number; mtime?: Date }> {
  try {
    if (!url.startsWith('/uploads/')) {
      return { exists: false };
    }

    const filename = path.basename(url);
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
    
    const stats = await fs.stat(filePath);
    return {
      exists: true,
      size: stats.size,
      mtime: stats.mtime
    };
  } catch (error) {
    return { exists: false };
  }
}