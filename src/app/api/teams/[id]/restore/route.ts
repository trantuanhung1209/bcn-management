import { NextRequest, NextResponse } from 'next/server';
import { TeamModel } from '@/models/Team';
import { ObjectId } from 'mongodb';

interface Params {
  id: string;
}

// PUT - Khôi phục team đã bị xóa (soft delete)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid team ID' },
        { status: 400 }
      );
    }

    const success = await TeamModel.restore(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Team not found or already active' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Team restored successfully'
    });
  } catch (error) {
    console.error('Error restoring team:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to restore team' },
      { status: 500 }
    );
  }
}
