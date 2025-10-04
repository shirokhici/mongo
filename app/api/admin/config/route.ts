import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Config from '@/models/Config';
import { requireAuth } from '@/lib/auth';

// GET - Mendapatkan semua configs
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { referrer: { $regex: search, $options: 'i' } },
        { homepage: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count
    const total = await Config.countDocuments(query);

    // Get configs dengan pagination
    const configs = await Config.find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: {
        configs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get configs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Membuat config baru
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

    await connectDB();

    const body = await request.json();
    const { referrer, icon_url, homepage, ads } = body;

    // Validasi input
    if (!referrer || !icon_url || !homepage) {
      return NextResponse.json(
        { error: 'referrer, icon_url, and homepage are required' },
        { status: 400 }
      );
    }

    // Cek apakah referrer sudah ada
    const existingConfig = await Config.findOne({ referrer: referrer.trim() });
    if (existingConfig) {
      return NextResponse.json(
        { error: 'Referrer already exists' },
        { status: 409 }
      );
    }

    // Buat config baru
    const config = new Config({
      referrer: referrer.trim(),
      icon_url: icon_url.trim(),
      homepage: homepage.trim(),
      ads: ads || [],
    });

    await config.save();

    return NextResponse.json({
      success: true,
      message: 'Config created successfully',
      data: config,
    }, { status: 201 });
  } catch (error) {
    console.error('Create config error:', error);
    
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