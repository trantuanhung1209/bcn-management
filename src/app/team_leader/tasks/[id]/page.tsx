'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import MainLayout from '@/components/layout/MainLayout';

// Avatar component with fallback
const Avatar = ({ src, alt, name, size = 32 }: { src?: string | null, alt: string, name: string, size?: number }) => {
  const [imageError, setImageError] = useState(false);
  
  if (!src || imageError) {
    return (
      <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center">
        <span className={`text-blue-600 font-medium ${size <= 24 ? 'text-xs' : 'text-sm'}`}>
          {name?.charAt(0) || '?'}
        </span>
      </div>
    );
  }
  
  return (
    <Image 
      src={src} 
      alt={alt}
      width={size}
      height={size}
      className="w-full h-full object-cover rounded-full"
      onError={() => setImageError(true)}
    />
  );
};

// Comment item component with reply support
const CommentItem = ({ 
  comment, 
  depth = 0, 
  onReply, 
  replyingToCommentId, 
  replyContent, 
  setReplyContent, 
  handleAddReply, 
  isAddingReply,
  onCancelReply 
}: { 
  comment: Comment, 
  depth?: number,
  onReply: (commentId: string) => void,
  replyingToCommentId: string | null,
  replyContent: string,
  setReplyContent: (content: string) => void,
  handleAddReply: (parentCommentId: string) => void,
  isAddingReply: boolean,
  onCancelReply: () => void
}) => {
  const isReplying = replyingToCommentId === comment.id;
  const [isRepliesExpanded, setIsRepliesExpanded] = useState(false);
  
  // Calculate indentation based on depth
  const indentationClass = depth === 0 ? '' : 
                          depth === 1 ? 'ml-6 pl-3 border-l-2 border-gray-200' :
                          'ml-12 pl-3 border-l-2 border-gray-200';
  
  // Different styling for replies to make them smaller
  const containerClass = depth === 0 
    ? "bg-white rounded-xl p-4 border border-gray-200"
    : "bg-gray-50 rounded-lg p-3 border border-gray-100";
  
  const avatarSize = depth === 0 ? "w-8 h-8" : "w-6 h-6";
  const nameTextSize = depth === 0 ? "font-medium text-gray-900" : "font-medium text-gray-800 text-sm";
  const timeTextSize = depth === 0 ? "text-gray-500 text-sm ml-2" : "text-gray-500 text-xs ml-2";
  const contentTextSize = depth === 0 ? "text-gray-700 leading-relaxed whitespace-pre-wrap mb-3" : "text-gray-700 leading-relaxed whitespace-pre-wrap mb-2 text-sm";
  
  return (
    <div className={indentationClass}>
      <div className={containerClass}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            <div className={`${avatarSize} rounded-full flex items-center justify-center mr-3 overflow-hidden relative`}>
              <Avatar 
                src={comment.authorAvatar} 
                alt={comment.authorName || 'User'}
                name={comment.authorName || 'Unknown'}
                size={depth === 0 ? 32 : 24}
              />
            </div>
            <div>
              <span className={nameTextSize}>{comment.authorName}</span>
              <span className={timeTextSize}>
                {new Date(comment.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            comment.type === 'comment' ? 'bg-blue-100 text-blue-700' :
            comment.type === 'status_change' ? 'bg-green-100 text-green-700' :
            comment.type === 'assignment' ? 'bg-purple-100 text-purple-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {comment.type === 'comment' ? 'Bình luận' :
             comment.type === 'status_change' ? 'Thay đổi trạng thái' :
             comment.type === 'assignment' ? 'Giao việc' :
             'Cập nhật'}
          </span>
        </div>
        <p className={contentTextSize}>{comment.content}</p>
        
        {/* Reply button - chỉ hiện ở cấp 0 (comment gốc) */}
        {depth === 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onReply(comment.id)}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              Trả lời
            </button>
            {comment.replies && comment.replies.length > 0 && (
              <>
                <span className="text-gray-400">•</span>
                <button
                  onClick={() => setIsRepliesExpanded(!isRepliesExpanded)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  <svg 
                    className={`w-3 h-3 transition-transform duration-200 ${isRepliesExpanded ? 'rotate-90' : ''}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>
                    {isRepliesExpanded ? 'Ẩn' : 'Hiện'} {comment.replies.length} phản hồi
                  </span>
                </button>
              </>
            )}
          </div>
        )}
        
        {/* Reply form */}
        {isReplying && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white text-gray-900 placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 h-20 resize-none text-sm"
              placeholder="Nhập phản hồi của bạn..."
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => handleAddReply(comment.id)}
                disabled={!replyContent.trim() || isAddingReply}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isAddingReply ? 'Đang gửi...' : 'Gửi'}
              </button>
              <button
                onClick={onCancelReply}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors duration-200"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Render replies - chỉ hiển thị khi expanded */}
      {comment.replies && comment.replies.length > 0 && isRepliesExpanded && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply, index) => (
            <CommentItem
              key={reply.id || `reply-${index}`}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
              replyingToCommentId={replyingToCommentId}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              handleAddReply={handleAddReply}
              isAddingReply={isAddingReply}
              onCancelReply={onCancelReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  assignedToName?: string;
  assignedToEmail?: string;
  assignedToRole?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  progress?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  project: string;
  projectName?: string;
  createdBy?: string;
  createdByName?: string;
  comments?: Comment[];
}

interface Comment {
  id: string;
  content: string;
  author: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  type: 'comment' | 'status_change' | 'assignment' | 'update';
  parentCommentId?: string; // For replies
  replies?: Comment[]; // Nested replies
  mentionedUsers?: string[]; // User IDs mentioned in comment
}

interface TaskHistory {
  id: string;
  action: 'created' | 'updated' | 'status_changed' | 'assigned' | 'commented';
  actionBy: string;
  actionByName: string;
  actionAt: string;
  oldValue?: any;
  newValue?: any;
  description?: string;
}

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [taskHistory, setTaskHistory] = useState<TaskHistory[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'comments'>('details');
  
  // Edit task modal states
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [editTask, setEditTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'todo' as 'todo' | 'in_progress' | 'completed' | 'cancelled',
    assignedTo: '',
    dueDate: '',
    estimatedHours: '',
    tags: [] as string[]
  });

  // Comment states
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  
  // Reply states
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isAddingReply, setIsAddingReply] = useState(false);

  // Delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch task details
  const fetchTask = useCallback(async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`);
      const result = await response.json();
      
      if (result.success) {
        const taskData = result.data;
        const transformedTask: Task = {
          id: taskData._id,
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          assignedTo: taskData.assignedTo,
          assignedToName: taskData.assignedToName || 'Chưa gán',
          assignedToEmail: taskData.assignedToEmail,
          assignedToRole: taskData.assignedToRole,
          dueDate: taskData.dueDate?.split('T')[0] || '',
          estimatedHours: taskData.estimatedHours,
          actualHours: taskData.actualHours || 0,
          progress: taskData.progress || 0,
          tags: taskData.tags || [],
          createdAt: taskData.createdAt,
          updatedAt: taskData.updatedAt,
          project: taskData.project,
          projectName: taskData.projectName || 'Unknown Project',
          createdBy: taskData.createdBy,
          createdByName: taskData.createdByName,
          comments: taskData.comments || []
        };
        
        setTask(transformedTask);
        
        // Set edit form data
        setEditTask({
          title: transformedTask.title,
          description: transformedTask.description,
          priority: transformedTask.priority,
          status: transformedTask.status,
          assignedTo: transformedTask.assignedTo || '',
          dueDate: transformedTask.dueDate || '',
          estimatedHours: transformedTask.estimatedHours?.toString() || '',
          tags: transformedTask.tags || []
        });
      }
    } catch (error) {
      console.error('Error fetching task:', error);
    }
  }, [taskId]);

  // Fetch task history
  const fetchTaskHistory = useCallback(async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/history`);
      const result = await response.json();
      
      if (result.success) {
        setTaskHistory(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching task history:', error);
    }
  }, [taskId]);

  // Fetch team members when task is loaded
  const fetchTeamMembers = useCallback(async (projectId: string) => {
    try {
      // First get project to get team info
      const projectResponse = await fetch(`/api/projects/${projectId}`);
      const projectResult = await projectResponse.json();
      
      if (projectResult.success && projectResult.data.team) {
        const teamResponse = await fetch(`/api/teams/${projectResult.data.team}/members`);
        const teamResult = await teamResponse.json();
        
        if (teamResult.success) {
          const transformedMembers = (teamResult.data || []).map((member: any) => ({
            id: member._id,
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email,
            role: member.role
          }));
          setTeamMembers(transformedMembers);
        }
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  }, []);

  // Update task
  const handleUpdateTask = async () => {
    if (!task || !editTask.title.trim()) {
      alert('Vui lòng nhập tiêu đề task');
      return;
    }

    try {
      const taskData = {
        title: editTask.title,
        description: editTask.description,
        priority: editTask.priority,
        status: editTask.status,
        assignedTo: editTask.assignedTo || undefined,
        dueDate: editTask.dueDate || undefined,
        estimatedHours: editTask.estimatedHours ? parseInt(editTask.estimatedHours) : undefined,
        tags: editTask.tags
      };

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      const result = await response.json();

      if (result.success) {
        setIsEditTaskModalOpen(false);
        fetchTask();
        fetchTaskHistory();
        alert('Cập nhật task thành công!');
      } else {
        alert(result.error || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  };

  // Add comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsAddingComment(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });

      const result = await response.json();

      if (result.success) {
        setNewComment('');
        fetchTask(); // Refresh to get updated comments
        fetchTaskHistory(); // Refresh history
      } else {
        alert(result.error || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    } finally {
      setIsAddingComment(false);
    }
  };

  // Add reply to comment
  const handleAddReply = async (parentCommentId: string) => {
    if (!replyContent.trim()) return;

    setIsAddingReply(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: replyContent,
          parentCommentId: parentCommentId 
        }),
      });

      const result = await response.json();

      if (result.success) {
        setReplyContent('');
        setReplyingToCommentId(null);
        fetchTask(); // Refresh to get updated comments
        fetchTaskHistory(); // Refresh history
      } else {
        alert(result.error || 'Failed to add reply');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply');
    } finally {
      setIsAddingReply(false);
    }
  };

  // Delete task
  const handleDeleteTask = async () => {
    if (!task) return;

    try {
      const response = await fetch(`/api/tasks/${task.id}?permanent=true`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        alert('Xóa task thành công!');
        router.push(`/team_leader/projects/${task.project}`);
      } else {
        alert(result.error || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  // Load task data when component mounts
  useEffect(() => {
    if (taskId) {
      fetchTask();
      fetchTaskHistory();
    }
  }, [taskId, fetchTask, fetchTaskHistory]);

  // Load team members when task is loaded
  useEffect(() => {
    if (task && task.project) {
      fetchTeamMembers(task.project);
    }
  }, [task, fetchTeamMembers]);

  useEffect(() => {
    setIsLoading(false);
  }, [task]);

  if (isLoading || !task) {
    return (
      <MainLayout userRole="team_leader">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="team_leader">
      <div className="space-y-6">
        {/* Header */}
        <div className="section-neumorphic bg-white rounded-2xl border border-gray-100/50 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Breadcrumb & Back Button */}
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => router.push(`/team_leader/projects/${task.project}`)}
                  className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all duration-200 border border-gray-200/50 hover:border-blue-200/50 cursor-pointer"
                  title="Quay lại project"
                >
                  <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm font-medium">Quay lại</span>
                </button>
                
                {/* Breadcrumb */}
                <div className="flex items-center text-sm text-gray-500">
                  <span>Projects</span>
                  <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-blue-600 hover:underline cursor-pointer"
                        onClick={() => router.push(`/team_leader/projects/${task.project}`)}>
                    {task.projectName}
                  </span>
                  <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-blue-600 font-medium truncate max-w-xs">{task.title}</span>
                </div>
              </div>

              {/* Task Title & Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                    {task.title}
                  </h1>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setIsEditTaskModalOpen(true)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150 cursor-pointer"
                      title="Chỉnh sửa task"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150 cursor-pointer"
                      title="Xóa task"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  {/* Status Badge */}
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    task.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                    task.status === 'cancelled' ? 'bg-red-100 text-red-700 border border-red-200' :
                    'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      task.status === 'completed' ? 'bg-green-500' :
                      task.status === 'in_progress' ? 'bg-blue-500' :
                      task.status === 'cancelled' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`} />
                    {task.status === 'todo' ? 'Chưa bắt đầu' :
                     task.status === 'in_progress' ? 'Đang thực hiện' :
                     task.status === 'completed' ? 'Hoàn thành' :
                     'Đã hủy'}
                  </span>

                  {/* Priority Badge */}
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                    task.priority === 'urgent' ? 'bg-red-50 text-red-700 border-red-200' :
                    task.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    task.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    'bg-green-50 text-green-700 border-green-200'
                  }`}>
                    {task.priority === 'urgent' ? '🔴 Khẩn cấp' :
                     task.priority === 'high' ? '🟠 Cao' :
                     task.priority === 'medium' ? '🟡 Trung bình' :
                     '🟢 Thấp'}
                  </span>

                  {/* Due Date */}
                  {task.dueDate && (
                    <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Hạn: {task.dueDate}</span>
                      {new Date(task.dueDate) < new Date() && task.status !== 'completed' && (
                        <span className="ml-2 text-red-500 text-xs">Quá hạn</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Assigned To */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">Được gán cho:</span>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-blue-600 text-sm font-medium">
                          {task.assignedToName === 'Chưa gán' ? '?' : task.assignedToName?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-700 font-medium">{task.assignedToName}</span>
                        {task.assignedToEmail && (
                          <div className="text-gray-500 text-xs">{task.assignedToEmail}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {task.createdByName && (
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">Tạo bởi:</span>
                      <span className="text-gray-700">{task.createdByName}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm">Tags:</span>
                    <div className="flex flex-wrap gap-2">
                      {task.tags.map((tag, index) => (
                        <span key={`tag-${tag}-${index}`} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs border border-blue-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="ml-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100 min-w-[200px]">
              <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Thống kê
              </h3>
              <div className="space-y-2">
                {task.progress !== undefined && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tiến độ</span>
                      <span className="text-sm font-bold text-blue-600">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </>
                )}
                {task.estimatedHours && (
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-sm text-gray-600">Ước tính</span>
                    <span className="text-sm font-semibold text-gray-900">{task.estimatedHours}h</span>
                  </div>
                )}
                {task.actualHours !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Thực tế</span>
                    <span className="text-sm font-semibold text-gray-900">{task.actualHours}h</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tạo lúc</span>
                  <span className="text-sm text-gray-700">
                    {new Date(task.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="section-neumorphic p-6">
          {/* Tab Headers */}
          <div className="flex space-x-6 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 font-medium transition-colors duration-200 cursor-pointer ${
                activeTab === 'details'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Chi tiết
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-4 py-2 font-medium transition-colors duration-200 cursor-pointer ${
                activeTab === 'comments'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Bình luận ({task.comments?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 font-medium transition-colors duration-200 cursor-pointer ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Lịch sử ({taskHistory.length})
            </button>
          </div>
          
          {/* Tab Content */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Description */}
              {task.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Mô tả</h3>
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{task.description}</p>
                  </div>
                </div>
              )}

              {/* Additional Details Grid */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin chi tiết</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Trạng thái</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.status === 'completed' ? 'bg-green-100 text-green-700' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        task.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {task.status === 'todo' ? 'Chưa bắt đầu' :
                         task.status === 'in_progress' ? 'Đang thực hiện' :
                         task.status === 'completed' ? 'Hoàn thành' :
                         'Đã hủy'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Ưu tiên</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.priority === 'urgent' ? 'Khẩn cấp' :
                         task.priority === 'high' ? 'Cao' :
                         task.priority === 'medium' ? 'Trung bình' :
                         'Thấp'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Cập nhật cuối</span>
                      <span className="text-gray-900 text-sm font-medium">
                        {new Date(task.updatedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-6">
              {/* Add Comment */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Thêm bình luận</h3>
                <div className="space-y-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white text-gray-900 placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 h-24 resize-none"
                    placeholder="Nhập bình luận của bạn..."
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isAddingComment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
                  >
                    {isAddingComment ? 'Đang thêm...' : 'Thêm bình luận'}
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Bình luận</h3>
                {task.comments && task.comments.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                    {task.comments
                      .filter(comment => !comment.parentCommentId) // Only show top-level comments
                      .map((comment, index) => (
                        <CommentItem
                          key={comment.id || `comment-${index}`}
                          comment={comment}
                          onReply={(commentId) => setReplyingToCommentId(commentId)}
                          replyingToCommentId={replyingToCommentId}
                          replyContent={replyContent}
                          setReplyContent={setReplyContent}
                          handleAddReply={handleAddReply}
                          isAddingReply={isAddingReply}
                          onCancelReply={() => {
                            setReplyingToCommentId(null);
                            setReplyContent('');
                          }}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Chưa có bình luận nào
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Lịch sử thay đổi</h3>
              {taskHistory.length > 0 ? (
                <div className="space-y-4">
                  {taskHistory.map((historyItem, index) => (
                    <div key={historyItem.id || `history-${index}-${historyItem.actionAt}`} className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 text-sm font-medium">
                              {historyItem.actionByName?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{historyItem.actionByName}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                historyItem.action === 'created' ? 'bg-green-100 text-green-700' :
                                historyItem.action === 'updated' ? 'bg-blue-100 text-blue-700' :
                                historyItem.action === 'status_changed' ? 'bg-orange-100 text-orange-700' :
                                historyItem.action === 'assigned' ? 'bg-purple-100 text-purple-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {historyItem.action === 'created' ? 'Tạo mới' :
                                 historyItem.action === 'updated' ? 'Cập nhật' :
                                 historyItem.action === 'status_changed' ? 'Thay đổi trạng thái' :
                                 historyItem.action === 'assigned' ? 'Giao việc' :
                                 historyItem.action === 'commented' ? 'Bình luận' :
                                 historyItem.action}
                              </span>
                            </div>
                            <span className="text-gray-500 text-sm">
                              {new Date(historyItem.actionAt).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      {historyItem.description && (
                        <div className="mt-2 ml-11">
                          <p className="text-gray-600 text-sm">{historyItem.description}</p>
                        </div>
                      )}
                      {historyItem.oldValue && historyItem.newValue && (
                        <div className="mt-2 ml-11 text-sm">
                          <span className="text-red-600">- {historyItem.oldValue}</span>
                          <br />
                          <span className="text-green-600">+ {historyItem.newValue}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Chưa có lịch sử thay đổi nào
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Task Modal */}
      {isEditTaskModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Chỉnh sửa Task</h3>
              <button
                onClick={() => setIsEditTaskModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Task Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề Task *
                </label>
                <input
                  type="text"
                  value={editTask.title}
                  onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                  className="w-full px-3 py-2 neumorphic-input rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  placeholder="Nhập tiêu đề task..."
                />
              </div>

              {/* Task Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={editTask.description}
                  onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                  className="w-full px-3 py-2 neumorphic-input rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 h-24 resize-none"
                  placeholder="Mô tả chi tiết task..."
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={editTask.status}
                  onChange={(e) => setEditTask({ ...editTask, status: e.target.value as 'todo' | 'in_progress' | 'completed' | 'cancelled' })}
                  className="w-full px-3 py-2 neumorphic-input rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="todo">Chưa bắt đầu</option>
                  <option value="in_progress">Đang thực hiện</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mức độ ưu tiên
                </label>
                <select
                  value={editTask.priority}
                  onChange={(e) => setEditTask({ ...editTask, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })}
                  className="w-full px-3 py-2 neumorphic-input rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                  <option value="urgent">Khẩn cấp</option>
                </select>
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giao cho thành viên
                </label>
                <select
                  value={editTask.assignedTo}
                  onChange={(e) => setEditTask({ ...editTask, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 neumorphic-input rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <option key="unassigned" value="">Chưa gán</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.firstName} {member.lastName} ({member.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hạn hoàn thành
                </label>
                <input
                  type="date"
                  value={editTask.dueDate}
                  onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })}
                  className="w-full px-3 py-2 neumorphic-input rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>

              {/* Estimated Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian ước tính (giờ)
                </label>
                <input
                  type="number"
                  value={editTask.estimatedHours}
                  onChange={(e) => setEditTask({ ...editTask, estimatedHours: e.target.value })}
                  className="w-full px-3 py-2 neumorphic-input rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  placeholder="Nhập số giờ..."
                  min="1"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setIsEditTaskModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateTask}
                disabled={!editTask.title.trim()}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Xác nhận xóa</h3>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600">
                Bạn có chắc chắn muốn xóa task <strong>&ldquo;{task.title}&rdquo;</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Hành động này không thể hoàn tác.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteTask}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors duration-200 cursor-pointer"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
