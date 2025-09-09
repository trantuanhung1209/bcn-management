'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';

const ManagerDashboardPage: React.FC = () => {
  const [managedTeam, setManagedTeam] = useState<string>('');
  const [userName, setUserName] = useState('Manager');
  const [isLoading, setIsLoading] = useState(true);
  const [teamStats, setTeamStats] = useState({
    teamName: '',
    totalMembers: 0,
    activeProjects: 0,
    completedTasks: 0,
    pendingTasks: 0,
    teamColor: 'from-blue-500 to-cyan-500',
    teamIcon: '🏢'
  });

  useEffect(() => {
    // Get user data from localStorage
    if (typeof window !== 'undefined') {
      const storedManagedTeam = localStorage.getItem('managedTeam') || '';
      const storedUserName = localStorage.getItem('userName') || 'Manager';
      setManagedTeam(storedManagedTeam);
      setUserName(storedUserName);
    }

    // Simulate fetching team stats
    const fetchTeamStats = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get team-specific data
      if (managedTeam === 'web') {
        setTeamStats({
          teamName: 'Team Web Development',
          totalMembers: 6,
          activeProjects: 4,
          completedTasks: 28,
          pendingTasks: 12,
          teamColor: 'from-blue-500 to-cyan-500',
          teamIcon: '🌐'
        });
      } else if (managedTeam === 'app') {
        setTeamStats({
          teamName: 'Team Mobile App',
          totalMembers: 4,
          activeProjects: 3,
          completedTasks: 22,
          pendingTasks: 8,
          teamColor: 'from-green-500 to-emerald-500',
          teamIcon: '📱'
        });
      } else {
        setTeamStats({
          teamName: 'Team Development',
          totalMembers: 5,
          activeProjects: 3,
          completedTasks: 25,
          pendingTasks: 10,
          teamColor: 'from-purple-500 to-pink-500',
          teamIcon: '🏢'
        });
      }
      setIsLoading(false);
    };

    fetchTeamStats();
  }, [managedTeam]);

  if (isLoading) {
    return (
      <MainLayout userRole="manager">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="manager">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            Manager Dashboard - {teamStats.teamName}
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Chào mừng {userName}! Quản lý {teamStats.teamName} của bạn.
          </p>
        </div>

        {/* Team Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 bg-gradient-to-r ${teamStats.teamColor} rounded-xl flex items-center justify-center`}>
                <span className="text-white text-xl">{teamStats.teamIcon}</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {teamStats.totalMembers}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Thành viên</p>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📊</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {teamStats.activeProjects}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Dự án đang chạy</p>
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
                  {teamStats.completedTasks}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Tasks hoàn thành</p>
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
                  {teamStats.pendingTasks}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Tasks đang chờ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="section-neumorphic p-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
              Hoạt động team gần đây
            </h2>
            <div className="space-y-4">
              {[
                {
                  action: 'Hoàn thành task Login System',
                  member: 'Nguyễn Văn A',
                  time: '2 giờ trước',
                  icon: '✅',
                  type: 'completed'
                },
                {
                  action: 'Bắt đầu task API Integration',
                  member: 'Trần Thị B',
                  time: '4 giờ trước',
                  icon: '🚀',
                  type: 'started'
                },
                {
                  action: 'Review code Dashboard UI',
                  member: 'Lê Văn C',
                  time: '6 giờ trước',
                  icon: '👀',
                  type: 'review'
                },
                {
                  action: 'Deploy bản beta v1.2',
                  member: 'Team Lead',
                  time: '1 ngày trước',
                  icon: '🚀',
                  type: 'deploy'
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                  <span className="text-2xl">{activity.icon}</span>
                  <div className="flex-1">
                    <p className="text-[var(--color-text-primary)] font-medium">
                      {activity.action}
                    </p>
                    <p className="text-[var(--color-text-secondary)] text-sm">
                      {activity.member}
                    </p>
                  </div>
                  <span className="text-[var(--color-text-secondary)] text-xs">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
              Thành viên trong team
            </h2>
            <div className="space-y-4">
              {[
                {
                  name: 'Nguyễn Văn A',
                  role: 'Senior Developer',
                  status: 'Online',
                  avatar: 'A',
                  tasks: 3
                },
                {
                  name: 'Trần Thị B',
                  role: 'Frontend Developer',
                  status: 'Online',
                  avatar: 'B',
                  tasks: 2
                },
                {
                  name: 'Lê Văn C',
                  role: 'Backend Developer',
                  status: 'Away',
                  avatar: 'C',
                  tasks: 4
                },
                {
                  name: 'Phạm Thị D',
                  role: 'UI/UX Designer',
                  status: 'Offline',
                  avatar: 'D',
                  tasks: 1
                }
              ].slice(0, teamStats.totalMembers > 4 ? 4 : teamStats.totalMembers).map((member, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {member.avatar}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[var(--color-text-primary)] font-medium">
                      {member.name}
                    </p>
                    <p className="text-[var(--color-text-secondary)] text-sm">
                      {member.role}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {member.tasks} tasks
                    </p>
                    <div className="flex items-center space-x-1">
                      <span className={`w-2 h-2 rounded-full ${
                        member.status === 'Online' ? 'bg-green-500' :
                        member.status === 'Away' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}></span>
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        {member.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Progress */}
        <div className="section-neumorphic p-6">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
            Tiến độ dự án
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: 'E-commerce Platform',
                progress: 75,
                deadline: '15/10/2025',
                status: 'On Track',
                color: 'bg-green-500'
              },
              {
                name: 'Mobile App Redesign',
                progress: 45,
                deadline: '20/10/2025',
                status: 'At Risk',
                color: 'bg-yellow-500'
              },
              {
                name: 'API Documentation',
                progress: 90,
                deadline: '12/10/2025',
                status: 'Almost Done',
                color: 'bg-blue-500'
              }
            ].slice(0, teamStats.activeProjects).map((project, index) => (
              <div key={index} className="bg-white p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-[var(--color-text-primary)]">
                    {project.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs text-white ${project.color}`}>
                    {project.status}
                  </span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--color-text-secondary)]">Progress</span>
                    <span className="text-[var(--color-text-primary)] font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${project.color}`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Deadline: {project.deadline}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Manager Actions */}
        <div className="section-neumorphic p-6">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
            Thao tác quản lý nhanh
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="neumorphic-button p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow duration-200">
              <span className="text-xl">✅</span>
              <span>Giao Task Mới</span>
            </button>
            <button className="neumorphic-button p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow duration-200">
              <span className="text-xl">👨‍💼</span>
              <span>Quản lý Members</span>
            </button>
            <button className="neumorphic-button p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow duration-200">
              <span className="text-xl">📊</span>
              <span>Báo cáo tiến độ</span>
            </button>
            <button className="neumorphic-button p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow duration-200">
              <span className="text-xl">⚙️</span>
              <span>Cài đặt Team</span>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ManagerDashboardPage;
