import { NextRequest, NextResponse } from 'next/server';
import { TaskModel } from '@/models/Task';
import { UserModel } from '@/models/User';
import { getAuthenticatedUserId } from '@/lib/auth-middleware';

// PUT /api/tasks/[id]/progress - Member cập nhật progress
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only members can update progress
    if (user.role !== 'member') {
      return NextResponse.json({ 
        error: 'Forbidden: Only members can update task progress' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { progress } = body;

    if (progress === undefined || progress < 0 || progress > 100) {
      return NextResponse.json({
        success: false,
        error: 'Progress must be between 0 and 100'
      }, { status: 400 });
    }

    const success = await TaskModel.updateProgress(resolvedParams.id, progress, userId);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Task progress updated successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to update task progress'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error updating task progress:', error);
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 403 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update task progress'
    }, { status: 500 });
  }
}