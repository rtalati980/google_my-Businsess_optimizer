/**
 * GET /api/descriptions/favorites - Get favorite descriptions
 * POST /api/descriptions/favorites - Add to favorites
 * DELETE /api/descriptions/favorites - Remove from favorites
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
} from '@/lib/db/description-generations';

async function getAuth(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  return token || null;
}

// GET /api/descriptions/favorites - Get user's favorite descriptions
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    if (limit < 1 || limit > 100) {
      return NextResponse.json({ error: 'Invalid limit' }, { status: 400 });
    }

    const favorites = await getUserFavorites(userId, limit, skip);

    return NextResponse.json(
      {
        success: true,
        data: favorites,
        pagination: {
          limit,
          skip,
          hasMore: favorites.length === limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }
}

// POST /api/descriptions/favorites - Add to favorites
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { descriptionId } = body;

    if (!descriptionId) {
      return NextResponse.json({ error: 'Description ID is required' }, { status: 400 });
    }

    const added = await addToFavorites(userId, descriptionId);

    if (!added) {
      return NextResponse.json({ error: 'Already in favorites' }, { status: 409 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json({ error: 'Failed to add to favorites' }, { status: 500 });
  }
}

// DELETE /api/descriptions/favorites - Remove from favorites
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { descriptionId } = body;

    if (!descriptionId) {
      return NextResponse.json({ error: 'Description ID is required' }, { status: 400 });
    }

    const removed = await removeFromFavorites(userId, descriptionId);

    if (!removed) {
      return NextResponse.json({ error: 'Not in favorites' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json({ error: 'Failed to remove from favorites' }, { status: 500 });
  }
}
