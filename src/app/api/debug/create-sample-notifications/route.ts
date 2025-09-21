import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NotificationType } from '@/types';

export async function POST() {
  try {
    const db = await getDb();
    
    // Sample notifications
    const sampleNotifications = [
      {
        title: "New Task Assigned",
        message: "You have been assigned to work on the 'User Authentication' task for the BCN Management project.",
        type: NotificationType.TASK_ASSIGNED,
        recipient: new ObjectId('6507f123456789abcdef0001'),
        sender: new ObjectId('6507f123456789abcdef0002'),
        isRead: false,
        targetType: 'task',
        targetId: new ObjectId('6507f123456789abcdef0003'),
        actionUrl: '/tasks/6507f123456789abcdef0003',
        createdAt: new Date(),
      },
      {
        title: "Project Assignment",
        message: "Your team has been assigned to the new 'E-commerce Platform' project. Please review the requirements and accept the assignment.",
        type: NotificationType.PROJECT_ASSIGNED,
        recipient: new ObjectId('6507f123456789abcdef0001'),
        sender: new ObjectId('6507f123456789abcdef0004'),
        isRead: false,
        targetType: 'project',
        targetId: new ObjectId('6507f123456789abcdef0005'),
        actionUrl: '/projects/6507f123456789abcdef0005',
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      },
      {
        title: "Deadline Reminder",
        message: "Task 'API Development' is due in 2 days. Please update your progress.",
        type: NotificationType.DEADLINE_REMINDER,
        recipient: new ObjectId('6507f123456789abcdef0001'),
        isRead: true,
        readAt: new Date(Date.now() - 1000 * 60 * 15), // Read 15 minutes ago
        targetType: 'task',
        targetId: new ObjectId('6507f123456789abcdef0006'),
        actionUrl: '/tasks/6507f123456789abcdef0006',
        data: { daysLeft: 2 },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      },
      {
        title: "System Maintenance",
        message: "Scheduled system maintenance will occur on Sunday from 2:00 AM to 4:00 AM UTC. Please save your work.",
        type: NotificationType.SYSTEM_ANNOUNCEMENT,
        recipient: new ObjectId('6507f123456789abcdef0001'),
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      },
      {
        title: "Task Update",
        message: "The requirements for 'Database Design' task have been updated. Please review the changes.",
        type: NotificationType.TASK_UPDATED,
        recipient: new ObjectId('6507f123456789abcdef0001'),
        sender: new ObjectId('6507f123456789abcdef0007'),
        isRead: true,
        readAt: new Date(Date.now() - 1000 * 60 * 60),
        targetType: 'task',
        targetId: new ObjectId('6507f123456789abcdef0008'),
        actionUrl: '/tasks/6507f123456789abcdef0008',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      }
    ];

    // Insert sample notifications
    const result = await db.collection('notifications').insertMany(sampleNotifications);
    
    return NextResponse.json({
      success: true,
      message: `Created ${result.insertedCount} sample notifications`,
      data: { insertedIds: result.insertedIds }
    });
  } catch (error) {
    console.error('Error creating sample notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create sample notifications' },
      { status: 500 }
    );
  }
}