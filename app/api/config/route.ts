import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Config from '@/models/Config';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const referrer = searchParams.get('ref');

    if (!referrer) {
      return NextResponse.json(
        { error: 'Referrer parameter is required' },
        { status: 400 }
      );
    }

    // Cari config berdasarkan referrer
    const config = await Config.findOne({ referrer: referrer.trim() });

    if (!config) {
      return NextResponse.json(
        { error: 'Config not found for this referrer' },
        { status: 404 }
      );
    }

    // Return config data untuk Android app
    return NextResponse.json({
      success: true,
      data: {
        referrer: config.referrer,
        icon_url: config.icon_url,
        homepage: config.homepage,
        ads: config.ads,
        updated_at: config.updated_at,
      },
    });
  } catch (error) {
    console.error('Get config error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}