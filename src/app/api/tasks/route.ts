import { NextRequest, NextResponse } from 'next/server';
import { TaskModel } from '@/models/Task';
import { UserModel } from '@/models/User';
import { getAuthenticatedUserId } from '@/lib/auth-middleware';
import { ObjectId } from 'mongodb';
import { TaskStatus, TaskPriority } from '@/types';
import { createTaskAssignedNotification } from '@/lib/notification-utils';
import { ProjectModel } from '@/models/Project';

// GET /api/tasks - Get tasks with filters
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user to check role
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const filters: any = {};

    // Extract query parameters
    if (searchParams.get('project')) filters.project = searchParams.get('project');
    if (searchParams.get('status')) filters.status = searchParams.get('status');
    if (searchParams.get('priority')) filters.priority = searchParams.get('priority');
    if (searchParams.get('search')) filters.search = searchParams.get('search');
    if (searchParams.get('page')) filters.page = parseInt(searchParams.get('page')!);
    if (searchParams.get('limit')) filters.limit = parseInt(searchParams.get('limit')!);

    // Role-based filtering
    if (user.role === 'member') {
      // Members can only see their own tasks
      filters.assignedTo = userId;
    } else if (user.role === 'manager') {
      // Managers can see tasks they created or in their team projects
      if (!searchParams.get('assignedTo') && !searchParams.get('project')) {
        filters.createdBy = userId;
      }
    } else if (user.role === 'team_leader') {
      // Team leaders can see tasks in projects assigned to their team
      // If no specific filters, they can see tasks they created or in their team projects
      if (!searchParams.get('assignedTo') && !searchParams.get('project')) {
        filters.createdBy = userId;
      }
    }
    // Admins can see all tasks without additional filters

    const result = await TaskModel.findAll(filters);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch tasks'
    }, { status: 500 });
  }
}

// POST /api/tasks - Create new task (Manager only)
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user to check role
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only managers and admins can create tasks
    if (user.role !== 'manager' && user.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Forbidden: Only managers can create tasks' 
      }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      priority,
      project,
      assignedTo,
      dueDate,
      estimatedHours,
      tags
    } = body;

    // Validate required fields
    if (!title || !project || !assignedTo) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title, project, assignedTo'
      }, { status: 400 });
    }

    const taskData = {
      title,
      description: description || '',
      status: 'todo' as TaskStatus,
      priority: (priority as TaskPriority) || 'medium',
      project: new ObjectId(project),
      assignedTo: new ObjectId(assignedTo),
      createdBy: new ObjectId(userId),
      estimatedHours: estimatedHours || undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      progress: 0,
      tags: tags || [],
      comments: [],
      attachments: [],
      dependencies: [],
      isActive: true
    };

    const task = await TaskModel.create(taskData);

    if (task) {
      // Tạo notification cho member được giao task
      const projectData = await ProjectModel.findById(project);
      if (projectData) {
        await createTaskAssignedNotification(
          task._id!.toString(),
          task.title,
          projectData.name,
          userId.toString(),
          assignedTo
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: task,
      message: 'Task created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create task'
    }, { status: 500 });
  }
}