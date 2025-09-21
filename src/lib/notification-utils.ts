import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Notification, NotificationType } from '@/types';
import { TeamModel } from '@/models/Team';
import { UserModel } from '@/models/User';

export interface CreateNotificationData {
  title: string;
  message: string;
  type: NotificationType;
  recipient: ObjectId | string;
  sender?: ObjectId | string;
  targetType?: string;
  targetId?: ObjectId | string;
  actionUrl?: string;
  data?: Record<string, any>;
}

/**
 * Helper function để lấy team leader ID từ team ID
 */
export async function getTeamLeaderIdFromTeam(teamId: string | ObjectId): Promise<string | null> {
  try {
    const team = await TeamModel.findById(teamId);
    return team ? team.teamLeader.toString() : null;
  } catch (error) {
    console.error('Error getting team leader:', error);
    return null;
  }
}

/**
 * Tạo và lưu notification vào database
 */
export async function createNotification(notificationData: CreateNotificationData): Promise<boolean> {
  try {
    const db = await getDb();
    
    const notification: Notification = {
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      recipient: typeof notificationData.recipient === 'string' 
        ? new ObjectId(notificationData.recipient) 
        : notificationData.recipient,
      sender: notificationData.sender 
        ? (typeof notificationData.sender === 'string' 
          ? new ObjectId(notificationData.sender) 
          : notificationData.sender)
        : undefined,
      targetType: notificationData.targetType,
      targetId: notificationData.targetId 
        ? (typeof notificationData.targetId === 'string' 
          ? new ObjectId(notificationData.targetId) 
          : notificationData.targetId)
        : undefined,
      actionUrl: notificationData.actionUrl,
      data: notificationData.data,
      isRead: false,
      createdAt: new Date()
    };

    const result = await db.collection('notifications').insertOne(notification);
    return !!result.insertedId;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}

/**
 * Tạo notification khi admin giao project cho team leader
 */
export async function createProjectAssignedNotification(
  projectId: string,
  projectName: string,
  adminId: string,
  teamLeaderId: string
): Promise<boolean> {
  return await createNotification({
    title: 'Dự án mới được giao',
    message: `Bạn đã được giao dự án "${projectName}". Vui lòng kiểm tra và chấp nhận để bắt đầu làm việc.`,
    type: NotificationType.PROJECT_ASSIGNED,
    recipient: teamLeaderId,
    sender: adminId,
    targetType: 'project',
    targetId: projectId,
    actionUrl: `/team_leader/projects`,
    data: {
      projectId,
      projectName,
      action: 'assigned'
    }
  });
}

/**
 * Tạo notification khi team leader chấp nhận project
 */
export async function createProjectAcceptedNotification(
  projectId: string,
  projectName: string,
  teamLeaderId: string,
  adminId: string
): Promise<boolean> {
  return await createNotification({
    title: 'Dự án đã được chấp nhận',
    message: `Team leader đã chấp nhận dự án "${projectName}" và bắt đầu thực hiện.`,
    type: NotificationType.PROJECT_UPDATED,
    recipient: adminId,
    sender: teamLeaderId,
    targetType: 'project',
    targetId: projectId,
    actionUrl: `/admin/projects`,
    data: {
      projectId,
      projectName,
      action: 'accepted'
    }
  });
}

/**
 * Tạo notification khi team leader giao task cho member
 */
export async function createTaskAssignedNotification(
  taskId: string,
  taskTitle: string,
  projectName: string,
  teamLeaderId: string,
  memberId: string
): Promise<boolean> {
  return await createNotification({
    title: 'Task mới được giao',
    message: `Bạn đã được giao task "${taskTitle}" trong dự án "${projectName}". Vui lòng kiểm tra và bắt đầu thực hiện.`,
    type: NotificationType.TASK_ASSIGNED,
    recipient: memberId,
    sender: teamLeaderId,
    targetType: 'task',
    targetId: taskId,
    actionUrl: `/member/tasks/${taskId}`,
    data: {
      taskId,
      taskTitle,
      projectName,
      action: 'assigned'
    }
  });
}

/**
 * Tạo notification khi member cập nhật task
 */
export async function createTaskUpdatedNotification(
  taskId: string,
  taskTitle: string,
  updateType: string,
  newValue: any,
  memberId: string,
  teamLeaderId: string
): Promise<boolean> {
  let message = '';
  
  switch (updateType) {
    case 'progress':
      message = `Member đã cập nhật tiến độ task "${taskTitle}" thành ${newValue}%`;
      break;
    case 'status':
      message = `Member đã cập nhật trạng thái task "${taskTitle}" thành "${newValue}"`;
      break;
    case 'actualHours':
      message = `Member đã cập nhật số giờ thực hiện task "${taskTitle}" thành ${newValue} giờ`;
      break;
    default:
      message = `Member đã cập nhật task "${taskTitle}"`;
  }

  return await createNotification({
    title: 'Task được cập nhật',
    message,
    type: NotificationType.TASK_UPDATED,
    recipient: teamLeaderId,
    sender: memberId,
    targetType: 'task',
    targetId: taskId,
    actionUrl: `/team_leader/tasks/${taskId}`,
    data: {
      taskId,
      taskTitle,
      updateType,
      newValue,
      action: 'updated'
    }
  });
}

/**
 * Tạo notification nhắc nhở deadline
 */
export async function createDeadlineReminderNotification(
  targetId: string,
  targetType: 'task' | 'project',
  title: string,
  deadline: Date,
  recipientId: string
): Promise<boolean> {
  const daysLeft = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  // Get recipient user to determine correct actionUrl based on role
  let actionUrl = `/member/tasks/${targetId}`; // default for member
  
  if (targetType === 'task') {
    const recipient = await UserModel.findById(recipientId);
    if (recipient) {
      if (recipient.role === 'team_leader') {
        actionUrl = `/team_leader/tasks/${targetId}`;
      } else if (recipient.role === 'manager') {
        actionUrl = `/manager/tasks/${targetId}`;
      }
    }
  } else {
    actionUrl = `/team_leader/projects/${targetId}`;
  }
  
  return await createNotification({
    title: `Nhắc nhở deadline ${targetType}`,
    message: `${targetType === 'task' ? 'Task' : 'Dự án'} "${title}" sẽ hết hạn trong ${daysLeft} ngày (${deadline.toLocaleDateString('vi-VN')})`,
    type: NotificationType.DEADLINE_REMINDER,
    recipient: recipientId,
    targetType,
    targetId,
    actionUrl: actionUrl,
    data: {
      targetId,
      targetType,
      title,
      deadline: deadline.toISOString(),
      daysLeft
    }
  });
}

/**
 * Tạo notification cho announcement từ admin
 */
export async function createSystemAnnouncementNotification(
  title: string,
  message: string,
  recipientIds: string[]
): Promise<boolean> {
  try {
    const promises = recipientIds.map(recipientId => 
      createNotification({
        title,
        message,
        type: NotificationType.SYSTEM_ANNOUNCEMENT,
        recipient: recipientId,
        actionUrl: '/dashboard',
        data: {
          announcement: true
        }
      })
    );

    const results = await Promise.all(promises);
    return results.every(result => result);
  } catch (error) {
    console.error('Error creating system announcements:', error);
    return false;
  }
}

/**
 * Tạo notification khi admin tạo project mới và gán cho team
 */
export async function createProjectCreatedNotification(
  projectId: string,
  projectName: string,
  adminId: string,
  teamLeaderId: string
): Promise<boolean> {
  return await createNotification({
    title: 'Dự án mới được tạo',
    message: `Admin đã tạo dự án mới "${projectName}" và gán cho team của bạn. Vui lòng kiểm tra chi tiết dự án.`,
    type: NotificationType.PROJECT_ASSIGNED,
    recipient: teamLeaderId,
    sender: adminId,
    targetType: 'project',
    targetId: projectId,
    actionUrl: `/team_leader/projects`,
    data: {
      projectId,
      projectName,
      action: 'created_and_assigned'
    }
  });
}

/**
 * Tạo notification khi admin cập nhật project
 */
export async function createProjectUpdatedNotification(
  projectId: string,
  projectName: string,
  adminId: string,
  teamLeaderId: string,
  changes: string[]
): Promise<boolean> {
  const changesText = changes.length > 0 ? ` (Thay đổi: ${changes.join(', ')})` : '';
  
  return await createNotification({
    title: 'Dự án được cập nhật',
    message: `Admin đã cập nhật thông tin dự án "${projectName}"${changesText}. Vui lòng kiểm tra lại chi tiết dự án.`,
    type: NotificationType.PROJECT_UPDATED,
    recipient: teamLeaderId,
    sender: adminId,
    targetType: 'project',
    targetId: projectId,
    actionUrl: `/team_leader/projects`,
    data: {
      projectId,
      projectName,
      changes,
      action: 'updated_by_admin'
    }
  });
}

/**
 * Tạo notification khi admin xóa project
 */
export async function createProjectDeletedNotification(
  projectId: string,
  projectName: string,
  adminId: string,
  teamLeaderId: string
): Promise<boolean> {
  return await createNotification({
    title: 'Dự án đã bị xóa',
    message: `Admin đã xóa dự án "${projectName}". Tất cả thông tin và tasks liên quan đã được lưu trữ.`,
    type: NotificationType.SYSTEM_ANNOUNCEMENT,
    recipient: teamLeaderId,
    sender: adminId,
    targetType: 'project',
    targetId: projectId,
    actionUrl: '/team_leader/projects',
    data: {
      projectId,
      projectName,
      action: 'deleted_by_admin'
    }
  });
}

/**
 * Tạo notification khi có comment mới trong task
 */
export async function createTaskCommentNotification(
  taskId: string,
  taskTitle: string,
  assignedUserId: string,
  commentAuthorId: string,
  commentAuthorName: string,
  commentContent: string
): Promise<void> {
  // Không gửi notification cho chính mình
  if (assignedUserId === commentAuthorId) {
    return;
  }

  // Get assigned user to determine correct actionUrl based on role
  const assignedUser = await UserModel.findById(assignedUserId);
  let actionUrl = `/member/tasks/${taskId}`; // default for member
  
  if (assignedUser) {
    if (assignedUser.role === 'team_leader') {
      actionUrl = `/team_leader/tasks/${taskId}`;
    } else if (assignedUser.role === 'manager') {
      actionUrl = `/manager/tasks/${taskId}`;
    }
  }

  await createNotification({
    title: `${commentAuthorName} đã bình luận trong task của bạn`,
    message: `${commentAuthorName} đã bình luận trong task "${taskTitle}": "${commentContent.substring(0, 100)}${commentContent.length > 100 ? '...' : ''}"`,
    type: NotificationType.TASK_UPDATED,
    recipient: assignedUserId,
    sender: commentAuthorId,
    targetType: 'task',
    targetId: taskId,
    actionUrl: actionUrl,
    data: {
      taskId,
      taskTitle,
      action: 'task_comment',
      commentContent
    }
  });
}

/**
 * Tạo notification khi có reply comment
 */
export async function createCommentReplyNotification(
  taskId: string,
  taskTitle: string,
  parentCommentAuthorId: string,
  replyAuthorId: string,
  replyAuthorName: string,
  replyContent: string
): Promise<void> {
  // Không gửi notification cho chính mình
  if (parentCommentAuthorId === replyAuthorId) {
    return;
  }

  // Get parent comment author to determine correct actionUrl based on role
  const parentCommentAuthor = await UserModel.findById(parentCommentAuthorId);
  let actionUrl = `/member/tasks/${taskId}`; // default for member
  
  if (parentCommentAuthor) {
    if (parentCommentAuthor.role === 'team_leader') {
      actionUrl = `/team_leader/tasks/${taskId}`;
    } else if (parentCommentAuthor.role === 'manager') {
      actionUrl = `/manager/tasks/${taskId}`;
    }
  }

  await createNotification({
    title: `${replyAuthorName} đã trả lời bình luận của bạn`,
    message: `${replyAuthorName} đã trả lời bình luận của bạn trong task "${taskTitle}": "${replyContent.substring(0, 100)}${replyContent.length > 100 ? '...' : ''}"`,
    type: NotificationType.TASK_UPDATED,
    recipient: parentCommentAuthorId,
    sender: replyAuthorId,
    targetType: 'task',
    targetId: taskId,
    actionUrl: actionUrl,
    data: {
      taskId,
      taskTitle,
      action: 'comment_reply',
      replyContent
    }
  });
}

/**
 * Tạo notification khi được mention trong comment
 */
export async function createCommentMentionNotification(
  taskId: string,
  taskTitle: string,
  mentionedUserId: string,
  authorId: string,
  authorName: string,
  commentContent: string
): Promise<void> {
  // Không gửi notification cho chính mình
  if (mentionedUserId === authorId) {
    return;
  }

  await createNotification({
    title: `${authorName} đã nhắc đến bạn`,
    message: `${authorName} đã nhắc đến bạn trong task "${taskTitle}": "${commentContent.substring(0, 100)}${commentContent.length > 100 ? '...' : ''}"`,
    type: NotificationType.TASK_UPDATED,
    recipient: mentionedUserId,
    sender: authorId,
    targetType: 'task',
    targetId: taskId,
    actionUrl: `/team_leader/tasks/${taskId}`,
    data: {
      taskId,
      taskTitle,
      action: 'comment_mention',
      commentContent
    }
  });
}