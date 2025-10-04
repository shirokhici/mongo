import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Config from '@/models/Config';
import { requireAuth } from '@/lib/auth';
import { deleteUploadedFile } from '@/utils/fileHandler';
import mongoose from 'mongoose';

// GET - Mendapatkan config berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verifikasi authentication
    const authResult = requireAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = params;

    // Validasi ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid config ID' },
        { status: 400 }
      );
    }

    const config = await Config.findById(id);

    if (!config) {
      return NextResponse.json(
        { error: 'Config not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Get config error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update config berdasarkan ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verifikasi authentication
    const authResult = requireAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = params;
    const body = await request.json();
    const { referrer, icon_url, homepage, ads } = body;

    // Validasi ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid config ID' },
        { status: 400 }
      );
    }

    // Validasi input
    if (!referrer || !icon_url || !homepage) {
      return NextResponse.json(
        { error: 'referrer, icon_url, and homepage are required' },
        { status: 400 }
      );
    }

    // Cek apakah config ada
    const existingConfig = await Config.findById(id);
    if (!existingConfig) {
      return NextResponse.json(
        { error: 'Config not found' },
        { status: 404 }
      );
    }

    // Cek apakah referrer sudah digunakan oleh config lain
    if (referrer.trim() !== existingConfig.referrer) {
      const duplicateConfig = await Config.findOne({ 
        referrer: referrer.trim(),
        _id: { $ne: id }
      });
      if (duplicateConfig) {
        return NextResponse.json(
          { error: 'Referrer already exists' },
          { status: 409 }
        );
      }
    }

    // Update config
    const updatedConfig = await Config.findByIdAndUpdate(
      id,
      {
        referrer: referrer.trim(),
        icon_url: icon_url.trim(),
        homepage: homepage.trim(),
        ads: ads || [],
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Config updated successfully',
      data: updatedConfig,
    });
  } catch (error) {
    console.error('Update config error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: 'Validation error', details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus config berdasarkan ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verifikasi authentication
    const authResult = requireAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = params;

    // Validasi ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid config ID' },
        { status: 400 }
      );
    }

    // Cek apakah config ada
    const config = await Config.findById(id);
    if (!config) {
      return NextResponse.json(
        { error: 'Config not found' },
        { status: 404 }
      );
    }

    // Hapus file yang terkait (optional - bisa dikomentari jika ingin keep files)
    try {
      if (config.icon_url) {
        await deleteUploadedFile(config.icon_url);
      }
      if (config.ads && config.ads.length > 0) {
        for (const adUrl of config.ads) {
          await deleteUploadedFile(adUrl);
        }
      }
    } catch (fileError) {
      console.warn('Failed to delete associated files:', fileError);
      // Continue with config deletion even if file deletion fails
    }

    // Hapus config dari database
    await Config.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Config deleted successfully',
    });
  } catch (error) {
    console.error('Delete config error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}