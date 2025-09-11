import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/models/User';
import { TeamModel } from '@/models/Team';
import { ObjectId } from 'mongodb';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // First, check if user exists and is deleted (isActive: false)
    const user = await UserModel.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.isActive) {
      return NextResponse.json(
        { error: 'Cannot permanently delete an active user. Please delete the user first.' },
        { status: 400 }
      );
    }

    // Remove user from all teams before deleting
    await TeamModel.removeUserFromAllTeams(id);

    // Permanently delete the user from database
    const deleted = await UserModel.permanentDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'User permanently deleted successfully',
      deletedUserId: id
    });
  } catch (error) {
    console.error('Error permanently deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to permanently delete user' },
      { status: 500 }
    );
  }
}