import { NextRequest, NextResponse } from 'next/server';
import { ProjectModel } from '@/models/Project';
import { ObjectId } from 'mongodb';

// GET: Get project by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const project = await ProjectModel.findById(id);
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT: Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // Helper function to handle team ID mapping (same as in POST)
    const getTeamObjectId = (teamId: string) => {
      const teamMapping: { [key: string]: string } = {
        '1': '507f1f77bcf86cd799439011', // Example ObjectId for Team Web
        '2': '507f1f77bcf86cd799439012', // Example ObjectId for Team App
      };
      
      const mappedId = teamMapping[teamId];
      if (mappedId) {
        return new ObjectId(mappedId);
      }
      
      if (ObjectId.isValid(teamId)) {
        return new ObjectId(teamId);
      }
      
      return new ObjectId();
    };

    // Convert string IDs to ObjectIds if present
    const updateData = { ...data };
    if (updateData.team) updateData.team = getTeamObjectId(updateData.team);
    if (updateData.assignedTo) {
      updateData.assignedTo = updateData.assignedTo.map((userId: string) => 
        ObjectId.isValid(userId) ? new ObjectId(userId) : new ObjectId()
      );
    }
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
    if (updateData.deadline) updateData.deadline = new Date(updateData.deadline);

    const project = await ProjectModel.update(id, updateData);
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE: Delete project (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const success = await ProjectModel.delete(id);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}