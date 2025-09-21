import { NextRequest, NextResponse } from 'next/server';
import { ProjectModel } from '@/models/Project';
import { UserModel } from '@/models/User';
import { getAuthenticatedUserId } from '@/lib/auth-middleware';
import { createProjectAcceptedNotification } from '@/lib/notification-utils';

// POST /api/projects/accept - Manager accepts assigned project
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserModel.findById(userId);
    if (!user || user.role !== 'manager') {
      return NextResponse.json({ 
        error: 'Forbidden: Only managers can accept projects' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: projectId'
      }, { status: 400 });
    }

    const success = await ProjectModel.acceptProject(projectId, userId);
    
    if (success) {
      // Tạo notification cho admin
      const project = await ProjectModel.findById(projectId);
      if (project) {
        await createProjectAcceptedNotification(
          projectId,
          project.name,
          userId.toString(),
          project.createdBy.toString()
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Project accepted successfully. You can now manage it.'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to accept project'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error accepting project:', error);
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 403 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to accept project'
    }, { status: 500 });
  }
}

// GET /api/projects/accept - Get pending projects for manager
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserModel.findById(userId);
    if (!user || user.role !== 'manager') {
      return NextResponse.json({ 
        error: 'Forbidden: Only managers can view pending projects' 
      }, { status: 403 });
    }

    const pendingProjects = await ProjectModel.getPendingProjects(userId);
    
    return NextResponse.json({
      success: true,
      data: pendingProjects
    });

  } catch (error) {
    console.error('Error fetching pending projects:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch pending projects'
    }, { status: 500 });
  }
}