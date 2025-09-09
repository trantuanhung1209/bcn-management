'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';

interface Task {
  id: string;
  title: string;
  description: string;
  project: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  deadline: string;
  progress: number;
  assignedBy: string;
  createdAt: string;
}

const MemberTasksPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    // Simulate API call to fetch tasks
    setTimeout(() => {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Thiết kế UI Dashboard',
          description: 'Thiết kế giao diện người dùng cho trang dashboard chính',
          project: 'Project Web Admin',
          priority: 'High',
          status: 'in-progress',
          deadline: '2024-12-15',
          progress: 65,
          assignedBy: 'Nguyễn Văn B',
          createdAt: '2024-12-01'
        },
        {
          id: '2',
          title: 'Implement Authentication',
          description: 'Xây dựng hệ thống đăng nhập và phân quyền',
          project: 'Project Web Admin',
          priority: 'High',
          status: 'pending',
          deadline: '2024-12-20',
          progress: 0,
          assignedBy: 'Nguyễn Văn B',
          createdAt: '2024-12-02'
        },
        {
          id: '3',
          title: 'Fix Bug Login Form',
          description: 'Sửa lỗi validation trong form đăng nhập',
          project: 'Project Mobile App',
          priority: 'Medium',
          status: 'completed',
          deadline: '2024-12-05',
          progress: 100,
          assignedBy: 'Trần Thị C',
          createdAt: '2024-11-28'
        },
        {
          id: '4',
          title: 'Viết Unit Tests',
          description: 'Viết unit test cho các component chính',
          project: 'Project Web Admin',
          priority: 'Low',
          status: 'overdue',
          deadline: '2024-12-01',
          progress: 30,
          assignedBy: 'Nguyễn Văn B',
          createdAt: '2024-11-25'
        },
        {
          id: '5',
          title: 'Optimize Performance',
          description: 'Tối ưu hóa hiệu suất loading trang',
          project: 'Project Mobile App',
          priority: 'Medium',
          status: 'pending',
          deadline: '2024-12-25',
          progress: 0,
          assignedBy: 'Trần Thị C',
          createdAt: '2024-12-03'
        }
      ];
      
      setTasks(mockTasks);
      setIsLoading(false);
    }, 1000);
  }, []);

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: newStatus,
              progress: newStatus === 'completed' ? 100 : task.progress
            }
          : task
      )
    );
  };

  const updateTaskProgress = (taskId: string, newProgress: number) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              progress: newProgress,
              status: newProgress === 100 ? 'completed' : task.status
            }
          : task
      )
    );
  };

  const filteredTasks = tasks.filter((task: Task) => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'text-red-600 bg-red-50';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'Low':
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

  return (
    <MainLayout userRole="member">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            Quản lý Tasks
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Theo dõi và cập nhật tiến độ công việc được giao
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="section-neumorphic p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Tổng Tasks
                </p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {tasks.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📋</span>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Đang thực hiện
                </p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {tasks.filter((t: Task) => t.status === 'in-progress').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Hoàn thành
                </p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {tasks.filter((t: Task) => t.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Quá hạn
                </p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {tasks.filter((t: Task) => t.status === 'overdue').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-red-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">⚠️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="section-neumorphic p-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Trạng thái
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-neumorphic"
              >
                <option value="all">Tất cả</option>
                <option value="pending">Chờ xử lý</option>
                <option value="in-progress">Đang thực hiện</option>
                <option value="completed">Hoàn thành</option>
                <option value="overdue">Quá hạn</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Độ ưu tiên
              </label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="input-neumorphic"
              >
                <option value="all">Tất cả</option>
                <option value="High">Cao</option>
                <option value="Medium">Trung bình</option>
                <option value="Low">Thấp</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="section-neumorphic p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                      {task.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status === 'pending' && 'Chờ xử lý'}
                      {task.status === 'in-progress' && 'Đang thực hiện'}
                      {task.status === 'completed' && 'Hoàn thành'}
                      {task.status === 'overdue' && 'Quá hạn'}
                    </span>
                  </div>
                  
                  <p className="text-[var(--color-text-secondary)] mb-2">
                    {task.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
                    <span>📁 {task.project}</span>
                    <span>👤 Giao bởi: {task.assignedBy}</span>
                    <span>📅 Deadline: {task.deadline}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  {/* Progress */}
                  <div className="w-32">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[var(--color-text-secondary)]">Progress</span>
                      <span className="text-xs font-medium text-[var(--color-text-primary)]">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(task.progress)}`}
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {task.status !== 'completed' && (
                      <>
                        {task.status === 'pending' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'in-progress')}
                            className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Bắt đầu
                          </button>
                        )}
                        
                        {task.status === 'in-progress' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'completed')}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Hoàn thành
                          </button>
                        )}
                        
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={task.progress}
                          onChange={(e) => updateTaskProgress(task.id, parseInt(e.target.value))}
                          className="w-20"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="section-neumorphic p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
              Không có task nào
            </h3>
            <p className="text-[var(--color-text-secondary)]">
              Chưa có task nào phù hợp với bộ lọc hiện tại
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MemberTasksPage;
