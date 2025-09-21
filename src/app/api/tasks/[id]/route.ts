import { NextRequest, NextResponse } from 'next/server';
import { TaskModel } from '@/models/Task';
import { UserModel } from '@/models/User';
import { ProjectModel } from '@/models/Project';
import { getAuthenticatedUserId } from '@/lib/auth-middleware';
import { createTaskUpdatedNotification } from '@/lib/notification-utils';

// GET /api/tasks/[id] - Get task by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const task = await TaskModel.findById(id);
    if (!task) {
      return NextResponse.json({ 
        success: false, 
        error: 'Task not found' 
      }, { status: 404 });
    }

    // Check permissions
    if (user.role === 'member' && !task.assignedTo.equals(user._id!)) {
      return NextResponse.json({ 
        error: 'Forbidden: You can only view your own tasks' 
      }, { status: 403 });
    }

    // Populate comment authors and other user info
    const populatedTask: any = { ...task };
    
    // Populate project info
    if (task.project) {
      const project = await ProjectModel.findById(task.project);
      if (project) {
        populatedTask.projectName = project.name;
      }
    }
    
    // Populate assigned user info
    if (task.assignedTo) {
      const assignedUser = await UserModel.findById(task.assignedTo);
      if (assignedUser) {
        populatedTask.assignedToName = `${assignedUser.firstName} ${assignedUser.lastName}`;
        populatedTask.assignedToEmail = assignedUser.email;
        populatedTask.assignedToRole = assignedUser.role;
      }
    }

    // Populate created by user info
    if (task.createdBy) {
      const createdByUser = await UserModel.findById(task.createdBy);
      if (createdByUser) {
        populatedTask.createdByName = `${createdByUser.firstName} ${createdByUser.lastName}`;
      }
    }

    // Populate comment authors
    if (task.comments && task.comments.length > 0) {
      const populatedComments = await Promise.all(
        task.comments.map(async (comment: any) => {
          const populatedComment: any = {
            ...comment,
            id: comment._id?.toString() || comment.id,
            type: 'comment' // default type
          };
          
          if (comment.author) {
            const author = await UserModel.findById(comment.author);
            populatedComment.authorName = author ? `${author.firstName} ${author.lastName}` : 'Unknown User';
            populatedComment.authorEmail = author?.email || '';
            populatedComment.authorAvatar = author?.avatar || null;
          } else {
            populatedComment.authorName = 'Unknown User';
            populatedComment.authorAvatar = null;
          }

          // Populate replies if they exist
          if (comment.replies && comment.replies.length > 0) {
            const populatedReplies = await Promise.all(
              comment.replies.map(async (reply: any) => {
                const populatedReply: any = {
                  ...reply,
                  id: reply._id?.toString() || reply.id,
                  type: 'comment'
                };
                
                if (reply.author) {
                  const replyAuthor = await UserModel.findById(reply.author);
                  populatedReply.authorName = replyAuthor ? `${replyAuthor.firstName} ${replyAuthor.lastName}` : 'Unknown User';
                  populatedReply.authorEmail = replyAuthor?.email || '';
                  populatedReply.authorAvatar = replyAuthor?.avatar || null;
                } else {
                  populatedReply.authorName = 'Unknown User';
                  populatedReply.authorAvatar = null;
                }
                
                return populatedReply;
              })
            );
            populatedComment.replies = populatedReplies;
          }
          
          return populatedComment;
        })
      );
      populatedTask.comments = populatedComments;
    }

    return NextResponse.json({
      success: true,
      data: populatedTask
    });

  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch task'
    }, { status: 500 });
  }
}

// PUT /api/tasks/[id] - Update task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const task = await TaskModel.findById(id);
    if (!task) {
      return NextResponse.json({ 
        success: false, 
        error: 'Task not found' 
      }, { status: 404 });
    }

    const body = await request.json();
    
    // Check permissions based on what's being updated
    if (user.role === 'member') {
      // Members can only update their own tasks and only certain fields
      if (!task.assignedTo.equals(user._id!)) {
        return NextResponse.json({ 
          error: 'Forbidden: You can only update your own tasks' 
        }, { status: 403 });
      }
      
      // Members can only update progress, status, and add comments
      const allowedFields = ['progress', 'status', 'actualHours'];
      const updateData: any = {};
      
      allowedFields.forEach(field => {
        if (body[field] !== undefined) {
          updateData[field] = body[field];
        }
      });
      
      const updatedTask = await TaskModel.update(id, updateData);
      
      // Chỉ tạo notification khi task được hoàn thành (status = 'completed')
      if (updatedTask && body.status === 'completed') {
        await createTaskUpdatedNotification(
          id,
          task.title,
          'status',
          'completed',
          userId.toString(),
          task.createdBy.toString()
        );
      }
      
      return NextResponse.json({
        success: true,
        data: updatedTask,
        message: 'Task updated successfully'
      });
      
    } else if (user.role === 'manager' || user.role === 'admin' || user.role === 'team_leader') {
      // Managers, team leaders, and admins can update tasks they created or admin can update all
      if ((user.role === 'manager' || user.role === 'team_leader') && !task.createdBy.equals(user._id!)) {
        return NextResponse.json({ 
          error: 'Forbidden: You can only update tasks you created' 
        }, { status: 403 });
      }
      
      const updatedTask = await TaskModel.update(id, body);
      
      return NextResponse.json({
        success: true,
        data: updatedTask,
        message: 'Task updated successfully'
      });
    }

    return NextResponse.json({ 
      error: 'Forbidden' 
    }, { status: 403 });

  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update task'
    }, { status: 500 });
  }
}

// DELETE /api/tasks/[id] - Delete task (Manager/Admin/Team Leader only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only managers, team leaders, and admins can delete tasks
    if (user.role !== 'manager' && user.role !== 'admin' && user.role !== 'team_leader') {
      return NextResponse.json({ 
        error: 'Forbidden: Only managers and team leaders can delete tasks' 
      }, { status: 403 });
    }

    const task = await TaskModel.findById(id);
    if (!task) {
      return NextResponse.json({ 
        success: false, 
        error: 'Task not found' 
      }, { status: 404 });
    }

    // Managers and team leaders can only delete tasks they created
    if ((user.role === 'manager' || user.role === 'team_leader') && !task.createdBy.equals(user._id!)) {
      return NextResponse.json({ 
        error: 'Forbidden: You can only delete tasks you created' 
      }, { status: 403 });
    }

    // Check if we should permanently delete or soft delete
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    let success: boolean;
    
    if (permanent) {
      // Permanently delete from database
      success = await TaskModel.permanentDelete(id);
    } else {
      // Soft delete (set isActive to false)
      success = await TaskModel.delete(id, user._id);
    }
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: permanent ? 'Task permanently deleted' : 'Task deleted successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to delete task'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete task'
    }, { status: 500 });
  }
}