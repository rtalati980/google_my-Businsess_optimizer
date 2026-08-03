import { NextRequest, NextResponse } from 'next/server';
import {
  getAllSubmissions,
  getSubmissionsAnalytics,
  getSubmissionsCount,
} from '@/lib/db/audit-submissions';

export async function GET(request: NextRequest) {
  try {
    // In production, add authentication here
    // Check for admin token or session
    const authHeader = request.headers.get('authorization');
    if (!authHeader && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = parseInt(searchParams.get('skip') || '0');

    // Build filter
    const filter = status && status !== 'all' ? { status } : {};

    // Fetch submissions
    const submissions = await getAllSubmissions(filter, limit, skip);

    // Format dates for JSON serialization
    const formattedSubmissions = submissions.map(sub => ({
      ...sub,
      _id: sub._id?.toString(),
      created_at: sub.created_at.toISOString(),
    }));

    // Fetch analytics
    const analytics = await getSubmissionsAnalytics();

    return NextResponse.json(
      {
        submissions: formattedSubmissions,
        analytics,
        pagination: {
          limit,
          skip,
          total: await getSubmissionsCount(filter),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
