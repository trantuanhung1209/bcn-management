'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { TaskStatus, TaskPriority } from '@/types';
import { ProgressRing } from '@/components/ui/Charts';

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
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<{day: number, month: number, year: number} | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Thank you toast states
  const [showThankYouToast, setShowThankYouToast] = useState(false);
  const [completedTaskTitle, setCompletedTaskTitle] = useState('');
  const [teamLeaderName, setTeamLeaderName] = useState('');

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
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskProgress = async (taskId: string, newProgress: number) => {
    try {
      // Find the task being updated
      const currentTask = dashboardData?.todayTasks.find(t => t._id === taskId);
      
      // Show thank you toast when task is completed (progress = 100)
      if (newProgress === 100 && currentTask && currentTask.progress < 100) {
        setCompletedTaskTitle(currentTask.title);
        // We don't have assignedBy in the current data, so we'll use a generic team leader name
        setTeamLeaderName('Team Leader');
        setShowThankYouToast(true);
        
        // Auto hide toast after 5 seconds
        setTimeout(() => {
          setShowThankYouToast(false);
        }, 5000);
      }
      
      setDashboardData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          todayTasks: prev.todayTasks.map(task => 
            task._id === taskId ? { ...task, progress: newProgress } : task
          )
        };
      });

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
    } catch (err) {
      console.error('Update progress error:', err);
      await fetchDashboardData();
    }
  };

  // Function to handle day click
  const handleDayClick = (day: number) => {
    setSelectedDate({
      day: day,
      month: currentMonth + 1,
      year: currentYear
    });
    setShowDayModal(true);
  };

  // Function to navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  // Get all tasks with deadlines for calendar
  const getTasksWithDeadlines = () => {
    if (!dashboardData) return [];
    
    // Combine all tasks from different sources
    const allTasks = [
      ...dashboardData.todayTasks,
      // You might need to add more task sources here if available
    ];
    
    return allTasks.filter(task => task.dueDate).map(task => ({
      id: task._id,
      title: task.title,
      deadline: new Date(task.dueDate!),
      status: task.status,
      priority: task.priority,
      progress: task.progress,
      project: task.project
    }));
  };

  // Get events for specific day - only task deadlines
  const getEventsForDay = (day: number, month: number, year: number) => {
    const tasks = getTasksWithDeadlines();
    const events: any[] = [];
    
    tasks.forEach(task => {
      const deadlineDate = task.deadline;
      if (deadlineDate && 
          deadlineDate.getDate() === day && 
          deadlineDate.getMonth() === month && 
          deadlineDate.getFullYear() === year) {
        events.push({
          type: 'deadline',
          title: `Deadline: ${task.title}`,
          time: '23:59',
          status: task.status,
          priority: task.priority,
          progress: task.progress,
          project: task.project,
          description: `Task deadline for ${task.title}`
        });
      }
    });

    return events;
  };

  // Check if day has events
  const dayHasEvents = (day: number, month: number, year: number) => {
    const events = getEventsForDay(day, month, year);
    return events.length > 0;
  };

  // Get calendar days for current month
  const getCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();
    
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true
      });
    }
    
    // Next month days to fill the grid
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  // Get day tasks for modal
  const getDayTasks = (day: number) => {
    if (!selectedDate) return [];
    return getEventsForDay(day, selectedDate.month - 1, selectedDate.year);
  };

  // Function to get project name from project ID
  const getProjectName = (projectId: string) => {
    if (!projectId) return 'Không có dự án';
    
    if (!dashboardData || !dashboardData.projects || dashboardData.projects.length === 0) {
      console.log('No dashboard data or projects available');
      return 'Dự án không xác định';
    }
    
    // Log để debug
    console.log('Finding project for ID:', projectId);
    console.log('Available projects:', dashboardData.projects);
    
    const project = dashboardData.projects.find(p => 
      p._id === projectId || 
      p._id?.toString() === projectId ||
      String(p._id) === String(projectId)
    );
    
    if (project) {
      console.log('Found project:', project.name);
      return project.name;
    } else {
      console.log('Project not found, available project IDs:', dashboardData.projects.map(p => p._id));
      return `Dự án (${projectId.substring(0, 8)}...)`;
    }
  };

  if (isLoading) {
    return (
      <MainLayout userRole="member">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !dashboardData) {
    return (
      <MainLayout userRole="member">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Không có dữ liệu'}</p>
            <button 
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Thử lại
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const completionRate = dashboardData.stats.assignedTasks > 0 
    ? Math.round((dashboardData.stats.completedTasks / dashboardData.stats.assignedTasks) * 100)
    : 0;

  // Function to get greeting based on time of day
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return { text: 'Chào buổi sáng', emoji: '🌅' };
    } else if (hour >= 12 && hour < 17) {
      return { text: 'Chào buổi chiều', emoji: '☀️' };
    } else if (hour >= 17 && hour < 21) {
      return { text: 'Chào buổi tối', emoji: '🌆' };
    } else {
      return { text: 'Chào buổi đêm', emoji: '🌙' };
    }
  };

  const greeting = getTimeBasedGreeting();

  return (
    <MainLayout userRole="member">
      <div className="space-y-6">
        {/* Simple Header */}
        <div className="section-neumorphic p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Avatar Circle */}
              <div className="section-neumorphic w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {greeting.emoji}
              </div>
              
              <div>
                <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  {greeting.text}, {dashboardData.user.name} 
                </h1>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  {new Date().toLocaleDateString('vi-VN', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center space-x-2">
              <div className="section-neumorphic px-2 py-1 bg-white rounded-lg">
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-green-600 font-bold">{dashboardData.stats.completedTasks}</span>
                  <span className="text-xs text-[var(--color-text-secondary)]">hoàn thành</span>
                </div>
              </div>
              <div className="section-neumorphic px-2 py-1 bg-white rounded-lg">
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-blue-600 font-bold">{dashboardData.stats.inProgressTasks}</span>
                  <span className="text-xs text-[var(--color-text-secondary)]">đang làm</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Today's Tasks & Calendar */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Today's Tasks */}
            <div className="section-neumorphic p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Danh sách tasks cần làm</h2>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {dashboardData.todayTasks.filter(t => t.progress === 100).length}/{dashboardData.todayTasks.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {dashboardData.todayTasks.length > 0 ? (
                  dashboardData.todayTasks.map((task) => (
                    <div key={task._id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border-l-4 border-blue-400 hover:shadow-md transition-shadow">
                      <div className="flex-1">
                        <h3 className="font-medium text-[var(--color-text-primary)]">{task.title}</h3>
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-blue-600 font-medium">{task.progress}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateTaskProgress(task._id, Math.min(100, task.progress + 25))}
                          className="text-sm px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 cursor-pointer transition-colors"
                          disabled={task.progress === 100}
                        >
                          +25%
                        </button>
                        {task.progress < 100 && (
                          <button
                            onClick={() => updateTaskProgress(task._id, 100)}
                            className="text-sm px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 cursor-pointer transition-colors"
                          >
                            Hoàn thành
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-[var(--color-text-secondary)]">
                    <span className="text-4xl block mb-2">🎉</span>
                    <p>Không có task nào hôm nay</p>
                  </div>
                )}
              </div>
            </div>

            {/* Task Calendar & Deadlines */}
            <div className="section-neumorphic p-6">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">
                📅 Lịch theo dõi task deadlines
              </h2>
              
              {/* Calendar and Deadlines Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Mini Calendar */}
                <div className="section-neumorphic p-4 bg-gradient-to-br from-white to-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                      {new Date(currentYear, currentMonth).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => navigateMonth('prev')}
                        className="section-neumorphic p-2 text-gray-600 hover:text-blue-600 hover:scale-110 transition-all duration-200 bg-white rounded-lg cursor-pointer"
                      >
                        ←
                      </button>
                      <button 
                        onClick={() => navigateMonth('next')}
                        className="section-neumorphic p-2 text-gray-600 hover:text-blue-600 hover:scale-110 transition-all duration-200 bg-white rounded-lg cursor-pointer"
                      >
                        →
                      </button>
                    </div>
                  </div>
                  
                  {/* Compact Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Day headers */}
                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                      <div key={day} className="text-center p-1 text-xs font-bold text-[var(--color-text-secondary)]">
                        {day}
                      </div>
                    ))}
                    
                    {/* Calendar days */}
                    {getCalendarDays().map((dayData, index) => {
                      const today = new Date();
                      const isToday = dayData.day === today.getDate() && 
                                     dayData.month === today.getMonth() && 
                                     dayData.year === today.getFullYear();
                      const hasEvent = dayHasEvents(dayData.day, dayData.month, dayData.year);
                      const isCurrentMonth = dayData.isCurrentMonth;
                      
                      return (
                        <div 
                          key={index} 
                          onClick={() => isCurrentMonth ? handleDayClick(dayData.day) : null}
                          className={`
                            relative p-2 text-xs font-medium text-center cursor-pointer rounded-lg transition-all duration-300
                            ${isCurrentMonth ? 'hover:scale-105 hover:shadow-md transform' : 'cursor-default'}
                            ${isToday 
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30 scale-105' 
                              : isCurrentMonth 
                                ? 'section-neumorphic bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50' 
                                : 'text-gray-300'
                            }
                            ${hasEvent && isCurrentMonth ? 'ring-1 ring-green-400 ring-opacity-50' : ''}
                          `}
                        >
                          <span className={`${hasEvent && isCurrentMonth ? 'font-bold' : ''}`}>
                            {dayData.day}
                          </span>
                          
                          {/* Event indicator */}
                          {hasEvent && isCurrentMonth && (
                            <div className="absolute top-0.5 right-0.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                isToday ? 'bg-white shadow-sm' : 'bg-gradient-to-r from-green-400 to-green-500 shadow-sm'
                              }`}></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Compact Calendar Stats */}
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="section-neumorphic p-2 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
                      <div className="text-sm font-bold text-blue-600">
                        {dashboardData.stats.assignedTasks}
                      </div>
                      <div className="text-xs text-blue-500">Tasks</div>
                    </div>
                    <div className="section-neumorphic p-2 text-center bg-gradient-to-br from-green-50 to-emerald-50">
                      <div className="text-sm font-bold text-green-600">
                        {dashboardData.stats.completedTasks}
                      </div>
                      <div className="text-xs text-green-500">Hoàn thành</div>
                    </div>
                    <div className="section-neumorphic p-2 text-center bg-gradient-to-br from-purple-50 to-violet-50">
                      <div className="text-sm font-bold text-purple-600">
                        {dashboardData.stats.overdueTasks}
                      </div>
                      <div className="text-xs text-purple-500">Quá hạn</div>
                    </div>
                  </div>
                </div>

                {/* Upcoming Deadlines */}
                <div className="section-neumorphic p-4 bg-gradient-to-br from-white to-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-semibold text-[var(--color-text-primary)] flex items-center">
                      ⏰ Deadline sắp tới
                    </h4>
                    <span className="text-xs text-[var(--color-text-secondary)] bg-gray-100 px-2 py-1 rounded-full">
                      {getTasksWithDeadlines().filter(task => {
                        const daysUntilDeadline = Math.ceil((task.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        return daysUntilDeadline >= 0 && daysUntilDeadline <= 7;
                      }).length} deadline
                    </span>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {getTasksWithDeadlines()
                      .filter(task => {
                        const daysUntilDeadline = Math.ceil((task.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        return daysUntilDeadline >= 0 && daysUntilDeadline <= 7;
                      })
                      .slice(0, 4)
                      .map((task, index) => {
                        const daysUntilDeadline = Math.ceil((task.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        return (
                          <div
                            key={index}
                            className="section-neumorphic p-3 bg-gradient-to-r from-white to-gray-50 border-l-4 border-red-400 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-sm text-[var(--color-text-primary)]">
                                {task.title}
                              </h5>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                daysUntilDeadline === 0 
                                  ? 'bg-red-100 text-red-700' 
                                  : daysUntilDeadline <= 2 
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {daysUntilDeadline === 0 ? 'Hôm nay' : `${daysUntilDeadline} ngày`}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-[var(--color-text-secondary)]">
                                  {getProjectName(task.project)}
                                </span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  task.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                                  task.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-green-100 text-green-600'
                                }`}>
                                  {task.priority === 'urgent' ? 'Khẩn cấp' :
                                   task.priority === 'high' ? 'Cao' :
                                   task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <div className="w-12 bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full"
                                    style={{ width: `${task.progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-blue-600 font-medium">{task.progress}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    
                    {getTasksWithDeadlines().filter(task => {
                      const daysUntilDeadline = Math.ceil((task.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      return daysUntilDeadline >= 0 && daysUntilDeadline <= 7;
                    }).length === 0 && (
                      <div className="text-center py-6">
                        <div className="text-gray-400 text-2xl mb-2">🎯</div>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          Không có deadline trong 7 ngày tới
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance & Activity */}
          <div className="space-y-6">
            
            {/* Performance Chart */}
            <div className="section-neumorphic p-6">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Hiệu suất làm việc</h3>
              <div className="text-center">
                <ProgressRing 
                  progress={completionRate}
                  size={100}
                  color="#10B981"
                />
                <div className="mt-3">
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {completionRate}%
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)]">Tỷ lệ hoàn thành</p>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">Hoàn thành</span>
                  <span className="font-medium text-[var(--color-text-primary)]">{dashboardData.stats.completedTasks}/{dashboardData.stats.assignedTasks}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">Tasks tháng này</span>
                  <span className="font-medium text-[var(--color-text-primary)]">{dashboardData.performance.completedThisMonth}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">Tốc độ hoàn thành</span>
                  <span className="font-medium text-[var(--color-text-primary)]">{dashboardData.performance.averageCompletionDays} ngày</span>
                </div>
                {dashboardData.performance.monthlyGrowthPercentage !== 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">So với tháng trước</span>
                    <span className={`font-medium ${dashboardData.performance.monthlyGrowthPercentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {dashboardData.performance.monthlyGrowthPercentage > 0 ? '+' : ''}{dashboardData.performance.monthlyGrowthPercentage}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="section-neumorphic p-6">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Hoạt động gần đây</h3>
              <div className="space-y-3">
                {dashboardData.recentActivity.slice(0, 3).map((activity) => (
                  <div key={activity._id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border-l-4 border-green-400">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-[var(--color-text-primary)]">{activity.title}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {new Date(activity.updatedAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))}
                
                {dashboardData.recentActivity.length === 0 && (
                  <p className="text-center text-[var(--color-text-secondary)] py-4">Chưa có hoạt động nào</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Day Tasks Modal */}
        {showDayModal && selectedDate && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] mx-4 section-neumorphic shadow-2xl">
              {/* Header */}
              <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center">
                      📅 Tasks ngày {selectedDate.day}/{selectedDate.month}/{selectedDate.year}
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                      {new Date(selectedDate.year, selectedDate.month - 1, selectedDate.day)
                        .toLocaleDateString('vi-VN', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })
                      }
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowDayModal(false)}
                    className="section-neumorphic p-2 text-gray-500 hover:text-gray-700 hover:scale-105 transition-all duration-200 bg-white rounded-full cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[55vh]">
                {(() => {
                  const dayTasks = getDayTasks(selectedDate.day);
                  return dayTasks.length > 0 ? (
                    <div className="space-y-4">
                      {dayTasks.map((task, index) => (
                        <div 
                          key={index}
                          className="section-neumorphic p-4 bg-gradient-to-r from-white to-gray-50 border-l-4 border-red-400 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">
                                {task.title.replace('Deadline: ', '')}
                              </h3>
                              <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                                {task.description}
                              </p>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                  {getProjectName(task.project)}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  task.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                                  task.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-green-100 text-green-600'
                                }`}>
                                  {task.priority === 'urgent' ? 'Khẩn cấp' :
                                   task.priority === 'high' ? 'Cao' :
                                   task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  task.status === 'completed' ? 'bg-green-100 text-green-600' :
                                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                                  task.status === 'review' ? 'bg-purple-100 text-purple-600' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {task.status === 'completed' ? 'Hoàn thành' :
                                   task.status === 'in_progress' ? 'Đang làm' :
                                   task.status === 'review' ? 'Đánh giá' : 'Chờ làm'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end space-y-2">
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {task.time}
                              </span>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                                    style={{ width: `${task.progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-blue-600 font-medium">{task.progress}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">📅</div>
                      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                        Không có task nào
                      </h3>
                      <p className="text-[var(--color-text-secondary)]">
                        Ngày này không có task deadline nào được lên lịch.
                      </p>
                    </div>
                  );
                })()}
              </div>
              
              {/* Actions Footer */}
              <div className="p-3 border-t bg-gradient-to-r from-gray-50 to-white rounded-b-2xl flex justify-end">
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowDayModal(false)}
                    className="cursor-pointer px-6 py-4 section-neumorphic bg-white text-gray-700 rounded-xl hover:scale-105 transition-all duration-300 text-sm font-bold flex items-center justify-center"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Thank You Toast */}
      {showThankYouToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="section-neumorphic bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 max-w-sm shadow-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">🎉</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-green-800">
                    Cảm ơn từ Team Leader! 
                  </p>
                  <button
                    onClick={() => setShowThankYouToast(false)}
                    className="text-green-600 hover:text-green-800 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-green-700 leading-relaxed">
                  Xuất sắc! Bạn đã hoàn thành &ldquo;<span className="font-semibold">{completedTaskTitle}</span>&rdquo; đúng hạn. 
                  Team rất tự hào về bạn! 💪
                </p>
                <div className="mt-2 flex items-center text-xs text-green-600">
                  <span className="mr-1">💼</span>
                  <span className="italic">- {teamLeaderName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }
      `}</style>
    </MainLayout>
  );
};

export default MemberDashboardPage;
