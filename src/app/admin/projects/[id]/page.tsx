'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';

// Import components từ trang projects
const PriorityBadge: React.FC<{ priority: 'low' | 'medium' | 'high' | 'urgent' }> = ({ priority }) => {
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'Thấp';
      case 'medium': return 'Trung bình';
      case 'high': return 'Cao';
      case 'urgent': return 'Khẩn cấp';
      default: return priority;
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityStyle(priority)}`}>
      {getPriorityText(priority)}
    </span>
  );
};

const StatusBadge: React.FC<{ status: 'planning' | 'in_progress' | 'testing' | 'completed' | 'on_hold' }> = ({ status }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'testing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'on_hold':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planning': return 'Lên kế hoạch';
      case 'in_progress': return 'Đang thực hiện';
      case 'testing': return 'Đang kiểm thử';
      case 'completed': return 'Hoàn thành';
      case 'on_hold': return 'Tạm dừng';
      default: return status;
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyle(status)}`}>
      {getStatusText(status)}
    </span>
  );
};

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-[var(--color-text-secondary)]">Tiến độ</span>
        <span className="text-xs font-medium text-[var(--color-text-primary)]">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-[var(--color-accent)] to-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'testing' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  startDate: string;
  endDate: string;
  team: string;
  teamName: string;
  assignedMembers: {
    id: string;
    name: string;
    role: string;
  }[];
  tags: string[];
  budget?: number;
  totalTasks: number;
  completedTasks: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  assignedName: string;
  dueDate: string;
  createdAt: string;
}

const ProjectDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo' as 'todo' | 'in_progress' | 'completed',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    assignedTo: '',
    dueDate: ''
  });

  // Fetch project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/projects/${projectId}`);
        const result = await response.json();
        
        if (result.success) {
          const projectData = result.data;
          
          // Map team ObjectId back to team name
          const getTeamName = (teamId: string) => {
            const teamMapping: { [key: string]: string } = {
              '507f1f77bcf86cd799439011': 'Team Web',
              '507f1f77bcf86cd799439012': 'Team App',
            };
            return teamMapping[teamId] || `Team ${teamId}`;
          };

          setProject({
            id: projectData._id,
            name: projectData.name,
            description: projectData.description,
            status: projectData.status,
            priority: projectData.priority,
            progress: projectData.progress || 0,
            startDate: projectData.startDate?.split('T')[0] || '',
            endDate: projectData.endDate?.split('T')[0] || '',
            team: projectData.team,
            teamName: getTeamName(projectData.team),
            assignedMembers: projectData.assignedTo?.map((userId: string, index: number) => ({
              id: userId,
              name: `User ${index + 1}`,
              role: 'Member'
            })) || [],
            tags: projectData.tags || [],
            budget: projectData.budget,
            totalTasks: 0,
            completedTasks: 0
          });

          // Initialize empty tasks - tasks will be created manually
          setTasks([]);
        } else {
          console.error('Project not found');
          router.push('/admin/projects');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        router.push('/admin/projects');
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId, router]);

  const handleCreateTask = () => {
    if (newTask.title.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        ...newTask,
        assignedName: 'Current User',
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      setTasks(prev => [...prev, task]);
      setNewTask({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignedTo: '',
        dueDate: ''
      });
      setIsCreateTaskModalOpen(false);
    }
  };

  const updateTaskStatus = (taskId: string, newStatus: 'todo' | 'in_progress' | 'completed') => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const handleDeleteTask = (task: Task) => {
    setDeletingTask(task);
    setIsDeleteTaskModalOpen(true);
  };

  const confirmDeleteTask = () => {
    if (deletingTask) {
      setTasks(prev => prev.filter(task => task.id !== deletingTask.id));
      setIsDeleteTaskModalOpen(false);
      setDeletingTask(null);
    }
  };

  if (isLoading) {
    return (
      <MainLayout userRole="admin">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  if (!project) {
    return (
      <MainLayout userRole="admin">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            Project không tồn tại
          </h2>
        </div>
      </MainLayout>
    );
  }

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };

  return (
    <MainLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <button
              onClick={() => router.back()}
              className="text-[var(--color-accent)] hover:underline mb-2 flex items-center space-x-1 cursor-pointer"
            >
              <span>←</span>
              <span>Quay lại</span>
            </button>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
              {project.name}
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-1">
              {project.description}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <StatusBadge status={project.status} />
            <PriorityBadge priority={project.priority} />
          </div>
        </div>

        {/* Project Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Info */}
          <div className="lg:col-span-2 section-neumorphic p-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              Thông tin Project
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Ngày bắt đầu
                </label>
                <p className="text-[var(--color-text-primary)] mt-1">
                  {new Date(project.startDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Ngày kết thúc
                </label>
                <p className="text-[var(--color-text-primary)] mt-1">
                  {new Date(project.endDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Team
                </label>
                <p className="text-[var(--color-text-primary)] mt-1">
                  {project.teamName}
                </p>
              </div>
              
              {project.budget && (
                <div>
                  <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                    Ngân sách
                  </label>
                  <p className="text-[var(--color-text-primary)] mt-1">
                    {(project.budget / 1000000).toFixed(0)}M VNĐ
                  </p>
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="mt-6">
              <ProgressBar progress={project.progress} />
            </div>

            {/* Tags */}
            {project.tags.length > 0 && (
              <div className="mt-6">
                <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-2 block">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Task Stats */}
          <div className="section-neumorphic p-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              Thống kê Tasks
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-text-secondary)]">Tổng tasks</span>
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {taskStats.total}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-text-secondary)]">Hoàn thành</span>
                <span className="font-semibold text-green-600">
                  {taskStats.completed}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-text-secondary)]">Đang thực hiện</span>
                <span className="font-semibold text-yellow-600">
                  {taskStats.inProgress}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-text-secondary)]">Chưa bắt đầu</span>
                <span className="font-semibold text-blue-600">
                  {taskStats.todo}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="section-neumorphic p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Tasks ({taskStats.total})
            </h3>
            <button
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="neumorphic-button flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Thêm Task</span>
            </button>
          </div>

          {/* Task List */}
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-[var(--color-text-primary)] mb-1">
                      {task.title}
                    </h4>
                    <p className="text-[var(--color-text-secondary)] text-sm mb-2">
                      {task.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-[var(--color-text-secondary)]">
                      <span>Giao cho: {task.assignedName}</span>
                      <span>Hạn: {new Date(task.dueDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <PriorityBadge priority={task.priority} />
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                      className="px-2 py-1 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    >
                      <option value="todo">Chưa bắt đầu</option>
                      <option value="in_progress">Đang thực hiện</option>
                      <option value="completed">Hoàn thành</option>
                    </select>
                    <button
                      onClick={() => handleDeleteTask(task)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 cursor-pointer"
                      title="Xóa task"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {tasks.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h4 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                Chưa có task nào
              </h4>
              <p className="text-[var(--color-text-secondary)] mb-4">
                Tạo task đầu tiên cho project này
              </p>
              <button
                onClick={() => setIsCreateTaskModalOpen(true)}
                className="neumorphic-button"
              >
                Tạo Task Đầu Tiên
              </button>
            </div>
          )}
        </div>

        {/* Create Task Modal */}
        {isCreateTaskModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--color-background)] rounded-2xl p-6 w-full max-w-lg section-neumorphic">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-6">
                Tạo Task Mới
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Tiêu đề *
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 neumorphic-input rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
                    placeholder="Nhập tiêu đề task"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 neumorphic-input rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input resize-none"
                    rows={3}
                    placeholder="Nhập mô tả task"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      Độ ưu tiên
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 neumorphic-input rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
                    >
                      <option value="low">Thấp</option>
                      <option value="medium">Trung bình</option>
                      <option value="high">Cao</option>
                      <option value="urgent">Khẩn cấp</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      Hạn chót
                    </label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full px-3 py-2 neumorphic-input rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setIsCreateTaskModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateTask}
                  className="flex-1 neumorphic-button"
                >
                  Tạo Task
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Task Confirmation Modal */}
        {isDeleteTaskModalOpen && deletingTask && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--color-background)] rounded-2xl p-6 w-full max-w-md section-neumorphic">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
                  Xác nhận xóa task
                </h3>
                <p className="text-[var(--color-text-secondary)] mb-6">
                  Bạn có chắc chắn muốn xóa task &quot;{deletingTask.title}&quot;? 
                  Hành động này không thể hoàn tác.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setIsDeleteTaskModalOpen(false);
                      setDeletingTask(null);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmDeleteTask}
                    className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors duration-200 cursor-pointer"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ProjectDetailPage;