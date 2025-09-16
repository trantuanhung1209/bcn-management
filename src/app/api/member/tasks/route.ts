import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { TaskModel } from '@/models/Task';
import { UserModel } from '@/models/User';
import { ProjectModel } from '@/models/Project';
import { getUserFromToken } from '@/lib/server-utils';

export async function GET(request: NextRequest) {
  try {
    await clientPromise;

    // Get user from token
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    // Build filter
    const filter: any = { assignedTo: user._id };
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    // Fetch tasks using TaskModel.findByUser
    const tasks = await TaskModel.findByUser(user._id);

    // Apply additional filters if needed
    const filteredTasks = tasks.filter(task => {
      if (status && status !== 'all' && task.status !== status) return false;
      if (priority && priority !== 'all' && task.priority !== priority) return false;
      return true;
    });

    // Transform data for frontend
    const transformedTasks = await Promise.all(
      filteredTasks.map(async (task: any) => {
        // Get project name
        const project = await ProjectModel.findById(task.project);
        // Get assignedBy user name  
        const assignedByUser = await UserModel.findById(task.createdBy);
        
        return {
          _id: task._id.toString(),
          title: task.title,
          description: task.description,
          project: project?.name || 'Unknown Project',
          priority: task.priority,
          status: task.status,
          deadline: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null,
          progress: task.progress || 0,
          assignedBy: assignedByUser ? `${assignedByUser.firstName} ${assignedByUser.lastName}` : 'Unknown',
          createdAt: task.createdAt.toISOString().split('T')[0]
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: transformedTasks
    });

  } catch (error) {
    console.error('Member tasks fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}