import { NextRequest, NextResponse } from 'next/server';
import { TaskModel } from '@/models/Task';
import { UserModel } from '@/models/User';
import { getAuthenticatedUserId } from '@/lib/auth-middleware';

// PUT /api/tasks/[id]/status - Member cập nhật status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only members can update status
    if (user.role !== 'member') {
      return NextResponse.json({ 
        error: 'Forbidden: Only members can update task status' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['todo', 'in_progress', 'review', 'done'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid status. Must be one of: todo, in_progress, review, done'
      }, { status: 400 });
    }

    const success = await TaskModel.updateStatus(params.id, status, userId);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Task status updated successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to update task status'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error updating task status:', error);
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 403 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update task status'
    }, { status: 500 });
  }
}