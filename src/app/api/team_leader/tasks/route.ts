import { NextRequest, NextResponse } from 'next/server';
import { getTasksCollection } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { ProjectModel } from '@/models/Project';
import { getAuthenticatedUserId } from '@/lib/auth-middleware';
import { ObjectId } from 'mongodb';
import { TaskStatus, TaskPriority } from '@/types';
import { createTaskAssignedNotification } from '@/lib/notification-utils';

// POST /api/team_leader/tasks - Create new task (Team Leader only)
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

    // Only team leaders can create tasks
    if (user.role !== 'team_leader') {
      return NextResponse.json({ 
        error: 'Forbidden: Only team leaders can create tasks' 
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
    if (!title || !project) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title, project'
      }, { status: 400 });
    }

    // Create task data with null ObjectId for unassigned tasks
    const nullObjectId = new ObjectId('000000000000000000000000');
    
    // Validate ObjectId format if assignedTo is provided
    let validAssignedTo = nullObjectId;
    if (assignedTo && assignedTo.trim() !== '') {
      const trimmedAssignedTo = assignedTo.trim();
      // Check if it's a valid ObjectId format (24 hex characters)
      if (/^[0-9a-fA-F]{24}$/.test(trimmedAssignedTo)) {
        validAssignedTo = new ObjectId(trimmedAssignedTo);
      } else {
        return NextResponse.json({
          success: false,
          error: 'Invalid assignedTo format'
        }, { status: 400 });
      }
    }
    
    const taskData = {
      title,
      description: description || '',
      status: 'todo' as TaskStatus,
      priority: (priority as TaskPriority) || 'medium',
      project: new ObjectId(project),
      assignedTo: validAssignedTo,
      createdBy: new ObjectId(userId),
      estimatedHours: estimatedHours || undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      progress: 0,
      tags: tags || [],
      comments: [],
      attachments: [],
      dependencies: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const collection = await getTasksCollection();
    const result = await collection.insertOne(taskData);
    
    const task = await collection.findOne({ _id: result.insertedId });

    if (!task) {
      throw new Error("Failed to create task");
    }

    // Update project progress when new task is added
    try {
      await ProjectModel.updateProgress(task.project);
    } catch (error) {
      console.warn('Failed to update project progress:', error);
    }

    // Log activity
    try {
      await UserModel.logActivity(task.createdBy, 'create', 'task', task._id!, {
        title: task.title,
        assignedTo: assignedTo ? assignedTo : 'unassigned',
        project: task.project.toString()
      });
    } catch (error) {
      console.warn('Failed to log activity:', error);
    }

    // Tạo notification cho member được giao task (chỉ khi task được gán cho ai đó)
    if (assignedTo && assignedTo.trim() !== '' && validAssignedTo && !validAssignedTo.equals(new ObjectId('000000000000000000000000'))) {
      try {
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
      } catch (error) {
        console.warn('Failed to create task notification:', error);
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