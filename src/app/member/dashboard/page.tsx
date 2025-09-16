'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { TaskStatus, TaskPriority } from '@/types';

interface TaskData {
  _id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number;
  dueDate?: Date;
  project: string;
}

interface ActivityData {
  _id: string;
  title: string;
  action: string;
  project: string;
  updatedAt: Date;
  progress: number;
}

interface ProjectData {
  _id: string;
  name: string;
  status: string;
  progress: number;
  deadline?: Date;
  priority: TaskPriority;
}

interface DashboardData {
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  team: {
    name: string;
    description: string;
    memberCount: number;
    projectCount: number;
  } | null;
  stats: {
    assignedTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    overdueTasks: number;
  };
  performance: {
    completedThisMonth: number;
    monthlyGrowthPercentage: number;
    averageCompletionDays: number;
    averageRating: number;
  };
  todayTasks: TaskData[];
  recentActivity: ActivityData[];
  projects: ProjectData[];
}

const MemberDashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/member/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if you have token stored
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load dashboard');
      }

      setDashboardData(result.data);
      console.log('Dashboard data:', result.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'testing': return 'bg-purple-500';
      case 'planning': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Không có deadline';
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Ngày mai';
    if (diffDays === -1) return 'Hôm qua';
    if (diffDays > 0) return `${diffDays} ngày nữa`;
    return `Quá hạn ${Math.abs(diffDays)} ngày`;
  };

  const getTimeAgo = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Vừa xong';
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
  };

  const updateTaskProgress = async (taskId: string, newProgress: number) => {
    try {
      // Optimistic update - update UI immediately
      setDashboardData(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          todayTasks: prev.todayTasks.map(task => 
            task._id === taskId 
              ? { ...task, progress: newProgress }
              : task
          ),
          // Also update stats if task reaches 100%
          stats: {
            ...prev.stats,
            completedTasks: newProgress === 100 && prev.todayTasks.find(t => t._id === taskId)?.progress !== 100
              ? prev.stats.completedTasks + 1
              : newProgress < 100 && prev.todayTasks.find(t => t._id === taskId)?.progress === 100
              ? prev.stats.completedTasks - 1
              : prev.stats.completedTasks,
            inProgressTasks: newProgress > 0 && newProgress < 100 && 
              (prev.todayTasks.find(t => t._id === taskId)?.progress === 0 || 
               prev.todayTasks.find(t => t._id === taskId)?.progress === 100)
              ? prev.stats.inProgressTasks + 1
              : (newProgress === 0 || newProgress === 100) &&
                prev.todayTasks.find(t => t._id === taskId)?.progress !== undefined &&
                prev.todayTasks.find(t => t._id === taskId)!.progress > 0 &&
                prev.todayTasks.find(t => t._id === taskId)!.progress < 100
              ? prev.stats.inProgressTasks - 1
              : prev.stats.inProgressTasks
          }
        };
      });

      // Send API request in background
      const response = await fetch(`/api/member/tasks/${taskId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        credentials: 'include',
        body: JSON.stringify({ progress: newProgress })
      });

      if (!response.ok) {
        throw new Error('Failed to update task progress');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update progress');
      }

      // Optionally sync with server data if needed
      // await fetchDashboardData();
      
    } catch (err) {
      console.error('Update progress error:', err);
      
      // Revert optimistic update on error
      await fetchDashboardData();
      alert('Có lỗi xảy ra khi cập nhật tiến độ. Đã khôi phục dữ liệu.');
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      // Get current task for optimistic update
      const currentTask = dashboardData?.todayTasks.find(t => t._id === taskId);
      if (!currentTask) return;
      
      // Optimistic update - update UI immediately
      setDashboardData(prev => {
        if (!prev) return prev;
        
        const updatedProgress = status === TaskStatus.DONE ? 100 : currentTask.progress;
        
        return {
          ...prev,
          todayTasks: prev.todayTasks.map(task => 
            task._id === taskId 
              ? { ...task, status, progress: updatedProgress }
              : task
          ),
          // Update stats based on status change
          stats: {
            ...prev.stats,
            completedTasks: status === TaskStatus.DONE && currentTask.status !== TaskStatus.DONE
              ? prev.stats.completedTasks + 1
              : status !== TaskStatus.DONE && currentTask.status === TaskStatus.DONE
              ? prev.stats.completedTasks - 1
              : prev.stats.completedTasks,
            inProgressTasks: status === TaskStatus.IN_PROGRESS && currentTask.status !== TaskStatus.IN_PROGRESS
              ? prev.stats.inProgressTasks + 1
              : status !== TaskStatus.IN_PROGRESS && currentTask.status === TaskStatus.IN_PROGRESS
              ? prev.stats.inProgressTasks - 1
              : prev.stats.inProgressTasks,
            pendingTasks: status === TaskStatus.TODO && currentTask.status !== TaskStatus.TODO
              ? prev.stats.pendingTasks + 1
              : status !== TaskStatus.TODO && currentTask.status === TaskStatus.TODO
              ? prev.stats.pendingTasks - 1
              : prev.stats.pendingTasks
          }
        };
      });

      // Send API request in background
      const response = await fetch(`/api/member/tasks/${taskId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update status');
      }

      // Optionally sync with server data if needed
      // await fetchDashboardData();
      
    } catch (err) {
      console.error('Update status error:', err);
      
      // Revert optimistic update on error
      await fetchDashboardData();
      alert('Có lỗi xảy ra khi cập nhật trạng thái. Đã khôi phục dữ liệu.');
    }
  };

  if (isLoading) {
    return (
      <MainLayout userRole="member">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout userRole="member">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!dashboardData) {
    return (
      <MainLayout userRole="member">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Không có dữ liệu</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="member">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            My Dashboard
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Chào mừng {dashboardData.user.name}! Theo dõi công việc và tiến độ của bạn.
          </p>
        </div>

        {/* Personal Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📋</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {dashboardData.stats.assignedTasks}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Tasks được giao</p>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">✅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {dashboardData.stats.completedTasks}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Tasks hoàn thành</p>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🔄</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {dashboardData.stats.inProgressTasks}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Đang thực hiện</p>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">⏳</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {dashboardData.stats.pendingTasks}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Chờ xử lý</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Work Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="section-neumorphic p-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
              Tasks cần làm
            </h2>
            <div className="space-y-4">
              {dashboardData.todayTasks.length > 0 ? (
                dashboardData.todayTasks.map((task) => (
                  <div key={task._id} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                    <span className="text-2xl">📋</span>
                    <div className="flex-1">
                      <p className="text-[var(--color-text-primary)] font-medium">
                        {task.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-[var(--color-text-secondary)] text-sm">
                          Progress: {task.progress}%
                        </p>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => updateTaskProgress(task._id, Math.min(100, task.progress + 10))}
                            className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 cursor-pointer"
                          >
                            +10%
                          </button>
                          {task.progress < 100 && (
                            <button
                              onClick={() => updateTaskStatus(task._id, TaskStatus.DONE)}
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 cursor-pointer"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                        {formatDate(task.dueDate)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-[var(--color-text-secondary)]">Không có task nào cần làm</p>
                </div>
              )}
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
              Hoạt động gần đây
            </h2>
            <div className="space-y-4">
              {dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((activity) => (
                  <div key={activity._id} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                    <span className="text-2xl">
                      {activity.action === 'completed' ? '✅' : 
                       activity.action === 'updated' ? '📊' : '💬'}
                    </span>
                    <div className="flex-1">
                      <p className="text-[var(--color-text-primary)] font-medium">
                        {activity.action === 'completed' ? 'Hoàn thành' : 'Cập nhật'} {activity.title}
                      </p>
                      <p className="text-[var(--color-text-secondary)] text-sm">
                        Progress: {activity.progress}%
                      </p>
                    </div>
                    <span className="text-[var(--color-text-secondary)] text-xs">
                      {getTimeAgo(activity.updatedAt)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-[var(--color-text-secondary)]">Chưa có hoạt động gần đây</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Team & Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="section-neumorphic p-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
              Team của tôi
            </h2>
            <div className="bg-white p-4 rounded-lg">
              {dashboardData.team ? (
                <>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-xl">👥</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                        {dashboardData.team.name}
                      </h3>
                      <p className="text-[var(--color-text-secondary)] text-sm">
                        {dashboardData.team.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--color-text-secondary)]">Thành viên</span>
                      <span className="text-[var(--color-text-primary)] font-medium">{dashboardData.team.memberCount} người</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--color-text-secondary)]">Dự án đang chạy</span>
                      <span className="text-[var(--color-text-primary)] font-medium">{dashboardData.team.projectCount} dự án</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[var(--color-text-secondary)]">Chưa thuộc team nào</p>
                </div>
              )}
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
              Dự án đang tham gia
            </h2>
            <div className="space-y-3">
              {dashboardData.projects.length > 0 ? (
                dashboardData.projects.map((project) => (
                  <div key={project._id} className="bg-white p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-[var(--color-text-primary)]">
                        {project.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                      Priority: {project.priority}
                    </p>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[var(--color-text-secondary)]">Progress</span>
                      <span className="text-[var(--color-text-primary)] font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getStatusColor(project.status)}`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-[var(--color-text-secondary)]">Chưa tham gia dự án nào</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Member Actions */}
        {/* <div className="section-neumorphic p-6">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
            Thao tác nhanh
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="neumorphic-button p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow duration-200">
              <span className="text-xl">📋</span>
              <span>Xem Tasks</span>
            </button>
            <button className="neumorphic-button p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow duration-200">
              <span className="text-xl">⏰</span>
              <span>Báo cáo thời gian</span>
            </button>
            <button className="neumorphic-button p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow duration-200">
              <span className="text-xl">💬</span>
              <span>Team Chat</span>
            </button>
            <button className="neumorphic-button p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow duration-200">
              <span className="text-xl">👤</span>
              <span>Profile</span>
            </button>
          </div>
        </div> */}

        {/* Performance Overview */}
        <div className="section-neumorphic p-6">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
            Hiệu suất làm việc
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-secondary)]">Tasks hoàn thành tháng này</span>
                <span className="text-2xl">📈</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">
                {dashboardData.performance.completedThisMonth}
              </p>
              <p className="text-[var(--color-text-secondary)] text-sm">
                {dashboardData.performance.monthlyGrowthPercentage > 0 ? '+' : ''}
                {dashboardData.performance.monthlyGrowthPercentage}% so với tháng trước
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-secondary)]">Điểm đánh giá trung bình</span>
                <span className="text-2xl">⭐</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">
                {dashboardData.performance.averageRating}/5
              </p>
              <p className="text-[var(--color-text-secondary)] text-sm">Xuất sắc</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-secondary)]">Thời gian hoàn thành trung bình</span>
                <span className="text-2xl">⏱️</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">
                {dashboardData.performance.averageCompletionDays} ngày
              </p>
              <p className="text-[var(--color-text-secondary)] text-sm">Hiệu quả cao</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MemberDashboardPage;
