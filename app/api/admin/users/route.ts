import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';
import { requireAuth, hashPassword } from '@/lib/auth';

// GET - Mendapatkan daftar admin users
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

    const admins = await Admin.find({})
      .select('username role created_at updated_at')
      .sort({ created_at: -1 });

    return NextResponse.json({
      success: true,
      data: admins,
    });
  } catch (error) {
    console.error('Get admins error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Membuat admin user baru (hanya super_admin)
export async function POST(request: NextRequest) {
  try {
    // Verifikasi authentication dan role
    const authResult = requireAuth(request);
    if (!authResult.isValid || authResult.user?.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Super admin required' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { username, password, role } = body;

    // Validasi input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Cek apakah username sudah ada
    const existingAdmin = await Admin.findOne({ username: username.toLowerCase().trim() });
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Buat admin baru
    const admin = new Admin({
      username: username.toLowerCase().trim(),
      password_hash,
      role: role || 'admin',
    });

    await admin.save();

    // Return admin data tanpa password hash
    const adminData = {
      id: admin._id,
      username: admin.username,
      role: admin.role,
      created_at: admin.created_at,
    };

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      data: adminData,
    }, { status: 201 });
  } catch (error) {
    console.error('Create admin error:', error);
    
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