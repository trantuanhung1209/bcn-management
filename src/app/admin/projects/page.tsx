'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';

// Priority Badge Component
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

// Status Badge Component
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

// Progress Bar Component
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

// Avatar Component
const Avatar: React.FC<{ name: string; className?: string }> = ({ name, className = '' }) => (
  <div className={`w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold ${className}`}>
    {name.charAt(0)}
  </div>
);

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

const AdminProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // New project form state
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planning' as const,
    priority: 'medium' as const,
    startDate: '',
    endDate: '',
    team: '',
    budget: 0
  });

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'Website E-commerce',
          description: 'Phát triển website bán hàng trực tuyến với đầy đủ tính năng thanh toán, quản lý đơn hàng',
          status: 'in_progress',
          priority: 'high',
          progress: 65,
          startDate: '2024-01-15',
          endDate: '2024-04-15',
          team: '1',
          teamName: 'Team Web',
          assignedMembers: [
            { id: '1', name: 'Nguyễn Văn A', role: 'Team Lead' },
            { id: '2', name: 'Trần Thị B', role: 'Frontend Dev' },
            { id: '3', name: 'Lê Văn C', role: 'Backend Dev' }
          ],
          tags: ['React', 'Node.js', 'MongoDB'],
          budget: 50000000,
          totalTasks: 24,
          completedTasks: 15
        },
        {
          id: '2',
          name: 'App Quản lý Học tập',
          description: 'Ứng dụng mobile giúp sinh viên quản lý lịch học, bài tập và điểm số',
          status: 'testing',
          priority: 'medium',
          progress: 85,
          startDate: '2024-02-01',
          endDate: '2024-05-01',
          team: '2',
          teamName: 'Team App',
          assignedMembers: [
            { id: '4', name: 'Phạm Thị D', role: 'Team Lead' },
            { id: '5', name: 'Hoàng Văn E', role: 'Mobile Dev' }
          ],
          tags: ['React Native', 'Firebase'],
          budget: 30000000,
          totalTasks: 18,
          completedTasks: 16
        },
        {
          id: '3',
          name: 'Hệ thống CRM',
          description: 'Hệ thống quản lý khách hàng cho doanh nghiệp vừa và nhỏ',
          status: 'planning',
          priority: 'urgent',
          progress: 10,
          startDate: '2024-03-01',
          endDate: '2024-08-01',
          team: '1',
          teamName: 'Team Web',
          assignedMembers: [
            { id: '1', name: 'Nguyễn Văn A', role: 'Team Lead' }
          ],
          tags: ['Vue.js', 'Python', 'PostgreSQL'],
          budget: 80000000,
          totalTasks: 35,
          completedTasks: 3
        },
        {
          id: '4',
          name: 'Website Portfolio',
          description: 'Website giới thiệu doanh nghiệp và các dự án đã thực hiện',
          status: 'completed',
          priority: 'low',
          progress: 100,
          startDate: '2023-12-01',
          endDate: '2024-01-15',
          team: '1',
          teamName: 'Team Web',
          assignedMembers: [
            { id: '2', name: 'Trần Thị B', role: 'Frontend Dev' },
            { id: '3', name: 'Lê Văn C', role: 'Backend Dev' }
          ],
          tags: ['Next.js', 'Tailwind'],
          budget: 15000000,
          totalTasks: 12,
          completedTasks: 12
        }
      ];

      setProjects(mockProjects);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const handleCreateProject = () => {
    if (newProject.name.trim()) {
      const project: Project = {
        id: Date.now().toString(),
        ...newProject,
        progress: 0,
        teamName: newProject.team === '1' ? 'Team Web' : 'Team App',
        assignedMembers: [],
        tags: [],
        totalTasks: 0,
        completedTasks: 0
      };
      
      setProjects(prev => [...prev, project]);
      setNewProject({
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        startDate: '',
        endDate: '',
        team: '',
        budget: 0
      });
      setIsCreateModalOpen(false);
    }
  };

  // Calculate statistics
  const stats = {
    total: projects.length,
    active: projects.filter(p => ['planning', 'in_progress', 'testing'].includes(p.status)).length,
    completed: projects.filter(p => p.status === 'completed').length,
    onHold: projects.filter(p => p.status === 'on_hold').length,
    averageProgress: projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0
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

  return (
    <MainLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
              Quản lý Projects
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-1">
              Quản lý các dự án và theo dõi tiến độ thực hiện
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="neumorphic-button flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Tạo Project Mới</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📊</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.total}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  Tổng projects
                </p>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🚀</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.active}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  Đang thực hiện
                </p>
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
                  {stats.completed}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  Hoàn thành
                </p>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">⏸️</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.onHold}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  Tạm dừng
                </p>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📈</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.averageProgress}%
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  Tiến độ TB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="section-neumorphic p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
                placeholder="Tìm theo tên, mô tả, tag..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Trạng thái
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
              >
                <option value="all">Tất cả</option>
                <option value="planning">Lên kế hoạch</option>
                <option value="in_progress">Đang thực hiện</option>
                <option value="testing">Đang kiểm thử</option>
                <option value="completed">Hoàn thành</option>
                <option value="on_hold">Tạm dừng</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Độ ưu tiên
              </label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
              >
                <option value="all">Tất cả</option>
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
                <option value="urgent">Khẩn cấp</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setFilterPriority('all');
                  setSearchTerm('');
                }}
                className="w-full py-3 px-4 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="section-neumorphic p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--color-text-primary)] text-lg mb-1">
                    {project.name}
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm mb-2">
                    {project.teamName}
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <StatusBadge status={project.status} />
                  <PriorityBadge priority={project.priority} />
                </div>
              </div>

              {/* Project Description */}
              <p className="text-[var(--color-text-secondary)] text-sm mb-4 line-clamp-2">
                {project.description}
              </p>

              {/* Progress Bar */}
              <div className="mb-4">
                <ProgressBar progress={project.progress} />
              </div>

              {/* Project Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-[var(--color-text-primary)]">
                    {project.totalTasks}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Tổng tasks
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">
                    {project.completedTasks}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Hoàn thành
                  </p>
                </div>
              </div>

              {/* Assigned Members */}
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-[var(--color-text-secondary)] text-xs">Thành viên:</span>
                <div className="flex -space-x-2">
                  {project.assignedMembers.slice(0, 3).map((member) => (
                    <Avatar
                      key={member.id}
                      name={member.name}
                      className="border-2 border-white"
                    />
                  ))}
                  {project.assignedMembers.length > 3 && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold border-2 border-white">
                      +{project.assignedMembers.length - 3}
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      +{project.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Project Dates & Budget */}
              <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                <span>
                  {new Date(project.startDate).toLocaleDateString('vi-VN')} - {new Date(project.endDate).toLocaleDateString('vi-VN')}
                </span>
                {project.budget && (
                  <span className="font-medium">
                    {(project.budget / 1000000).toFixed(0)}M VNĐ
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="section-neumorphic p-12 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📁</span>
            </div>
            <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
              Không tìm thấy project nào
            </h3>
            <p className="text-[var(--color-text-secondary)] mb-4">
              Thử thay đổi bộ lọc hoặc tạo project mới
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="neumorphic-button"
            >
              Tạo Project Đầu Tiên
            </button>
          </div>
        )}

        {/* Create Project Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--color-background)] rounded-2xl p-6 w-full max-w-2xl section-neumorphic max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-6">
                Tạo Project Mới
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Tên project *
                  </label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
                    placeholder="Nhập tên project"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input resize-none"
                    rows={3}
                    placeholder="Nhập mô tả project"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={newProject.status}
                    onChange={(e) => setNewProject(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
                  >
                    <option value="planning">Lên kế hoạch</option>
                    <option value="in_progress">Đang thực hiện</option>
                    <option value="testing">Đang kiểm thử</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="on_hold">Tạm dừng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Độ ưu tiên
                  </label>
                  <select
                    value={newProject.priority}
                    onChange={(e) => setNewProject(prev => ({ ...prev, priority: e.target.value as any }))}
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
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => setNewProject(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Team
                  </label>
                  <select
                    value={newProject.team}
                    onChange={(e) => setNewProject(prev => ({ ...prev, team: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
                  >
                    <option value="">Chọn team</option>
                    <option value="1">Team Web</option>
                    <option value="2">Team App</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Ngân sách (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={newProject.budget}
                    onChange={(e) => setNewProject(prev => ({ ...prev, budget: Number(e.target.value) }))}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateProject}
                  className="flex-1 neumorphic-button"
                >
                  Tạo Project
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminProjectsPage;
