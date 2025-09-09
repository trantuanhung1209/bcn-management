import { NextRequest, NextResponse } from 'next/server';
import { TeamModel } from '@/models/Team';
import { ObjectId } from 'mongodb';

interface Params {
  id: string;
}

// GET - Lấy team theo ID
export async function GET(
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

    const team = await TeamModel.findById(id);

    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật team
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid team ID' },
        { status: 400 }
      );
    }

    // Check if team exists
    const existingTeam = await TeamModel.findById(id);
    if (!existingTeam) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if name already exists (exclude current team)
    if (body.name && body.name !== existingTeam.name) {
      const teamWithSameName = await TeamModel.findByName(body.name);
      if (teamWithSameName) {
        return NextResponse.json(
          { success: false, error: 'Team name already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.description) updateData.description = body.description;
    if (body.teamLeader) updateData.teamLeader = new ObjectId(body.teamLeader);
    if (body.members) updateData.members = body.members.map((id: string) => new ObjectId(id));
    if (body.projects) updateData.projects = body.projects.map((id: string) => new ObjectId(id));
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const updatedTeam = await TeamModel.update(id, updateData);

    return NextResponse.json({
      success: true,
      data: updatedTeam,
      message: 'Team updated successfully'
    });
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update team' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa team (soft delete)
export async function DELETE(
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

    const success = await TeamModel.delete(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete team' },
      { status: 500 }
    );
  }
}
