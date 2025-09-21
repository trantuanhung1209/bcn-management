import { NextRequest, NextResponse } from 'next/server';
import { TaskModel } from '@/models/Task';
import { getAuthenticatedUserId } from '@/lib/auth-middleware';
import { UserModel } from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = params.id;

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Get user info
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 });
    }

    // Get the task
    const task = await TaskModel.findById(taskId);
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to view this task's history
    // For now, we'll allow team_leader and admin to view all task history
    // Members can view history of tasks assigned to them
    if (user.role !== 'admin' && user.role !== 'team_leader') {
      if (task.assignedTo?.toString() !== userId) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized to view this task history' },
          { status: 403 }
        );
      }
    }

    // For now, we'll create a basic history from task information
    // since the Task interface doesn't have a history field yet
    const history: any[] = [];
    
    // Add creation history entry
    if (task.createdAt) {
      history.push({
        id: `created-${task.createdAt}`,
        action: 'created',
        actionBy: task.createdBy,
        actionByName: 'System', // We'll need to fetch user name later
        actionAt: task.createdAt,
        description: 'Task được tạo mới'
      });
    }

    // Add completed history entry if task is completed
    if (task.status === 'completed' && task.completedAt) {
      history.push({
        id: `completed-${task.completedAt}`,
        action: 'status_changed',
        actionBy: task.assignedTo,
        actionByName: 'System', // We'll need to fetch user name later
        actionAt: task.completedAt,
        oldValue: 'in_progress',
        newValue: 'completed',
        description: 'Task được hoàn thành'
      });
    }

    // Transform the history data for frontend
    const transformedHistory = history.map((item: any) => ({
      id: item.id,
      action: item.action,
      actionBy: item.actionBy,
      actionByName: item.actionByName,
      actionAt: item.actionAt,
      oldValue: item.oldValue,
      newValue: item.newValue,
      description: item.description
    }));

    // Sort by date descending (newest first)
    transformedHistory.sort((a: any, b: any) => new Date(b.actionAt).getTime() - new Date(a.actionAt).getTime());

    return NextResponse.json({
      success: true,
      data: transformedHistory
    });

  } catch (error) {
    console.error('Error fetching task history:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}