import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getTasksCollection } from '@/lib/mongodb';
import { getAuthenticatedUserId } from '@/lib/auth-middleware';

interface TaskHistory {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo?: string;
  assignedToName?: string;
  dueDate?: string;
  estimatedHours?: number;
  project: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  isActive: boolean;
  action: 'created' | 'updated' | 'deleted';
  actionBy: string;
  actionByName: string;
  actionAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project');

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'Project ID is required' }, { status: 400 });
    }

    // Validate project ObjectId
    if (!ObjectId.isValid(projectId)) {
      return NextResponse.json({ success: false, error: 'Invalid project ID' }, { status: 400 });
    }

    const tasksCollection = await getTasksCollection();

    // Get all tasks for this project (including deleted ones) with user information
    const taskHistory = await tasksCollection.aggregate([
      {
        $match: { 
          project: new ObjectId(projectId)
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'assignedUser'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdByUser'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'updatedBy',
          foreignField: '_id',
          as: 'updatedByUser'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'deletedBy',
          foreignField: '_id',
          as: 'deletedByUser'
        }
      },
      {
        $addFields: {
          assignedToName: {
            $cond: {
              if: { $gt: [{ $size: '$assignedUser' }, 0] },
              then: { 
                $concat: [
                  { $arrayElemAt: ['$assignedUser.firstName', 0] },
                  ' ',
                  { $arrayElemAt: ['$assignedUser.lastName', 0] }
                ]
              },
              else: 'Chưa gán'
            }
          },
          createdByName: {
            $cond: {
              if: { $gt: [{ $size: '$createdByUser' }, 0] },
              then: { 
                $concat: [
                  { $arrayElemAt: ['$createdByUser.firstName', 0] },
                  ' ',
                  { $arrayElemAt: ['$createdByUser.lastName', 0] }
                ]
              },
              else: 'Unknown'
            }
          },
          updatedByName: {
            $cond: {
              if: { $gt: [{ $size: '$updatedByUser' }, 0] },
              then: { 
                $concat: [
                  { $arrayElemAt: ['$updatedByUser.firstName', 0] },
                  ' ',
                  { $arrayElemAt: ['$updatedByUser.lastName', 0] }
                ]
              },
              else: 'Unknown'
            }
          },
          deletedByName: {
            $cond: {
              if: { $gt: [{ $size: '$deletedByUser' }, 0] },
              then: { 
                $concat: [
                  { $arrayElemAt: ['$deletedByUser.firstName', 0] },
                  ' ',
                  { $arrayElemAt: ['$deletedByUser.lastName', 0] }
                ]
              },
              else: 'Unknown'
            }
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]).toArray();

    // Transform data to include history events
    const historyEvents: TaskHistory[] = [];

    for (const task of taskHistory) {
      // Created event
      historyEvents.push({
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo?.toString(),
        assignedToName: task.assignedToName,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : undefined,
        estimatedHours: task.estimatedHours,
        project: task.project.toString(),
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        deletedAt: task.deletedAt,
        isActive: task.isActive,
        action: 'created',
        actionBy: task.createdBy?.toString() || '',
        actionByName: task.createdByName || 'Unknown',
        actionAt: task.createdAt
      });

      // Updated event (if different from created)
      if (task.updatedAt && task.updatedAt !== task.createdAt) {
        historyEvents.push({
          id: task._id.toString(),
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assignedTo: task.assignedTo?.toString(),
          assignedToName: task.assignedToName,
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : undefined,
          estimatedHours: task.estimatedHours,
          project: task.project.toString(),
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          deletedAt: task.deletedAt,
          isActive: task.isActive,
          action: 'updated',
          actionBy: task.updatedBy?.toString() || task.createdBy?.toString() || '',
          actionByName: task.updatedByName || task.createdByName || 'Unknown',
          actionAt: task.updatedAt
        });
      }

      // Deleted event (if task is deleted)
      if (!task.isActive && task.deletedAt) {
        historyEvents.push({
          id: task._id.toString(),
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assignedTo: task.assignedTo?.toString(),
          assignedToName: task.assignedToName,
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : undefined,
          estimatedHours: task.estimatedHours,
          project: task.project.toString(),
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          deletedAt: task.deletedAt,
          isActive: task.isActive,
          action: 'deleted',
          actionBy: task.deletedBy?.toString() || '',
          actionByName: task.deletedByName || 'Unknown',
          actionAt: task.deletedAt
        });
      }
    }

    // Sort all events by actionAt (most recent first)
    historyEvents.sort((a, b) => new Date(b.actionAt).getTime() - new Date(a.actionAt).getTime());

    return NextResponse.json({
      success: true,
      data: {
        history: historyEvents,
        total: historyEvents.length
      }
    });

  } catch (error) {
    console.error('Error fetching task history:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}