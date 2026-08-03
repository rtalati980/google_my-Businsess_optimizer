/**
 * GET /api/descriptions/[id] - Get a single description
 * DELETE /api/descriptions/[id] - Delete a description
 * PUT /api/descriptions/[id] - Update a description (for regeneration)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getDescriptionById,
  deleteDescription,
  updateDescription,
} from '@/lib/db/description-generations';

async function getAuth(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  return token || null;
}

// GET /api/descriptions/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const description = await getDescriptionById(id);

    if (!description) {
      return NextResponse.json({ error: 'Description not found' }, { status: 404 });
    }

    // Verify ownership
    if (description.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(
      { success: true, data: description },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching description:', error);
    return NextResponse.json({ error: 'Failed to fetch description' }, { status: 500 });
  }
}

// DELETE /api/descriptions/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership before deleting
    const description = await getDescriptionById(id);
    if (!description) {
      return NextResponse.json({ error: 'Description not found' }, { status: 404 });
    }

    if (description.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const deleted = await deleteDescription(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting description:', error);
    return NextResponse.json({ error: 'Failed to delete description' }, { status: 500 });
  }
}

// PUT /api/descriptions/[id] - Update description (for regeneration)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const description = await getDescriptionById(id);
    if (!description) {
      return NextResponse.json({ error: 'Description not found' }, { status: 404 });
    }

    if (description.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Only allow updating these fields
    const allowedUpdates = {
      longDescription: body.longDescription,
      mediumDescription: body.mediumDescription,
      shortDescription: body.shortDescription,
      extraLongDescription: body.extraLongDescription,
      seoTitle: body.seoTitle,
      qualityScore: body.qualityScore,
      qualityMetrics: body.qualityMetrics,
      regeneratedFromId: id, // Track that this is a regeneration
    };

    const updated = await updateDescription(id, allowedUpdates);

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    const updatedDescription = await getDescriptionById(id);

    return NextResponse.json(
      { success: true, data: updatedDescription },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating description:', error);
    return NextResponse.json({ error: 'Failed to update description' }, { status: 500 });
  }
}
