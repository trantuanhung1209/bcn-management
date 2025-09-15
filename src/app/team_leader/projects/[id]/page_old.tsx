'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'testing' | 'completed' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  startDate: string;
  endDate?: string;
  team: string;
  teamName: string;
  assignedMembers: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  tags: string[];
  coins: number;
  totalTasks: number;
  completedTasks: number;
  isAssigned: boolean;
  manager?: string;
  managerName?: string;
  assignedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  assignedToName?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  project: string;
}

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

// Priority Badge Component
const PriorityBadge: React.FC<{ priority: 'low' | 'medium' | 'high' | 'urgent' }> = ({ priority }) => {
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200/60';
      case 'medium':
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200/60';
      case 'high':
        return 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 border-orange-200/60';
      case 'urgent':
        return 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200/60';
      default:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200/60';
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🟠';
      case 'urgent': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1 ${getPriorityStyle(priority)}`}>
      <span className="text-xs">{getPriorityIcon(priority)}</span>
      {getPriorityText(priority)}
    </span>
  );
};

// Status Badge Component
const StatusBadge: React.FC<{ status: 'planning' | 'in_progress' | 'testing' | 'completed' | 'on_hold' | 'cancelled' | 'todo' }> = ({ status }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'planning':
      case 'todo':
        return 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200/60';
      case 'in_progress':
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200/60';
      case 'testing':
        return 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border-purple-200/60';
      case 'completed':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200/60';
      case 'on_hold':
        return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200/60';
      case 'cancelled':
        return 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200/60';
      default:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200/60';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planning': return 'Lên kế hoạch';
      case 'todo': return 'Chưa làm';
      case 'in_progress': return 'Đang thực hiện';
      case 'testing': return 'Đang kiểm thử';
      case 'completed': return 'Hoàn thành';
      case 'on_hold': return 'Tạm dừng';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return '📋';
      case 'todo': return '📝';
      case 'in_progress': return '⚡';
      case 'testing': return '🧪';
      case 'completed': return '✅';
      case 'on_hold': return '⏸️';
      case 'cancelled': return '❌';
      default: return '📄';
    }
  };

  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusStyle(status)}`}>
      <span className="text-xs">{getStatusIcon(status)}</span>
      {getStatusText(status)}
    </span>
  );
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  
  // New task form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    assignedTo: '',
    dueDate: ''
  });

  // Fetch project details
  const fetchProject = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);
      const result = await response.json();
      
      if (result.success) {
        const projectData = result.data;
        const transformedProject: Project = {
          id: projectData._id,
          name: projectData.name,
          description: projectData.description,
          status: projectData.status,
          priority: projectData.priority,
          progress: projectData.progress || 0,
          startDate: projectData.startDate.split('T')[0],
          endDate: projectData.endDate?.split('T')[0] || '',
          team: projectData.team,
          teamName: 'Team Web Development', // You can fetch this from team API
          assignedMembers: projectData.assignedTo?.map((userId: string, index: number) => ({
            id: userId,
            name: `User ${index + 1}`,
            role: 'Member'
          })) || [],
          tags: projectData.tags || [],
          coins: projectData.coins,
          totalTasks: 0,
          completedTasks: 0,
          isAssigned: projectData.isAssigned || false,
          manager: projectData.manager,
          managerName: projectData.manager ? 'Manager Name' : undefined,
          assignedAt: projectData.assignedAt,
          acceptedAt: projectData.acceptedAt,
          rejectedAt: projectData.rejectedAt
        };
        
        setProject(transformedProject);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Fetch project tasks
  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`/api/tasks?project=${projectId}`);
      const result = await response.json();
      
      if (result.success) {
        const transformedTasks = result.data.tasks.map((task: any) => ({
          id: task._id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assignedTo: task.assignedTo,
          assignedToName: task.assignedToName || 'Chưa gán',
          dueDate: task.dueDate?.split('T')[0] || '',
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          project: task.project
        }));
        
        setTasks(transformedTasks);
        
        // Update project task counts
        if (project) {
          const totalTasks = transformedTasks.length;
          const completedTasks = transformedTasks.filter((task: Task) => task.status === 'completed').length;
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          
          setProject(prev => prev ? {
            ...prev,
            totalTasks,
            completedTasks,
            progress
          } : null);
        }
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, [projectId, project]);

  // Fetch team members
  const fetchTeamMembers = useCallback(async () => {
    if (project?.team) {
      try {
        const response = await fetch(`/api/teams/${project.team}/members`);
        const result = await response.json();
        
        if (result.success) {
          setTeamMembers(result.data.members || []);
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    }
  }, [project?.team]);

  // Create new task
  const handleCreateTask = async () => {
    if (newTask.title.trim()) {
      try {
        const taskData = {
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          assignedTo: newTask.assignedTo || undefined,
          dueDate: newTask.dueDate || undefined,
          project: projectId,
          status: 'todo',
          createdBy: '507f1f77bcf86cd799439013' // Replace with actual team leader ID
        };

        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        });

        const result = await response.json();

        if (result.success) {
          // Reset form
          setNewTask({
            title: '',
            description: '',
            priority: 'medium',
            assignedTo: '',
            dueDate: ''
          });
          setIsCreateTaskModalOpen(false);
          
          // Refresh tasks list
          fetchTasks();
        } else {
          alert('Có lỗi xảy ra khi tạo task: ' + result.error);
        }
      } catch (error) {
        console.error('Error creating task:', error);
        alert('Có lỗi xảy ra khi tạo task');
      }
    }
  };

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    if (project) {
      fetchTasks();
      fetchTeamMembers();
    }
  }, [project, fetchTasks, fetchTeamMembers]);

  if (isLoading) {
    return (
      <MainLayout userRole="team_leader">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  if (!project) {
    return (
      <MainLayout userRole="team_leader">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project không tìm thấy</h1>
          <button
            onClick={() => router.push('/team_leader/projects')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Quay lại danh sách Projects
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="team_leader">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={() => router.push('/team_leader/projects')}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                title="Quay lại"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
                {project.name}
              </h1>
            </div>
            <p className="text-[var(--color-text-secondary)]">
              {project.description}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <PriorityBadge priority={project.priority} />
            <StatusBadge status={project.status} />
          </div>
        </div>

        {/* Project Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="section-neumorphic bg-white rounded-2xl border border-blue-100/50 p-6">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">Tiến độ</h3>
            <p className="text-3xl font-bold text-blue-600 mb-2">{project.progress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="section-neumorphic bg-white rounded-2xl border border-green-100/50 p-6">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">Tasks hoàn thành</h3>
            <p className="text-3xl font-bold text-green-600">{project.completedTasks}</p>
            <p className="text-sm text-gray-500">/ {project.totalTasks} tasks</p>
          </div>
          
          <div className="section-neumorphic bg-white rounded-2xl border border-yellow-100/50 p-6">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">Coins</h3>
            <p className="text-3xl font-bold text-yellow-600">{project.coins}</p>
          </div>
          
          <div className="section-neumorphic bg-white rounded-2xl border border-purple-100/50 p-6">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">Team</h3>
            <p className="text-lg font-bold text-purple-600">{project.teamName}</p>
            <p className="text-sm text-gray-500">{teamMembers.length} thành viên</p>
          </div>
        </div>

        {/* Tasks Management */}
        <div className="section-neumorphic p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
              Quản lý Tasks
            </h2>
            <button
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tạo Task Mới
            </button>
          </div>

          {/* Tasks List */}
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có task nào</h3>
              <p className="text-gray-500 mb-4">Tạo task đầu tiên để bắt đầu phân công công việc cho team</p>
              <button
                onClick={() => setIsCreateTaskModalOpen(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Tạo Task Đầu Tiên
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <div key={task.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{task.title}</h3>
                    <div className="flex gap-1">
                      <PriorityBadge priority={task.priority} />
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <StatusBadge status={task.status} />
                    {task.dueDate && (
                      <span className="text-xs text-gray-500">
                        📅 {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      👤 {task.assignedToName || 'Chưa gán'}
                    </span>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Task Modal */}
        {isCreateTaskModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--color-background)] rounded-2xl p-6 w-full max-w-2xl section-neumorphic max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-6">
                Tạo Task Mới
              </h2>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Tiêu đề task *
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
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
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input resize-none"
                    rows={3}
                    placeholder="Nhập mô tả task"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      Độ ưu tiên
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
                    >
                      <option value="low">Thấp</option>
                      <option value="medium">Trung bình</option>
                      <option value="high">Cao</option>
                      <option value="urgent">Khẩn cấp</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      Gán cho member
                    </label>
                    <select
                      value={newTask.assignedTo}
                      onChange={(e) => setNewTask(prev => ({ ...prev, assignedTo: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
                    >
                      <option value="">Chọn member (tùy chọn)</option>
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.firstName} {member.lastName} - {member.role}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Hạn hoàn thành
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setIsCreateTaskModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateTask}
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  Tạo Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}