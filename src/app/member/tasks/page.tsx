'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { TaskStatus, TaskPriority } from '@/types';

interface Task {
  _id: string;
  title: string;
  description: string;
  project: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string | null;
  progress: number;
  assignedBy: string;
  createdAt: string;
}

const MemberTasksPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch all tasks without filters - do filtering on client side
      const response = await fetch(`/api/member/tasks`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load tasks');
      }

      setTasks(result.data);
    } catch (err) {
      console.error('Tasks fetch error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, []); // Remove filter dependencies

  useEffect(() => {
    fetchTasks();
  }, []); // Only run once on mount

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      // Optimistic update
      const currentTask = tasks.find(t => t._id === taskId);
      if (!currentTask) return;
      
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId 
            ? { 
                ...task, 
                status: newStatus,
                progress: newStatus === TaskStatus.COMPLETED ? 100 : task.progress
              }
            : task
        )
      );

      const response = await fetch(`/api/member/tasks/${taskId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to update status');
      }
    } catch (err) {
      console.error('Update status error:', err);
      // Revert optimistic update on error only
      await fetchTasks();
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const updateTaskProgress = async (taskId: string, newProgress: number) => {
    try {
      // Optimistic update
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId 
            ? { 
                ...task, 
                progress: newProgress,
                status: newProgress === 100 ? TaskStatus.COMPLETED : task.status
              }
            : task
        )
      );

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
    } catch (err) {
      console.error('Update progress error:', err);
      // Revert optimistic update on error only
      await fetchTasks();
      alert('Có lỗi xảy ra khi cập nhật tiến độ');
    }
  };

  const filteredTasks = tasks.filter((task: Task) => {
    // Filter by tab first
    if (activeTab === 'active' && task.status === TaskStatus.COMPLETED) {
      return false; // Hide completed tasks from active tab
    }
    if (activeTab === 'completed' && task.status !== TaskStatus.COMPLETED) {
      return false; // Show only completed tasks in completed tab
    }
    
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case TaskStatus.TODO:
        return 'bg-yellow-100 text-yellow-800';
      case TaskStatus.REVIEW:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
      case TaskPriority.URGENT:
        return 'text-red-600 bg-red-50';
      case TaskPriority.MEDIUM:
        return 'text-yellow-600 bg-yellow-50';
      case TaskPriority.LOW:
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 20) return 'bg-yellow-500';
    return 'bg-red-500';
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
              onClick={fetchTasks}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="member">
      <style jsx>{`
        .slider {
          background: linear-gradient(to right, #e5e7eb 0%, #e5e7eb 100%);
        }
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
          border: 2px solid white;
          transition: all 0.2s ease;
        }
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        }
        .neumorphic-input {
          background: #f8fafc;
          border: none !important;
          outline: none !important;
          box-shadow: inset 2px 2px 5px #d1d5db, inset -2px -2px 5px #ffffff;
        }
        .neumorphic-input:focus {
          outline: none !important;
          border: none !important;
          box-shadow: inset 3px 3px 7px #d1d5db, inset -3px -3px 7px #ffffff;
        }
      `}</style>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">
              Task Management
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Quản lý công việc hiệu quả
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-md">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-blue-700">Live</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="section-neumorphic p-1">
          <div className="flex gap-1 bg-gray-100 rounded-md p-1">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span>Active</span>
                <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full text-xs font-semibold">
                  {tasks.filter(t => t.status !== TaskStatus.COMPLETED).length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'completed'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span>Done</span>
                <span className="bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full text-xs font-semibold">
                  {tasks.filter(t => t.status === TaskStatus.COMPLETED).length}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Stats Overview - Conditional based on active tab */}
        {activeTab === 'active' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="group section-neumorphic p-4 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Pending
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {tasks.filter((t: Task) => t.status === TaskStatus.TODO).length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-sm">⏳</span>
                </div>
              </div>
            </div>

            <div className="group section-neumorphic p-4 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Progress
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {tasks.filter((t: Task) => t.status === TaskStatus.IN_PROGRESS).length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-sm">🔄</span>
                </div>
              </div>
            </div>

            <div className="group section-neumorphic p-4 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Review
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {tasks.filter((t: Task) => t.status === TaskStatus.REVIEW).length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-sm">👀</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="section-neumorphic p-6">
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">🎉</span>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {tasks.filter((t: Task) => t.status === TaskStatus.COMPLETED).length}
                </p>
                <p className="text-gray-600 font-medium">Hoàn thành</p>
                <p className="text-xs text-gray-500 mt-1">Tuyệt vời!</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters - Only show for active tab */}
        {activeTab === 'active' && (
          <div className="section-neumorphic p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">Filters</h3>
              <button 
                onClick={() => {
                  setFilterStatus('all');
                  setFilterPriority('all');
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
              >
                Reset
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md transition-all neumorphic-input"
                >
                  <option value="all">All Status</option>
                  <option value={TaskStatus.TODO}>⏳ Pending</option>
                  <option value={TaskStatus.IN_PROGRESS}>🔄 Progress</option>
                  <option value={TaskStatus.REVIEW}>👀 Review</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md transition-all neumorphic-input"
                >
                  <option value="all">All Priority</option>
                  <option value={TaskPriority.URGENT}>🔴 Urgent</option>
                  <option value={TaskPriority.HIGH}>🟠 High</option>
                  <option value={TaskPriority.MEDIUM}>🟡 Medium</option>
                  <option value={TaskPriority.LOW}>🟢 Low</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div key={task._id} className="group section-neumorphic p-4 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {task.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getPriorityColor(task.priority)}`}>
                          {task.priority === TaskPriority.URGENT && '🔴'}
                          {task.priority === TaskPriority.HIGH && '🟠'}
                          {task.priority === TaskPriority.MEDIUM && '🟡'}
                          {task.priority === TaskPriority.LOW && '🟢'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(task.status)}`}>
                          {task.status === TaskStatus.TODO && '⏳'}
                          {task.status === TaskStatus.IN_PROGRESS && '🔄'}
                          {task.status === TaskStatus.REVIEW && '👀'}
                          {task.status === TaskStatus.COMPLETED && '✅'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">
                        {task.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                          <span className="text-blue-600">📁</span>
                          <span className="font-medium text-gray-700">{task.project}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                          <span className="text-green-600">👤</span>
                          <span className="font-medium text-gray-700">{task.assignedBy}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                          <span className="text-red-600">📅</span>
                          <span className="font-medium text-gray-700">{task.deadline || 'No deadline'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 min-w-[160px]">
                  {/* Progress */}
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-600">Progress</span>
                      <span className="text-sm font-bold text-gray-900">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(task.progress)} shadow-sm`}
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                    {task.status !== TaskStatus.COMPLETED && (
                      <div className="mt-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={task.progress}
                          onChange={(e) => updateTaskProgress(task._id, parseInt(e.target.value))}
                          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider "
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 w-full">
                    {task.status !== TaskStatus.COMPLETED && (
                      <>
                        {task.status === TaskStatus.TODO && (
                          <button
                            onClick={() => updateTaskStatus(task._id, TaskStatus.IN_PROGRESS)}
                            className="flex-1 px-3 py-1.5 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-md hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow cursor-pointer"
                          >
                            🚀 Start
                          </button>
                        )}
                        
                        {task.status === TaskStatus.IN_PROGRESS && (
                          <button
                            onClick={() => updateTaskStatus(task._id, TaskStatus.COMPLETED)}
                            className="flex-1 px-3 py-1.5 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-md hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow cursor-pointer"
                          >
                            ✅ Done
                          </button>
                        )}
                      </>
                    )}
                    {task.status === TaskStatus.COMPLETED && (
                      <div className="flex items-center justify-center gap-2 w-full py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-md border border-green-200">
                        <span className="text-lg">🎉</span>
                        <span className="text-xs text-green-700 font-bold">Completed!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="section-neumorphic p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-8xl mb-6">
                {activeTab === 'active' ? '🎯' : '�'}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {activeTab === 'active' ? 'Không có task nào' : 'Chưa có thành tích nào'}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {activeTab === 'active' 
                  ? 'Hiện tại không có task nào phù hợp với bộ lọc của bạn. Hãy thử điều chỉnh bộ lọc hoặc chờ task mới được giao.' 
                  : 'Bạn chưa hoàn thành task nào. Hãy bắt đầu làm việc và theo dõi tiến độ để xem thành tích ở đây!'
                }
              </p>
              {activeTab === 'active' && (
                <button 
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterPriority('all');
                  }}
                  className="mt-6 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  Reset bộ lọc
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MemberTasksPage;
