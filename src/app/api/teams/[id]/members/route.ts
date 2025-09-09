import { NextRequest, NextResponse } from 'next/server';
import { TeamModel } from '@/models/Team';
import { ObjectId } from 'mongodb';

interface Params {
  id: string;
}

// POST - Thêm thành viên vào team
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const { memberId } = await request.json();

    if (!ObjectId.isValid(id) || !ObjectId.isValid(memberId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid team or member ID' },
        { status: 400 }
      );
    }

    const success = await TeamModel.addMember(id, memberId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to add member to team' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Member added to team successfully'
    });
  } catch (error) {
    console.error('Error adding member to team:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add member to team' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa thành viên khỏi team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!ObjectId.isValid(id) || !memberId || !ObjectId.isValid(memberId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid team or member ID' },
        { status: 400 }
      );
    }

    const success = await TeamModel.removeMember(id, memberId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to remove member from team' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Member removed from team successfully'
    });
  } catch (error) {
    console.error('Error removing member from team:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove member from team' },
      { status: 500 }
    );
  }
}
