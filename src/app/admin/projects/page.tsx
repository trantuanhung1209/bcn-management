'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';

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
const StatusBadge: React.FC<{ status: 'planning' | 'in_progress' | 'testing' | 'completed' | 'on_hold' }> = ({ status }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200/60';
      case 'in_progress':
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200/60';
      case 'testing':
        return 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border-purple-200/60';
      case 'completed':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200/60';
      case 'on_hold':
        return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200/60';
      default:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200/60';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return '📋';
      case 'in_progress': return '⚡';
      case 'testing': return '🧪';
      case 'completed': return '✅';
      case 'on_hold': return '⏸️';
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
  coins?: number;
  totalTasks: number;
  completedTasks: number;
  isAssigned: boolean;
  manager?: string;
  managerName?: string;
  assignedAt?: string;
  acceptedAt?: string;
}

interface Team {
  id: string;
  name: string;
  description?: string;
  teamLeader: string;
  teamLeaderName: string;
  memberCount: number;
}

const AdminProjectsPage: React.FC = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignment, setFilterAssignment] = useState<string>('all'); // all, assigned, unassigned
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 9; // 3x3 grid

  // New project form state
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planning' as 'planning' | 'in_progress' | 'testing' | 'completed' | 'on_hold',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    startDate: '',
    endDate: '',
    team: '',
    coins: 0
  });

  // Fetch projects from API
  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      // Remove filter params - fetch all projects and filter client-side
      const response = await fetch('/api/projects');
      const result = await response.json();
      
      if (result.success) {
        // Transform API data to match component interface
        const transformedProjects = result.data.projects.map((project: any) => {
          return {
            id: project._id,
            name: project.name,
            description: project.description,
            status: project.status,
            priority: project.priority,
            progress: project.progress || 0,
            startDate: project.startDate.split('T')[0],
            endDate: project.endDate?.split('T')[0] || '',
            team: project.team,
            teamName: 'Loading...', // Will be updated after teams are loaded
            assignedMembers: project.assignedTo?.map((userId: string, index: number) => ({
              id: userId,
              name: `User ${index + 1}`,
              role: 'Member'
            })) || [],
            tags: project.tags || [],
            coins: project.coins,
            totalTasks: 0,
            completedTasks: 0,
            isAssigned: project.isAssigned || false,
            manager: project.manager,
            managerName: project.manager ? 'Manager Name' : undefined,
            assignedAt: project.assignedAt,
            acceptedAt: project.acceptedAt
          };
        });
        
        setProjects(transformedProjects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, []); // Remove filter dependencies to prevent re-fetching on filter changes

  // Fetch teams
  const fetchTeams = useCallback(async () => {
    try {
      const response = await fetch('/api/teams');
      const result = await response.json();
      
      if (result.success) {
        const transformedTeams = result.data.teams.map((team: any) => ({
          id: team._id,
          name: team.name,
          description: team.description,
          teamLeader: team.teamLeader,
          teamLeaderName: 'Team Leader Name', // You can fetch user details if needed
          memberCount: team.members.length + 1 // +1 for team leader
        }));
        
        setTeams(transformedTeams);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchTeams();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only fetch once on mount to avoid infinite loop

  // Map projects with correct team names using useMemo to avoid loops
  const projectsWithTeamNames = useMemo(() => {
    return projects.map(project => {
      const getTeamName = (teamId: string) => {
        if (!teamId) return 'Chưa có team';
        const team = teams.find(t => t.id === teamId);
        return team ? team.name : `Team ${teamId.slice(-6)}`;
      };

      return {
        ...project,
        teamName: getTeamName(project.team)
      };
    });
  }, [projects, teams]);

  // Filter projects
  const filteredProjects = projectsWithTeamNames.filter(project => {
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
    const matchesAssignment = filterAssignment === 'all' || 
                             (filterAssignment === 'assigned' && project.isAssigned) ||
                             (filterAssignment === 'unassigned' && !project.isAssigned);
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesPriority && matchesAssignment && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterPriority, filterAssignment, searchTerm]);

  const handleCreateProject = async () => {
    if (newProject.name.trim()) {
      try {
        const projectData = {
          name: newProject.name,
          description: newProject.description,
          status: newProject.status,
          priority: newProject.priority,
          startDate: newProject.startDate,
          endDate: newProject.endDate,
          team: newProject.team,
          coins: newProject.coins,
          createdBy: 'current-user-id', // Replace with actual user ID from auth
          tags: [],
          assignedTo: [],
          isAssigned: !!newProject.team, // Auto-assign if team is selected
          assignedAt: newProject.team ? new Date().toISOString() : undefined
        };

        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectData),
        });

        const result = await response.json();

        if (result.success) {
          // Reset form
          setNewProject({
            name: '',
            description: '',
            status: 'planning',
            priority: 'medium',
            startDate: '',
            endDate: '',
            team: '',
            coins: 0
          });
          setIsCreateModalOpen(false);
          
          // Refresh projects list
          fetchProjects();
        } else {
          console.error('Error creating project:', result.error);
          alert('Có lỗi xảy ra khi tạo project');
        }
      } catch (error) {
        console.error('Error creating project:', error);
        alert('Có lỗi xảy ra khi tạo project');
      }
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setNewProject({
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      startDate: project.startDate,
      endDate: project.endDate,
      team: project.team,
      coins: project.coins || 0
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateProject = async () => {
    if (editingProject && newProject.name.trim()) {
      try {
        const projectData = {
          name: newProject.name,
          description: newProject.description,
          status: newProject.status,
          priority: newProject.priority,
          startDate: newProject.startDate,
          endDate: newProject.endDate,
          team: newProject.team,
          coins: newProject.coins,
          isAssigned: !!newProject.team, // Auto-assign if team is selected
          assignedAt: newProject.team && !editingProject.isAssigned ? new Date().toISOString() : editingProject.assignedAt
        };

        const response = await fetch(`/api/projects/${editingProject.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectData),
        });

        const result = await response.json();

        if (result.success) {
          // Reset form
          setNewProject({
            name: '',
            description: '',
            status: 'planning',
            priority: 'medium',
            startDate: '',
            endDate: '',
            team: '',
            coins: 0
          });
          setIsEditModalOpen(false);
          setEditingProject(null);
          
          // Refresh projects list
          fetchProjects();
        } else {
          console.error('Error updating project:', result.error);
          alert('Có lỗi xảy ra khi cập nhật project');
        }
      } catch (error) {
        console.error('Error updating project:', error);
        alert('Có lỗi xảy ra khi cập nhật project');
      }
    }
  };

  const handleDeleteProject = (project: Project) => {
    setDeletingProject(project);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (deletingProject) {
      try {
        const response = await fetch(`/api/projects/${deletingProject.id}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (result.success) {
          setIsDeleteModalOpen(false);
          setDeletingProject(null);
          
          // Refresh projects list
          fetchProjects();
        } else {
          console.error('Error deleting project:', result.error);
          alert('Có lỗi xảy ra khi xóa project');
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Có lỗi xảy ra khi xóa project');
      }
    }
  };

  // Handle assign project to team
  const handleAssignProject = (project: Project) => {
    setSelectedProject(project);
    setShowAssignModal(true);
  };

  const confirmAssignProject = async () => {
    if (selectedProject && selectedTeamId) {
      try {
        const response = await fetch('/api/projects/assign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId: selectedProject.id,
            teamId: selectedTeamId
          }),
        });

        const result = await response.json();

        if (result.success) {
          setShowAssignModal(false);
          setSelectedProject(null);
          setSelectedTeamId('');
          
          // Refresh projects list
          fetchProjects();
          
          alert('Project đã được gán cho team thành công!');
        } else {
          console.error('Error assigning project:', result.error);
          alert('Có lỗi xảy ra khi gán project: ' + result.error);
        }
      } catch (error) {
        console.error('Error assigning project:', error);
        alert('Có lỗi xảy ra khi gán project');
      }
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

        {/* Filters */}
        <div className="section-neumorphic p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 neumorphic-input rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
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
                className="w-full px-3 py-2 neumorphic-input rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
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
                className="w-full px-3 py-2 neumorphic-input rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
              >
                <option value="all">Tất cả</option>
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
                <option value="urgent">Khẩn cấp</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Gán team
              </label>
              <select
                value={filterAssignment}
                onChange={(e) => setFilterAssignment(e.target.value)}
                className="w-full px-3 py-2 neumorphic-input rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
              >
                <option value="all">Tất cả</option>
                <option value="unassigned">Chưa gán</option>
                <option value="assigned">Đã gán</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setFilterPriority('all');
                  setFilterAssignment('all');
                  setSearchTerm('');
                }}
                className="w-full py-3 px-4 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200 cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {currentProjects.map((project) => (
            <div
              key={project.id}
              className="relative group"
              onClick={() => router.push(`/admin/projects/${project.id}`)}
            >
              {/* Main Card - Compact Version */}
              <div className="section-neumorphic bg-white rounded-2xl border border-gray-100/50 hover:border-blue-200/60 transition-all duration-500 cursor-pointer overflow-hidden hover:shadow-xl hover:shadow-blue-100/20 transform hover:-translate-y-1">
                
                {/* Status Header - Smaller */}
                <div className="relative">
                  <div className={`h-1.5 w-full ${
                    project.status === 'completed' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                    project.status === 'in_progress' ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                    project.status === 'testing' ? 'bg-gradient-to-r from-purple-400 to-indigo-500' :
                    project.status === 'on_hold' ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                    'bg-gradient-to-r from-yellow-400 to-orange-500'
                  }`} />
                  
                  {/* Header Content - Compact */}
                  <div className="p-4 pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        {/* Project Title & Badges */}
                        <div className="flex items-start gap-2 mb-1.5">
                          <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors duration-300 flex-1 min-w-0 line-clamp-1">
                            {project.name}
                          </h3>
                          <div className="flex gap-1 flex-shrink-0">
                            <PriorityBadge priority={project.priority} />
                          </div>
                        </div>
                        
                        {/* Team Info */}
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium truncate">{project.teamName}</span>
                        </div>
                      </div>
                      
                      {/* Action Buttons - Smaller */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        {!project.isAssigned && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssignProject(project);
                            }}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110 cursor-pointer"
                            title="Gán cho team"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProject(project);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110 cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 cursor-pointer"
                          title="Xóa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Body - Compact */}
                <div className="px-4">
                  {/* Description */}
                  <p className="text-gray-600 text-xs mb-4 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Progress Section */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                        <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        Tiến độ
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-800">{project.progress}%</span>
                        <StatusBadge status={project.status} />
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative">
                      <div className="w-full bg-gray-100 rounded-full h-2 shadow-inner">
                        <div 
                          className={`h-2 rounded-full transition-all duration-700 ease-out shadow-sm ${
                            project.progress >= 80 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                            project.progress >= 50 ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                            project.progress >= 20 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                            'bg-gradient-to-r from-gray-300 to-gray-400'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid - Compact */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-2.5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100/50">
                      <div className="text-lg font-bold text-blue-600 mb-0.5">{project.totalTasks}</div>
                      <div className="text-xs text-blue-500 font-medium uppercase tracking-wide">Tasks</div>
                    </div>
                    <div className="text-center p-2.5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100/50">
                      <div className="text-lg font-bold text-green-600 mb-0.5">{project.completedTasks}</div>
                      <div className="text-xs text-green-500 font-medium uppercase tracking-wide">Hoàn thành</div>
                    </div>
                  </div>

                  {/* Tags - Compact */}
                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-md text-xs font-semibold border border-blue-200/50"
                        >
                          #{tag}
                        </span>
                      ))}
                      {project.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 rounded-md text-xs font-semibold border border-gray-200/50">
                          +{project.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer - Compact */}
                <div className="px-4 py-3 bg-gradient-to-r from-gray-50/50 to-gray-100/30 border-t border-gray-100/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium">
                        {new Date(project.endDate).toLocaleDateString('vi-VN', { 
                          day: '2-digit', 
                          month: 'short'
                        })}
                      </span>
                    </div>
                    
                    {project.coins && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-full border border-yellow-200/50">
                        <svg className="w-3 h-3 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-bold text-yellow-700">
                          {project.coins.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-8 space-x-3">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 shadow-sm '
              }`}
            >
              ← Trước
            </button>

            {/* Page Numbers */}
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first, last, current, and pages around current
                const showPage = 
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1);
                
                const showEllipsis = 
                  (page === 2 && currentPage > 4) || 
                  (page === totalPages - 1 && currentPage < totalPages - 3);

                if (!showPage && !showEllipsis) return null;

                if (showEllipsis) {
                  return (
                    <span
                      key={`ellipsis-${page}`}
                      className="px-3 py-2 text-gray-400 text-sm"
                    >
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                      currentPage === page
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200/50 scale-105'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 shadow-sm hover:scale-105'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 shadow-sm'
              }`}
            >
              Tiếp →
            </button>
          </div>
        )}

        {/* Empty State */}
        {currentProjects.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-gray-100/50 section-neumorphic">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có project nào</h3>
            <p className="text-gray-500 mb-6">Hãy tạo project đầu tiên của bạn</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
            >
              Tạo Project Mới
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
                    className="w-full px-3 py-2 neumorphic-input rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
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
                    className="w-full px-3 py-2 neumorphic-input rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input resize-none"
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
                    className="w-full px-3 py-2 neumorphic-input rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
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
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 neumorphic-input rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
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
                    className="w-full px-3 py-2 neumorphic-input rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Team (tùy chọn)
                  </label>
                  <select
                    value={newProject.team}
                    onChange={(e) => setNewProject(prev => ({ ...prev, team: e.target.value }))}
                    className="w-full px-3 py-2 neumorphic-input rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
                  >
                    <option value="">Chọn team (tùy chọn)</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.memberCount} thành viên)
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    Có thể gán team sau bằng nút &quot;Gán cho team&quot; trên project card
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Coins
                  </label>
                  <input
                    type="number"
                    value={newProject.coins}
                    onChange={(e) => setNewProject(prev => ({ ...prev, coins: Number(e.target.value) }))}
                    className="w-full px-3 py-2 neumorphic-input rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200 cursor-pointer"
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

        {/* Edit Project Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--color-background)] rounded-2xl p-6 w-full max-w-2xl section-neumorphic max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-6">
                Chỉnh Sửa Project
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
                    className="w-full px-3 py-2 neumorphic-input rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
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
                    className="w-full px-3 py-2 neumorphic-input rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input resize-none"
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
                    className="w-full px-3 py-2 neumorphic-input rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
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
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 neumorphic-input rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
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
                    className="w-full px-3 py-2 neumorphic-input rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Team (tùy chọn)
                  </label>
                  <select
                    value={newProject.team}
                    onChange={(e) => setNewProject(prev => ({ ...prev, team: e.target.value }))}
                    className="w-full px-3 py-2 neumorphic-input rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
                  >
                    <option value="">Chọn team (tùy chọn)</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.memberCount} thành viên)
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    Có thể gán team sau bằng nút &quot;Gán cho team&quot; trên project card
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Coins
                  </label>
                  <input
                    type="number"
                    value={newProject.coins}
                    onChange={(e) => setNewProject(prev => ({ ...prev, coins: Number(e.target.value) }))}
                    className="w-full px-3 py-2 neumorphic-input rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingProject(null);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-200 text-gray-700  cursor-pointer font-medium hover:bg-gray-300 transition-colors duration-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateProject}
                  className="flex-1 neumorphic-button"
                >
                  Cập Nhật
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && deletingProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--color-background)] rounded-2xl p-6 w-full max-w-md section-neumorphic">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
                  Xác nhận xóa project
                </h3>
                <p className="text-[var(--color-text-secondary)] mb-6">
                  Bạn có chắc chắn muốn xóa project &quot;{deletingProject.name}&quot;? 
                  Hành động này không thể hoàn tác.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setDeletingProject(null);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-gray-200 text-gray-700 cursor-pointer font-medium hover:bg-gray-300 transition-colors duration-200"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmDeleteProject}
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

      {/* Assignment Modal */}
      {showAssignModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-background)] rounded-2xl p-8 max-w-md w-full mx-4 neumorphic-element">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                Gán dự án cho team
              </h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                {selectedProject.name}
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                {selectedProject.description}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-3">
                Chọn team
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full px-3 py-2 neumorphic-input rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
              >
                <option value="">Chọn team...</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.memberCount} thành viên)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={confirmAssignProject}
                disabled={!selectedTeamId}
                className="flex-1 py-3 px-4 rounded-xl bg-[var(--color-accent)] text-white font-medium hover:bg-[var(--color-accent-hover)] transition-colors duration-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                Gán project
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default AdminProjectsPage;
