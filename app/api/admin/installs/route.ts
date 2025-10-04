import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Install from '@/models/Install';
import { requireAuth } from '@/lib/auth';

// GET - Mendapatkan data installs
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const referrer = searchParams.get('referrer') || '';
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Build query
    const query: any = {};
    
    if (referrer) {
      query.referrer = { $regex: referrer, $options: 'i' };
    }

    if (startDate || endDate) {
      query.installed_at = {};
      if (startDate) {
        query.installed_at.$gte = new Date(startDate);
      }
      if (endDate) {
        query.installed_at.$lte = new Date(endDate);
      }
    }

    // Get total count
    const total = await Install.countDocuments(query);

    // Get installs dengan pagination
    const installs = await Install.find(query)
      .sort({ installed_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('device_id referrer installed_at user_agent ip_address');

    // Get statistics
    const stats = await Install.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$referrer',
          count: { $sum: 1 },
          latest_install: { $max: '$installed_at' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        installs,
        stats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get installs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus install data (optional, untuk maintenance)
export async function DELETE(request: NextRequest) {
  try {
    // Verifikasi authentication
    const authResult = requireAuth(request);
    if (!authResult.isValid || authResult.user?.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Super admin required' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { device_id, referrer, older_than_days } = body;

    let query: any = {};

    if (device_id) {
      query.device_id = device_id;
    }

    if (referrer) {
      query.referrer = referrer;
    }

    if (older_than_days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - older_than_days);
      query.installed_at = { $lt: cutoffDate };
    }

    if (Object.keys(query).length === 0) {
      return NextResponse.json(
        { error: 'At least one filter parameter is required' },
        { status: 400 }
      );
    }

    const result = await Install.deleteMany(query);

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} install records`,
      deleted_count: result.deletedCount,
    });
  } catch (error) {
    console.error('Delete installs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}