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

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskHistory, setTaskHistory] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false); // Track if initial data is loaded
  const [activeTab, setActiveTab] = useState<'tasks' | 'history'>('tasks'); // Tab state
  
  // Create task modal states
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    assignedTo: '',
    dueDate: '',
    estimatedHours: ''
  });
  
  // Edit task modal states
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    assignedTo: '',
    dueDate: '',
    estimatedHours: '',
    status: 'todo' as 'todo' | 'in_progress' | 'completed' | 'cancelled'
  });

  // Delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Fetch task history
  const fetchTaskHistory = useCallback(async () => {
    try {
      const response = await fetch(`/api/tasks/history?project=${projectId}`);
      const result = await response.json();
      
      if (result.success) {
        setTaskHistory(result.data.history);
      }
    } catch (error) {
      console.error('Error fetching task history:', error);
    }
  }, [projectId]);

  // Fetch project details
  const fetchProject = useCallback(async () => {
    try {
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
          teamName: 'Team Web Development',
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
    }
  }, [projectId]);

  // Fetch project tasks - ONLY called once when project is loaded
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
        
        // Update project task counts - but don't cause re-render loop
        setProject(prev => {
          if (!prev) return null;
          
          const totalTasks = transformedTasks.length;
          const completedTasks = transformedTasks.filter((task: Task) => task.status === 'completed').length;
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          
          return {
            ...prev,
            totalTasks,
            completedTasks,
            progress
          };
        });
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, [projectId]); // Only depend on projectId, not project

  // Fetch team members - ONLY called once when project is loaded
  const fetchTeamMembers = useCallback(async (teamId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/members`);
      const result = await response.json();
      
      if (result.success) {
        // Transform the data to have 'id' field instead of '_id'
        const transformedMembers = (result.data || []).map((member: any) => ({
          id: member._id,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          role: member.role,
          isTeamLeader: member.isTeamLeader
        }));
        setTeamMembers(transformedMembers);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  }, []);

  // Create new task
  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      alert('Vui lòng nhập tiêu đề task');
      return;
    }

    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        assignedTo: newTask.assignedTo || undefined,
        dueDate: newTask.dueDate || undefined,
        estimatedHours: newTask.estimatedHours ? parseInt(newTask.estimatedHours) : undefined,
        project: projectId,
        status: 'todo'
      };

      const response = await fetch('/api/team_leader/tasks', {
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
          dueDate: '',
          estimatedHours: ''
        });
        setIsCreateTaskModalOpen(false);
        
        // Refresh tasks list
        fetchTasks();
        alert('Tạo task thành công!');
      } else {
        alert(result.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  };

  // Open edit task modal
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setEditTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      assignedTo: task.assignedTo || '',
      dueDate: task.dueDate || '',
      estimatedHours: '',
      status: task.status
    });
    setIsEditTaskModalOpen(true);
  };

  // Update task
  const handleUpdateTask = async () => {
    if (!editingTask || !editTask.title.trim()) {
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
      };

      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      const result = await response.json();

      if (result.success) {
        setIsEditTaskModalOpen(false);
        setEditingTask(null);
        
        // Refresh tasks list
        fetchTasks();
        alert('Cập nhật task thành công!');
      } else {
        alert(result.error || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  };

  // Open delete confirmation modal
  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete task
  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      // Permanently delete from database
      const response = await fetch(`/api/tasks/${taskToDelete.id}?permanent=true`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setIsDeleteModalOpen(false);
        setTaskToDelete(null);
        
        // Refresh tasks list and history
        fetchTasks();
        fetchTaskHistory();
        alert('Xóa task thành công!');
      } else {
        alert(result.error || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  // Load project data when component mounts
  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId, fetchProject]);

  // Load tasks and team members when project is loaded - ONLY ONCE
  useEffect(() => {
    if (project && project.team && !dataLoaded) {
      fetchTasks();
      fetchTeamMembers(project.team);
      fetchTaskHistory();
      setDataLoaded(true);
    }
  }, [project, fetchTasks, fetchTeamMembers, fetchTaskHistory, dataLoaded]);

  useEffect(() => {
    setIsLoading(false);
  }, [project]);

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
        </div>

        {/* Project Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div key="progress-card" className="section-neumorphic bg-white rounded-2xl border border-blue-100/50 p-6">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">Tiến độ</h3>
            <p className="text-3xl font-bold text-blue-600 mb-2">{project.progress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>
          
          <div key="tasks-card" className="section-neumorphic bg-white rounded-2xl border border-green-100/50 p-6">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">Tasks hoàn thành</h3>
            <p className="text-3xl font-bold text-green-600">{project.completedTasks}</p>
            <p className="text-sm text-gray-500">/ {project.totalTasks} tasks</p>
          </div>
          
          <div key="coins-card" className="section-neumorphic bg-white rounded-2xl border border-yellow-100/50 p-6">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">Coins</h3>
            <p className="text-3xl font-bold text-yellow-600">{project.coins}</p>
          </div>
          
          <div key="team-card" className="section-neumorphic bg-white rounded-2xl border border-purple-100/50 p-6">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">Team</h3>
            <p className="text-lg font-bold text-purple-600">{project.teamName}</p>
            <p className="text-sm text-gray-500">{teamMembers.length} thành viên</p>
          </div>
        </div>

        {/* Tasks List */}
        <div className="section-neumorphic p-6">
          {/* Tab Headers */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-6">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2 font-medium transition-colors duration-200 ${
                  activeTab === 'tasks'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Tasks Hiện Tại ({tasks.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 font-medium transition-colors duration-200 ${
                  activeTab === 'history'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Lịch Sử Tasks ({taskHistory.length})
              </button>
            </div>
            {activeTab === 'tasks' && (
              <button
                onClick={() => setIsCreateTaskModalOpen(true)}
                className="neumorphic-button px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tạo Task
              </button>
            )}
          </div>
          
          {/* Tab Content */}
          {activeTab === 'tasks' ? (
            // Current Tasks Table
            tasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Chưa có task nào được tạo</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Task</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Trạng thái</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Ưu tiên</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Người thực hiện</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Hạn hoàn thành</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                        <td className="py-4 px-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                            {task.description && (
                              <p className="text-gray-600 text-sm">{task.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            task.status === 'completed' ? 'bg-green-100 text-green-700' :
                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                            task.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {task.status === 'todo' ? 'Chưa bắt đầu' :
                             task.status === 'in_progress' ? 'Đang thực hiện' :
                             task.status === 'completed' ? 'Hoàn thành' :
                             task.status === 'cancelled' ? 'Đã hủy' : task.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
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
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-blue-600 text-sm font-medium">
                                {task.assignedToName === 'Chưa gán' ? '?' : task.assignedToName?.charAt(0) || '?'}
                              </span>
                            </div>
                            <span className="text-gray-700">{task.assignedToName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {task.dueDate ? (
                            <div>
                              <span className="text-gray-700">{task.dueDate}</span>
                              {new Date(task.dueDate) < new Date() && task.status !== 'completed' && (
                                <span className="ml-2 text-red-500 text-sm">Quá hạn</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">Chưa đặt hạn</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditTask(task)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                              title="Chỉnh sửa"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                              title="Xóa"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            // Task History Table
            taskHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Chưa có lịch sử task nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Task</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Hành động</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Người thực hiện</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Thời gian</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taskHistory.map((historyItem, index) => (
                      <tr key={`${historyItem.id}-${historyItem.action}-${index}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                        <td className="py-4 px-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{historyItem.title}</h3>
                            {historyItem.description && (
                              <p className="text-gray-600 text-sm">{historyItem.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            historyItem.action === 'created' ? 'bg-green-100 text-green-700' :
                            historyItem.action === 'updated' ? 'bg-blue-100 text-blue-700' :
                            historyItem.action === 'deleted' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {historyItem.action === 'created' ? 'Tạo mới' :
                             historyItem.action === 'updated' ? 'Cập nhật' :
                             historyItem.action === 'deleted' ? 'Xóa' : historyItem.action}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-blue-600 text-sm font-medium">
                                {historyItem.actionByName?.charAt(0) || '?'}
                              </span>
                            </div>
                            <span className="text-gray-700">{historyItem.actionByName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-700">
                            {new Date(historyItem.actionAt).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col space-y-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              historyItem.status === 'completed' ? 'bg-green-100 text-green-700' :
                              historyItem.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                              historyItem.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {historyItem.status === 'todo' ? 'Chưa bắt đầu' :
                               historyItem.status === 'in_progress' ? 'Đang thực hiện' :
                               historyItem.status === 'completed' ? 'Hoàn thành' :
                               historyItem.status === 'cancelled' ? 'Đã hủy' : historyItem.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              historyItem.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                              historyItem.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                              historyItem.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {historyItem.priority === 'urgent' ? 'Khẩn cấp' :
                               historyItem.priority === 'high' ? 'Cao' :
                               historyItem.priority === 'medium' ? 'Trung bình' :
                               'Thấp'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {isCreateTaskModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Tạo Task Mới</h3>
              <button
                onClick={() => setIsCreateTaskModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
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
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  placeholder="Nhập tiêu đề task..."
                />
              </div>

              {/* Task Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 h-24 resize-none"
                  placeholder="Mô tả chi tiết task..."
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mức độ ưu tiên
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>

              {/* Estimated Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian ước tính (giờ)
                </label>
                <input
                  type="number"
                  value={newTask.estimatedHours}
                  onChange={(e) => setNewTask({ ...newTask, estimatedHours: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  placeholder="Nhập số giờ..."
                  min="1"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setIsCreateTaskModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!newTask.title.trim()}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Tạo Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {isEditTaskModalOpen && editingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Chỉnh sửa Task</h3>
              <button
                onClick={() => setIsEditTaskModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
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
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 h-24 resize-none"
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
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  placeholder="Nhập số giờ..."
                  min="1"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setIsEditTaskModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateTask}
                disabled={!editTask.title.trim()}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && taskToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Xác nhận xóa</h3>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600">
                Bạn có chắc chắn muốn xóa task <strong>&ldquo;{taskToDelete.title}&rdquo;</strong>?
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
                onClick={confirmDeleteTask}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors duration-200"
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