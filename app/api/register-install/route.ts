import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Install from '@/models/Install';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { device_id, referrer } = body;

    // Validasi input
    if (!device_id || !referrer) {
      return NextResponse.json(
        { error: 'device_id and referrer are required' },
        { status: 400 }
      );
    }

    // Get additional info dari request
    const user_agent = request.headers.get('user-agent') || undefined;
    const ip_address = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      request.ip || 
                      undefined;

    // Cek apakah install sudah ada (prevent duplicate)
    const existingInstall = await Install.findOne({
      device_id: device_id.trim(),
      referrer: referrer.trim(),
    });

    if (existingInstall) {
      return NextResponse.json({
        success: true,
        message: 'Install already registered',
        data: {
          id: existingInstall._id,
          device_id: existingInstall.device_id,
          referrer: existingInstall.referrer,
          installed_at: existingInstall.installed_at,
        },
      });
    }

    // Buat install record baru
    const install = new Install({
      device_id: device_id.trim(),
      referrer: referrer.trim(),
      user_agent,
      ip_address,
      installed_at: new Date(),
    });

    await install.save();

    return NextResponse.json({
      success: true,
      message: 'Install registered successfully',
      data: {
        id: install._id,
        device_id: install.device_id,
        referrer: install.referrer,
        installed_at: install.installed_at,
      },
    });
  } catch (error) {
    console.error('Register install error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({
        success: true,
        message: 'Install already registered',
      });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}