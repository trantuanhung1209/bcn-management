import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getProjectsCollection, getTasksCollection } from '@/lib/mongodb';
import { getAuthenticatedUserId } from '@/lib/auth-middleware';
import { UserModel } from '@/models/User';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    // Validate project ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid project ID' 
      }, { status: 400 });
    }

    // Get user info to check permissions
    const user = await UserModel.findById(userId);
    if (!user || user.role !== 'team_leader') {
      return NextResponse.json({ 
        success: false, 
        error: 'Only team leaders can delete projects' 
      }, { status: 403 });
    }

    const projectsCollection = await getProjectsCollection();
    const tasksCollection = await getTasksCollection();

    // Find the project first
    const project = await projectsCollection.findOne({ 
      _id: new ObjectId(id) 
    });

    if (!project) {
      return NextResponse.json({ 
        success: false, 
        error: 'Project not found' 
      }, { status: 404 });
    }

    // Check if project was rejected - only allow deletion of rejected projects
    if (!(project as any).rejectedAt) {
      return NextResponse.json({ 
        success: false, 
        error: 'Only rejected projects can be permanently deleted' 
      }, { status: 400 });
    }

    // Check if user is the team leader of the project's team
    // We need to verify the user's team membership
    const { getTeamsCollection } = await import('@/lib/mongodb');
    const teamCollection = await getTeamsCollection();
    const userTeam = await teamCollection.findOne({
      $or: [
        { teamLeader: new ObjectId(userId) },
        { members: new ObjectId(userId) }
      ]
    });

    if (!userTeam || !project.team.equals(userTeam._id)) {
      return NextResponse.json({ 
        success: false, 
        error: 'You can only delete projects from your team' 
      }, { status: 403 });
    }

    // First, permanently delete all tasks associated with this project
    const deleteTasksResult = await tasksCollection.deleteMany({
      project: new ObjectId(id)
    });

    // Then permanently delete the project itself
    const deleteProjectResult = await projectsCollection.deleteOne({
      _id: new ObjectId(id)
    });

    if (deleteProjectResult.deletedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to delete project' 
      }, { status: 500 });
    }

    // Log the permanent deletion activity
    await UserModel.logActivity(
      new ObjectId(userId), 
      'permanent_delete', 
      'project', 
      new ObjectId(id), 
      {
        projectName: project.name,
        tasksDeleted: deleteTasksResult.deletedCount,
        reason: 'Rejected project permanently deleted'
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Project permanently deleted from database',
      data: {
        projectId: id,
        projectName: project.name,
        tasksDeleted: deleteTasksResult.deletedCount
      }
    });

  } catch (error) {
    console.error('Error permanently deleting project:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to permanently delete project'
    }, { status: 500 });
  }
}