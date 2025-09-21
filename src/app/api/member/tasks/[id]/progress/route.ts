import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth-utils';
import { TaskModel } from '@/models/Task';
import { UserRole, TaskStatus } from '@/types';
import { createTaskUpdatedNotification } from '@/lib/notification-utils';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get user from token
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only allow members to update their tasks
    if (user.role !== UserRole.MEMBER) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only members can update task progress' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { progress, status } = body;

    // Validate input
    if (progress !== undefined && (progress < 0 || progress > 100)) {
      return NextResponse.json(
        { success: false, error: 'Progress must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Get the task to verify ownership
    const task = await TaskModel.findById(id);
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if user is assigned to this task
    if (task.assignedTo.toString() !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You can only update your own tasks' },
        { status: 403 }
      );
    }

    let updatedTask = null;

    // Update progress if provided
    if (progress !== undefined) {
      const success = await TaskModel.updateProgress(id, progress, user.id);
      if (!success) {
        return NextResponse.json(
          { success: false, error: 'Failed to update task progress' },
          { status: 500 }
        );
      }
    }

    // Update status if provided
    if (status !== undefined) {
      const success = await TaskModel.updateStatus(id, status as TaskStatus, user.id);
      if (!success) {
        return NextResponse.json(
          { success: false, error: 'Failed to update task status' },
          { status: 500 }
        );
      }
    }

    // Get updated task
    updatedTask = await TaskModel.findById(id);

    // Tạo notification cho team leader chỉ khi task hoàn thành (status = 'completed')
    try {
      if (status === 'completed') {
        await createTaskUpdatedNotification(
          id,
          task.title,
          'status',
          'completed',
          user.id,
          task.createdBy.toString()
        );
      }
    } catch (error) {
      console.warn('Failed to create task update notification:', error);
    }

    return NextResponse.json({
      success: true,
      data: updatedTask,
      message: 'Task updated successfully'
    });

  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}