import { ObjectId } from 'mongodb';
import { NotificationType } from '@/types';

export interface NotificationModel {
  _id?: ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  recipient: ObjectId;
  sender?: ObjectId;
  isRead: boolean;
  data?: Record<string, any>;
  targetType?: string;
  targetId?: ObjectId;
  actionUrl?: string;
  createdAt: Date;
  readAt?: Date;
}

export class NotificationHelper {
  static createTaskAssignedNotification(
    recipient: ObjectId,
    sender: ObjectId,
    taskTitle: string,
    taskId: ObjectId
  ): NotificationModel {
    return {
      title: 'New Task Assigned',
      message: `You have been assigned a new task: ${taskTitle}`,
      type: NotificationType.TASK_ASSIGNED,
      recipient,
      sender,
      isRead: false,
      targetType: 'task',
      targetId: taskId,
      actionUrl: `/tasks/${taskId}`,
      createdAt: new Date()
    };
  }

  static createProjectAssignedNotification(
    recipient: ObjectId,
    sender: ObjectId,
    projectName: string,
    projectId: ObjectId
  ): NotificationModel {
    return {
      title: 'New Project Assigned',
      message: `Your team has been assigned a new project: ${projectName}`,
      type: NotificationType.PROJECT_ASSIGNED,
      recipient,
      sender,
      isRead: false,
      targetType: 'project',
      targetId: projectId,
      actionUrl: `/projects/${projectId}`,
      createdAt: new Date()
    };
  }

  static createDeadlineReminderNotification(
    recipient: ObjectId,
    taskTitle: string,
    taskId: ObjectId,
    dueDate: Date
  ): NotificationModel {
    const daysLeft = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return {
      title: 'Deadline Reminder',
      message: `Task "${taskTitle}" is due in ${daysLeft} day(s)`,
      type: NotificationType.DEADLINE_REMINDER,
      recipient,
      isRead: false,
      targetType: 'task',
      targetId: taskId,
      actionUrl: `/tasks/${taskId}`,
      data: { daysLeft, dueDate },
      createdAt: new Date()
    };
  }

  static createSystemAnnouncementNotification(
    recipient: ObjectId,
    title: string,
    message: string
  ): NotificationModel {
    return {
      title,
      message,
      type: NotificationType.SYSTEM_ANNOUNCEMENT,
      recipient,
      isRead: false,
      createdAt: new Date()
    };
  }
}