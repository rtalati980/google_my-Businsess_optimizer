/**
 * GET /api/descriptions/history
 * Retrieve user's description generation history
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserDescriptionHistory, searchUserDescriptions, getUserDescriptionStats } from '@/lib/db/description-generations';

export async function GET(request: NextRequest) {
  try {
    // Get auth token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      );
    }

    const userId = token; // In production: decode JWT

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');
    const search = searchParams.get('search');

    // Validate parameters
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Get history or search
    let history;
    if (search) {
      history = await searchUserDescriptions(userId, search, limit);
    } else {
      history = await getUserDescriptionHistory(userId, limit, skip);
    }

    // Get stats
    const stats = await getUserDescriptionStats(userId);

    return NextResponse.json(
      {
        success: true,
        data: history,
        stats: {
          total: stats.total,
          favorites: stats.favorites,
          avgQualityScore: Math.round(stats.avgQualityScore),
          topCategories: stats.topCategories,
        },
        pagination: {
          limit,
          skip,
          hasMore: history.length === limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching history:', error);

    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
