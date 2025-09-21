import { NextRequest, NextResponse } from 'next/server';
import { TaskModel } from '@/models/Task';
import { getAuthenticatedUserId } from '@/lib/auth-middleware';
import { UserModel } from '@/models/User';
import { ObjectId } from 'mongodb';
import { createCommentReplyNotification, createTaskCommentNotification } from '@/lib/notification-utils';

export async function POST(request: NextRequest) {
  try {

    // Check authentication
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Extract taskId from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const taskId = pathParts[pathParts.indexOf('tasks') + 1];
    const { content, parentCommentId } = await request.json();

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Comment content is required' },
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

    // Check if user has permission to comment on this task
    // For now, we'll allow team_leader, admin, and assigned member to comment
    if (user.role !== 'admin' && user.role !== 'team_leader') {
      if (task.assignedTo?.toString() !== userId) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized to comment on this task' },
          { status: 403 }
        );
      }
    }

    // Add comment or reply to task using TaskModel method
    let success: boolean;
    if (parentCommentId) {
      // This is a reply
      success = await TaskModel.addReply(taskId, parentCommentId, content.trim(), userId);
      
      // Send notification to parent comment author
      if (success) {
        try {
          // Get the parent comment to find its author
          const updatedTask = await TaskModel.findById(taskId);
          if (updatedTask) {
            const parentComment = updatedTask.comments.find((c: any) => c._id.toString() === parentCommentId);
            
            // Send notification to parent comment author if they are not the reply author
            if (parentComment && parentComment.author.toString() !== userId) {
              await createCommentReplyNotification(
                taskId,
                task.title,
                parentComment.author.toString(),
                userId,
                `${user.firstName} ${user.lastName}`,
                content.trim()
              );
            }
            
            // Send notification to assigned user if different from reply author and parent comment author
            if (task.assignedTo && 
                task.assignedTo.toString() !== userId && 
                (!parentComment || parentComment.author.toString() !== task.assignedTo.toString())) {
              await createTaskCommentNotification(
                taskId,
                task.title,
                task.assignedTo.toString(),
                userId,
                `${user.firstName} ${user.lastName}`,
                content.trim()
              );
            }
            
            // Send notification to task creator if different from reply author, parent comment author, and assigned user
            if (task.createdBy && 
                task.createdBy.toString() !== userId && 
                (!parentComment || parentComment.author.toString() !== task.createdBy.toString()) &&
                task.createdBy.toString() !== task.assignedTo?.toString()) {
              await createTaskCommentNotification(
                taskId,
                task.title,
                task.createdBy.toString(),
                userId,
                `${user.firstName} ${user.lastName}`,
                content.trim()
              );
            }
          }
        } catch (error) {
          console.error('Error sending reply notification:', error);
          // Don't fail the whole request if notification fails
        }
      }
    } else {
      // This is a top-level comment
      success = await TaskModel.addComment(taskId, content.trim(), userId);
      
      // Send notification to task creator and assigned member for new comment
      if (success) {
        try {
          // Send notification to task creator if they are not the comment author
          if (task.createdBy && task.createdBy.toString() !== userId) {
            await createTaskCommentNotification(
              taskId,
              task.title,
              task.createdBy.toString(),
              userId,
              `${user.firstName} ${user.lastName}`,
              content.trim()
            );
          }
          
          // Send notification to assigned member if they are not the comment author and different from creator
          if (task.assignedTo && 
              task.assignedTo.toString() !== userId && 
              task.assignedTo.toString() !== task.createdBy?.toString()) {
            await createTaskCommentNotification(
              taskId,
              task.title,
              task.assignedTo.toString(),
              userId,
              `${user.firstName} ${user.lastName}`,
              content.trim()
            );
          }
        } catch (error) {
          console.error('Error sending comment notification:', error);
          // Don't fail the whole request if notification fails
        }
      }
    }

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to add comment' },
        { status: 500 }
      );
    }

    // Return the new comment info
    const commentResponse = {
      id: new ObjectId().toString(), // Generate a new ID for response
      content: content.trim(),
      author: userId,
      authorName: `${user.firstName} ${user.lastName}`,
      authorAvatar: user.avatar || null,
      createdAt: new Date().toISOString(),
      type: 'comment',
      parentCommentId: parentCommentId || null
    };

    return NextResponse.json({
      success: true,
      data: commentResponse
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}