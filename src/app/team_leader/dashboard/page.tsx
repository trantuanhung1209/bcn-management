'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useRouter } from 'next/navigation';
import { ProgressRing } from '@/components/ui/Charts';

interface Activity {
  action: string;
  details: string;
  time: string;
  icon: string;
  type: string;
}

interface TeamDetail {
  _id: string;
  name: string;
  memberCount: number;
  projectCount: number;
  activeProjects: number;
  completedProjects: number;
  progress: number;
}

const ManagerDashboardPage: React.FC = () => {
  const [userName, setUserName] = useState('Manager');
  const [userId, setUserId] = useState('');
  const navigate = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<{day: number, month: number, year: number} | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState<{
    totalTeams: number;
    totalMembers: number;
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    webTeams: number;
    appTeams: number;
    teams: TeamDetail[];
    recentActivities: Activity[];
  }>({
    totalTeams: 0,
    totalMembers: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    webTeams: 0,
    appTeams: 0,
    teams: [],
    recentActivities: []
  });

  useEffect(() => {
    // Get user data from localStorage
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData');
      const storedUserName = localStorage.getItem('userName') || 'Team Leader';
      const storedUserId = localStorage.getItem('userId');
      
      if (storedUserId) {
        setUserId(storedUserId);
        setUserName(storedUserName);
      } else if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          setUserId(parsedData.id);
          setUserName(storedUserName);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchStats();
      fetchProjects(); // Fetch projects when userId is available
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Refresh calendar when month changes
  useEffect(() => {
    if (userId && projects.length === 0) {
      fetchProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, currentYear]);

  // Fetch projects from database
  const fetchProjects = async () => {
    try {
      const response = await fetch(`/api/team_leader/projects?status=all`);
      const result = await response.json();
      
      if (result.success && result.data && result.data.projects) {
        setProjects(result.data.projects);
        console.log('Loaded projects from database:', result.data.projects);
      } else {
        // Fallback to mock data if API fails
        setProjects([]);
        console.log('No projects found, using fallback data');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  // Fetch team leader stats from API
  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/team_leader/dashboard?userId=${userId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const adjustedStats = {
          ...result.data,
          totalMembers: Math.max(0, result.data.totalMembers - result.data.totalTeams),
          teams: result.data.teams.map((team: TeamDetail) => ({
            ...team,
            memberCount: Math.max(0, team.memberCount - 1)
          }))
        };
        setStats(adjustedStats);
      } else {
        // No mock data - only show empty state when API fails
        setStats({
          totalTeams: 0,
          totalMembers: 0,
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          webTeams: 0,
          appTeams: 0,
          teams: [],
          recentActivities: []
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // No mock data - only show empty state when API fails
      setStats({
        totalTeams: 0,
        totalMembers: 0,
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        webTeams: 0,
        appTeams: 0,
        teams: [],
        recentActivities: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch all activities for modal
  const fetchAllActivities = async () => {
    setLoadingActivities(true);
    try {
      const response = await fetch(`/api/team_leader/dashboard?userId=${userId}`);
      const result = await response.json();
      
      if (result.success && result.data.recentActivities) {
        setStats(prev => ({
          ...prev,
          recentActivities: result.data.recentActivities
        }));
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Function to handle opening activity modal
  const handleOpenActivityModal = () => {
    setShowActivityModal(true);
    fetchAllActivities();
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

  // Get projects with deadlines for calendar - from database only
  const getProjectsData = () => {
    if (projects.length > 0) {
      // Use real data from database
      return projects.map(project => {
        // Determine priority based on deadline and status
        let priority = 'medium';
        if (project.endDate) {
          const deadline = new Date(project.endDate);
          const daysUntilDeadline = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntilDeadline <= 3) {
            priority = 'urgent';
          } else if (daysUntilDeadline <= 7) {
            priority = 'high';
          } else if (daysUntilDeadline <= 14) {
            priority = 'medium';
          } else {
            priority = 'low';
          }
        }

        // Calculate progress based on completed tasks
        let progressPercentage = 0;
        if (project.totalTasks && project.totalTasks > 0) {
          progressPercentage = Math.round((project.completedTasks / project.totalTasks) * 100);
        }

        return {
          id: project._id,
          name: project.name,
          deadline: project.endDate ? new Date(project.endDate) : null,
          status: project.status === 'in_progress' ? 'in-progress' : project.status,
          priority: priority,
          description: project.description || 'Không có mô tả',
          progress: progressPercentage,
          totalTasks: project.totalTasks || 0,
          completedTasks: project.completedTasks || 0,
          coins: project.coins || 0,
          isAssigned: project.isAssigned || false
        };
      }).filter(project => project.deadline !== null); // Only projects with deadlines
    }
    
    // No mock data - return empty array when no real data
    return [];
  };

  // Get events for specific day - only real project deadlines
  const getEventsForDay = (day: number, month: number, year: number) => {
    const projects = getProjectsData();
    const events: any[] = [];
    
    // Check for project deadlines only - no mock events
    projects.forEach(project => {
      const deadlineDate = project.deadline;
      if (deadlineDate && 
          deadlineDate.getDate() === day && 
          deadlineDate.getMonth() === month && 
          deadlineDate.getFullYear() === year) {
        events.push({
          type: 'deadline',
          title: `Deadline: ${project.name}`,
          time: '17:00',
          status: project.status,
          priority: project.priority,
          description: project.description,
          project: project.name,
          progress: project.progress,
          totalTasks: project.totalTasks,
          completedTasks: project.completedTasks,
          coins: project.coins
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

  // Get day tasks for modal - only real project deadlines
  const getDayTasks = (day: number) => {
    if (!selectedDate) return [];
    return getEventsForDay(day, selectedDate.month - 1, selectedDate.year);
  };

  if (isLoading) {
    return (
      <MainLayout userRole="team_leader">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  const completionRate = stats.totalProjects > 0 
    ? Math.round((stats.completedProjects / stats.totalProjects) * 100) 
    : 0;

  return (
    <MainLayout userRole="team_leader">
      <div className="space-y-6">
        {/* Compact Header */}
        <div className="section-neumorphic p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
                Xin chào, {userName}
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                {new Date().toLocaleDateString('vi-VN', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </p>
            </div>
            
            {/* Compact Progress Overview */}
            <div className="text-center">
              <ProgressRing 
                progress={completionRate}
                size={60}
                color="#10B981"
              />
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">Hoàn thành</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="section-neumorphic p-4 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">Teams</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.totalTeams}</p>
              </div>
              <div className="text-3xl">🏢</div>
            </div>
          </div>
          <div className="section-neumorphic p-4 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">Members</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.totalMembers}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>
          <div className="section-neumorphic p-4 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">Projects</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.totalProjects}</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </div>
          <div className="section-neumorphic p-4 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">Đang làm</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.activeProjects}</p>
              </div>
              <div className="text-3xl">⚡</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Project Status & Calendar */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Project Status */}
            <div className="section-neumorphic p-6">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                Tình trạng dự án
              </h2>
              
              <div className="space-y-4">
                {/* Completed Projects */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-[var(--color-text-primary)]">Hoàn thành</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${stats.totalProjects > 0 ? (stats.completedProjects / stats.totalProjects) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {stats.completedProjects}
                    </span>
                  </div>
                </div>

                {/* Active Projects */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-[var(--color-text-primary)]">Đang thực hiện</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${stats.totalProjects > 0 ? (stats.activeProjects / stats.totalProjects) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {stats.activeProjects}
                    </span>
                  </div>
                </div>

                {/* Pending Projects */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-[var(--color-text-primary)]">Chờ thực hiện</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${stats.totalProjects > 0 ? ((stats.totalProjects - stats.completedProjects - stats.activeProjects) / stats.totalProjects) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {Math.max(0, stats.totalProjects - stats.completedProjects - stats.activeProjects)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate.push('/team_leader/teams')}
                  className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium cursor-pointer"
                >
                  Quản lý Teams
                </button>
                <button
                  onClick={() => navigate.push('/team_leader/projects')}
                  className="p-3 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium cursor-pointer"
                >
                  Quản lý Projects
                </button>
              </div>
            </div>

            {/* Project Calendar & Deadlines */}
            <div className="section-neumorphic p-6">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">
                📅 Lịch theo dõi dự án
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
                        className="section-neumorphic p-1.5 hover:scale-105 transition-all duration-200 bg-white"
                      >
                        <span className="text-gray-600 font-bold text-sm">‹</span>
                      </button>
                      <button 
                        onClick={() => navigateMonth('next')}
                        className="section-neumorphic p-1.5 hover:scale-105 transition-all duration-200 bg-white"
                      >
                        <span className="text-gray-600 font-bold text-sm">›</span>
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
                      <div className="text-lg font-bold text-blue-600">
                        {getCalendarDays().filter(day => day.isCurrentMonth && dayHasEvents(day.day, day.month, day.year)).length}
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)]">Events</div>
                    </div>
                    <div className="section-neumorphic p-2 text-center bg-gradient-to-br from-green-50 to-emerald-50">
                      <div className="text-lg font-bold text-green-600">
                        {getProjectsData().filter(p => p.deadline && p.deadline.getMonth() === currentMonth).length}
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)]">Deadlines</div>
                    </div>
                    <div className="section-neumorphic p-2 text-center bg-gradient-to-br from-purple-50 to-violet-50">
                      <div className="text-lg font-bold text-purple-600">
                        {getProjectsData().filter(p => p.status === 'in-progress').length}
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)]">Active</div>
                    </div>
                  </div>
                </div>

                {/* Upcoming Deadlines */}
                <div className="section-neumorphic p-4 bg-gradient-to-br from-white to-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-semibold text-[var(--color-text-primary)] flex items-center">
                      <span className="mr-2">⏰</span>
                      Deadline sắp tới
                    </h4>
                    <span className="text-xs text-[var(--color-text-secondary)] bg-gray-100 px-2 py-1 rounded-full">
                      {getProjectsData().filter(p => p.deadline && p.deadline.getMonth() >= currentMonth).length} deadline
                    </span>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {getProjectsData()
                      .filter(project => {
                        if (!project.deadline) return false;
                        const deadlineMonth = project.deadline.getMonth();
                        const deadlineYear = project.deadline.getFullYear();
                        return (deadlineYear === currentYear && deadlineMonth >= currentMonth) || 
                               (deadlineYear > currentYear);
                      })
                      .slice(0, 4)
                      .map((project, index) => (
                      <div key={index} className={`section-neumorphic p-3 bg-gradient-to-r border-l-4 ${
                        project.priority === 'urgent' ? 'from-red-50 to-pink-50 border-red-400' :
                        project.priority === 'high' ? 'from-orange-50 to-red-50 border-orange-400' :
                        'from-yellow-50 to-amber-50 border-yellow-400'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full shadow-sm ${
                              project.priority === 'urgent' ? 'bg-gradient-to-r from-red-400 to-red-500' :
                              project.priority === 'high' ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                              'bg-gradient-to-r from-yellow-400 to-yellow-500'
                            }`}></div>
                            <div className="flex-1">
                              <span className="text-sm font-semibold text-[var(--color-text-primary)]">{project.name}</span>
                              <p className="text-xs text-[var(--color-text-secondary)]">{project.description}</p>
                              <div className="flex items-center space-x-3 mt-1">
                                {project.progress !== undefined && (
                                  <div className="flex items-center space-x-1">
                                    <div className="w-12 bg-gray-200 rounded-full h-1">
                                      <div 
                                        className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                                        style={{ width: `${project.progress}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-500">{project.progress}%</span>
                                  </div>
                                )}
                                {project.totalTasks > 0 && (
                                  <span className="text-xs text-blue-600">
                                    📋 {project.completedTasks}/{project.totalTasks}
                                  </span>
                                )}
                                {project.coins > 0 && (
                                  <span className="text-xs text-yellow-600">
                                    💰 {project.coins.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-2">
                            <span className={`text-sm font-bold ${
                              project.priority === 'urgent' ? 'text-red-600' :
                              project.priority === 'high' ? 'text-orange-600' :
                              'text-yellow-600'
                            }`}>
                              {project.deadline?.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                            </span>
                            <p className={`text-xs ${
                              project.priority === 'urgent' ? 'text-red-500' :
                              project.priority === 'high' ? 'text-orange-500' :
                              'text-yellow-500'
                            }`}>
                              {project.deadline && Math.ceil((project.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} ngày
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {getProjectsData().filter(project => {
                      if (!project.deadline) return false;
                      const deadlineMonth = project.deadline.getMonth();
                      const deadlineYear = project.deadline.getFullYear();
                      return (deadlineYear === currentYear && deadlineMonth >= currentMonth) || 
                             (deadlineYear > currentYear);
                    }).length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-gray-400 text-3xl mb-2">📅</div>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          Không có deadline sắp tới
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Panel */}
          <div className="space-y-6">
            
            {/* Team Performance */}
            <div className="section-neumorphic p-6">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Hiệu suất team</h3>
              <div className="text-center">
                <ProgressRing 
                  progress={completionRate}
                  size={100}
                  color="#8B5CF6"
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
                  <span className="font-medium text-[var(--color-text-primary)]">{stats.completedProjects}/{stats.totalProjects}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">Members</span>
                  <span className="font-medium text-[var(--color-text-primary)]">{stats.totalMembers}</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="section-neumorphic p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Hoạt động gần đây</h3>
                <button 
                  onClick={handleOpenActivityModal}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
                >
                  Xem tất cả
                </button>
              </div>
              <div className="space-y-3">
                {stats.recentActivities && stats.recentActivities.length > 0 
                  ? stats.recentActivities.slice(0, 3).map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-[var(--color-text-primary)]">{activity.action}</p>
                        <p className="text-xs text-[var(--color-text-secondary)]">{activity.time}</p>
                      </div>
                    </div>
                  ))
                  : (
                    <div className="text-center py-6">
                      <div className="text-gray-400 text-2xl mb-2">📝</div>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        Chưa có hoạt động nào
                      </p>
                    </div>
                  )
                }
              </div>
            </div>
          </div>
        </div>

        {/* Activity Modal */}
        {showActivityModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[70vh] mx-4">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                  Hoạt động gần đây
                </h2>
                <button 
                  onClick={() => setShowActivityModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold cursor-pointer"
                >
                  ×
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[50vh]">
                {loadingActivities ? (
                  <div className="flex items-center justify-center h-20">
                    <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-lg">{activity.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">{activity.action}</p>
                          <p className="text-xs text-[var(--color-text-secondary)]">{activity.details}</p>
                        </div>
                        <span className="text-xs text-[var(--color-text-secondary)]">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Day Tasks Modal */}
        {showDayModal && selectedDate && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] mx-4 section-neumorphic shadow-2xl">
              {/* Header */}
              <div className="p-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center">
                      <span className="mr-3 text-2xl">📋</span>
                      Nhiệm vụ ngày {selectedDate.day}/{selectedDate.month}
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1 ml-11">
                      {new Date(selectedDate.year, selectedDate.month - 1, selectedDate.day).toLocaleDateString('vi-VN', { 
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowDayModal(false)}
                    className="section-neumorphic p-2 text-gray-500 hover:text-gray-700 hover:scale-105 transition-all duration-200 bg-white rounded-full cursor-pointer"
                  >
                    <span className="text-lg font-bold">×</span>
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
                        <div key={index} className={`section-neumorphic p-5 bg-gradient-to-br from-white to-gray-50 border-l-4 hover:scale-105 transition-all duration-300 hover:shadow-lg ${
                          task.type === 'deadline' ? 'border-l-red-400' :
                          task.type === 'meeting' ? 'border-l-blue-400' :
                          task.type === 'review' ? 'border-l-purple-400' :
                          'border-l-green-400'
                        }`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 mr-3">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-lg">
                                  {task.type === 'deadline' ? '⏰' :
                                   task.type === 'meeting' ? '👥' :
                                   task.type === 'review' ? '👀' :
                                   '📋'}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  task.type === 'deadline' ? 'bg-red-100 text-red-700' :
                                  task.type === 'meeting' ? 'bg-blue-100 text-blue-700' :
                                  task.type === 'review' ? 'bg-purple-100 text-purple-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {task.type === 'deadline' ? 'Deadline' :
                                   task.type === 'meeting' ? 'Meeting' :
                                   task.type === 'review' ? 'Review' :
                                   'Task'}
                                </span>
                              </div>
                              <h3 className="font-bold text-[var(--color-text-primary)] text-lg leading-snug">
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                  {task.description}
                                </p>
                              )}
                              {task.project && (
                                <div className="text-xs text-blue-600 mt-1 font-medium flex items-center space-x-2">
                                  <span>📁 {task.project}</span>
                                  {task.progress !== undefined && (
                                    <span className="bg-blue-100 px-2 py-1 rounded-full">
                                      {task.progress}% hoàn thành
                                    </span>
                                  )}
                                  {task.totalTasks && (
                                    <span className="bg-gray-100 px-2 py-1 rounded-full">
                                      {task.completedTasks || 0}/{task.totalTasks} tasks
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col space-y-2">
                              {/* Priority Badge */}
                              <span className={`px-3 py-1 text-xs rounded-full font-bold text-center shadow-sm ${
                                task.priority === 'urgent' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
                                task.priority === 'high' ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white' :
                                task.priority === 'medium' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                                'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                              }`}>
                                {task.priority === 'urgent' ? '🔥 Khẩn cấp' :
                                 task.priority === 'high' ? '⚡ Cao' :
                                 task.priority === 'medium' ? '📊 Trung bình' : '📌 Thấp'}
                              </span>
                              {/* Status Badge */}
                              <span className={`px-3 py-1 text-xs rounded-full font-bold text-center shadow-sm ${
                                task.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' :
                                task.status === 'in-progress' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                                'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                              }`}>
                                {task.status === 'completed' ? '✅ Hoàn thành' :
                                 task.status === 'in-progress' ? '⚡ Đang làm' : '⏳ Chờ làm'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-[var(--color-text-secondary)] section-neumorphic px-3 py-2 bg-white rounded-lg">
                              <span className="mr-2 text-lg">🕐</span>
                              <span className="font-semibold">{task.time}</span>
                            </div>
                            
                            {/* Progress indicator */}
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${
                                task.status === 'completed' ? 'bg-green-500' :
                                task.status === 'in-progress' ? 'bg-blue-500 animate-pulse' :
                                'bg-gray-300'
                              } shadow-sm`}></div>
                              <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                                {task.status === 'completed' ? 'Done' :
                                 task.status === 'in-progress' ? 'Working...' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 section-neumorphic bg-gradient-to-br from-gray-50 to-white rounded-xl">
                      <div className="text-6xl mb-4">📅</div>
                      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                        Ngày nghỉ ngơi
                      </h3>
                      <p className="text-[var(--color-text-secondary)]">
                        Không có nhiệm vụ nào cho ngày này
                      </p>
                      <div className="mt-4 text-4xl">😌</div>
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
                    <span className="mr-2">✖️</span>
                    Đóng
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

export default ManagerDashboardPage;