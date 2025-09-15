import { NextRequest, NextResponse } from 'next/server';
import { ProjectModel } from '@/models/Project';
import { TeamModel } from '@/models/Team';
import { getAuthenticatedUserId } from '@/lib/auth-middleware';
import { ObjectId } from 'mongodb';
import { getProjectsCollection } from '@/lib/mongodb';

// PUT: Accept or reject project assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user ID from token/session
    const teamLeaderId = await getAuthenticatedUserId(request);
    
    if (!teamLeaderId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const projectId = params.id;
    const { action } = await request.json();

    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "accept" or "reject"' },
        { status: 400 }
      );
    }

    // Get project
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Verify team leader has permission
    const team = await TeamModel.findByLeader(teamLeaderId);
    if (!team || !team._id?.equals(project.team)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - You can only manage projects assigned to your team' },
        { status: 403 }
      );
    }

    // Update project based on action
    if (action === 'accept') {
      // First update with $set operations
      await getProjectsCollection().then(collection => 
        collection.updateOne(
          { _id: new ObjectId(projectId) },
          {
            $set: {
              isAssigned: true,
              acceptedAt: new Date(),
              assignedAt: new Date(),
              updatedAt: new Date()
            },
            $unset: { rejectedAt: 1 }
          }
        )
      );
    } else if (action === 'reject') {
      // First update with $set operations
      await getProjectsCollection().then(collection => 
        collection.updateOne(
          { _id: new ObjectId(projectId) },
          {
            $set: {
              isAssigned: false,
              rejectedAt: new Date(),
              updatedAt: new Date()
            },
            $unset: { acceptedAt: 1, assignedAt: 1 }
          }
        )
      );
    }

    const updatedProject = await ProjectModel.findById(projectId);

    return NextResponse.json({
      success: true,
      data: updatedProject,
      message: `Project ${action}ed successfully`
    });
  } catch (error) {
    console.error('Error updating project assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project assignment' },
      { status: 500 }
    );
  }
}