import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { Notification } from '@/types';
import { getAuthenticatedUserId } from '@/lib/auth-middleware';

// GET /api/notifications - Get notifications for current user
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    
    const userObjectId = new ObjectId(userId);
    
    const db = await getDb();
    
    const query: any = { recipient: userObjectId };
    if (unreadOnly) {
      query.isRead = false;
    }
    
    const notifications = await db
      .collection('notifications')
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    
    const total = await db.collection('notifications').countDocuments(query);
    const unreadCount = await db.collection('notifications').countDocuments({
      recipient: userObjectId,
      isRead: false
    });
    
    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        unreadCount
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb();
    
    const notification: Notification = {
      ...body,
      createdAt: new Date(),
      isRead: false
    };
    
    const result = await db.collection('notifications').insertOne(notification);
    
    return NextResponse.json({
      success: true,
      data: { ...notification, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications - Bulk update notifications (mark as read)
export async function PUT(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, notificationIds } = await request.json();
    
    const userObjectId = new ObjectId(userId);
    
    const db = await getDb();
    
    if (action === 'markAllAsRead') {
      await db.collection('notifications').updateMany(
        { recipient: userObjectId, isRead: false },
        { 
          $set: { 
            isRead: true, 
            readAt: new Date() 
          } 
        }
      );
    } else if (action === 'markAsRead' && notificationIds) {
      await db.collection('notifications').updateMany(
        { 
          _id: { $in: notificationIds.map((id: string) => new ObjectId(id)) },
          recipient: userObjectId 
        },
        { 
          $set: { 
            isRead: true, 
            readAt: new Date() 
          } 
        }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}