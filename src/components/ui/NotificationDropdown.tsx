"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/contexts/NotificationContext';
import { 
  IoNotifications, 
  IoCheckmarkDone, 
  IoTrash, 
  IoTime,
  IoCheckmark,
  IoEllipsisVertical
} from 'react-icons/io5';
import { Notification, NotificationType } from '@/types';

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedNotification(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.TASK_ASSIGNED:
        return '📋';
      case NotificationType.PROJECT_ASSIGNED:
        return '📁';
      case NotificationType.DEADLINE_REMINDER:
        return '⏰';
      case NotificationType.SYSTEM_ANNOUNCEMENT:
        return '📢';
      default:
        return '📄';
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id!.toString());
    }
    
    // Navigate to action URL using Next.js router
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await markAsRead(notificationId);
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
    setSelectedNotification(null);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-white rounded-full p-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
      >
        <IoNotifications className="text-xl text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1 font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl backdrop-blur-sm z-50 animate-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors px-2 py-1 rounded-md hover:bg-blue-50"
              >
                <IoCheckmarkDone className="text-xs" />
                Mark all read
              </button>
            )}
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-6">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center p-6 text-gray-500">
                <IoNotifications className="mx-auto text-3xl mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((notification) => (
                  <div
                    key={notification._id?.toString()}
                    className={`relative px-4 py-3 hover:bg-gray-50 cursor-pointer transition-all duration-150 ${
                      !notification.isRead ? 'bg-blue-50/50 border-l-2 border-l-blue-500' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Notification Content */}
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="text-lg mt-0.5 flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate leading-tight">
                              {notification.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                              {notification.message}
                            </p>
                          </div>
                          
                          {/* Actions Menu */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNotification(
                                  selectedNotification === notification._id?.toString() 
                                    ? null 
                                    : notification._id!.toString()
                                );
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                            >
                              <IoEllipsisVertical className="text-xs" />
                            </button>
                            
                            {selectedNotification === notification._id?.toString() && (
                              <div className="absolute right-0 mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                                {!notification.isRead && (
                                  <button
                                    onClick={(e) => handleMarkAsRead(e, notification._id!.toString())}
                                    className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                  >
                                    <IoCheckmark className="text-xs" />
                                    Mark read
                                  </button>
                                )}
                                <button
                                  onClick={(e) => handleDelete(e, notification._id!.toString())}
                                  className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                >
                                  <IoTrash className="text-xs" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Time and Status */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <IoTime className="text-xs" />
                            {getTimeAgo(notification.createdAt)}
                          </div>
                          
                          {/* Unread Indicator */}
                          {!notification.isRead && (
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 text-center">
              <button className="text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium">
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;