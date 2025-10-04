import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { saveUploadedFile, parseFormData } from '@/utils/fileHandler';

export async function POST(request: NextRequest) {
  try {
    // Verifikasi authentication
    const authResult = requireAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse form data
    const { files } = await parseFormData(request);
    
    if (!files || !files.file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Handle single file or array of files
    const fileToUpload = Array.isArray(files.file) ? files.file[0] : files.file;

    // Save file
    const result = await saveUploadedFile(fileToUpload);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: result.url,
        filename: result.filename,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Disable body parser untuk handle multipart form data
export const config = {
  api: {
    bodyParser: false,
  },
};