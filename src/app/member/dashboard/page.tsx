'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';

const MemberDashboardPage: React.FC = () => {
  const [userName, setUserName] = useState('Member');
  const [userTeam, setUserTeam] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [memberStats, setMemberStats] = useState({
    assignedTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    teamName: '',
    teamColor: 'from-blue-500 to-cyan-500',
    teamIcon: '🏢'
  });

  useEffect(() => {
    // Get user data from localStorage
    if (typeof window !== 'undefined') {
      const storedUserName = localStorage.getItem('userName') || 'Member';
      const storedUserTeam = localStorage.getItem('userTeam') || '';
      setUserName(storedUserName);
      setUserTeam(storedUserTeam);
    }

    // Simulate fetching member stats
    const fetchMemberStats = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get team-specific data
      if (userTeam === 'web') {
        setMemberStats({
          assignedTasks: 8,
          completedTasks: 15,
          inProgressTasks: 3,
          pendingTasks: 5,
          teamName: 'Team Web Development',
          teamColor: 'from-blue-500 to-cyan-500',
          teamIcon: '🌐'
        });
      } else if (userTeam === 'app') {
        setMemberStats({
          assignedTasks: 6,
          completedTasks: 12,
          inProgressTasks: 2,
          pendingTasks: 4,
          teamName: 'Team Mobile App',
          teamColor: 'from-green-500 to-emerald-500',
          teamIcon: '📱'
        });
      } else {
        setMemberStats({
          assignedTasks: 7,
          completedTasks: 13,
          inProgressTasks: 2,
          pendingTasks: 5,
          teamName: 'Team Development',
          teamColor: 'from-purple-500 to-pink-500',
          teamIcon: '🏢'
        });
      }
      setIsLoading(false);
    };

    fetchMemberStats();
  }, [userTeam]);

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
            My Dashboard
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Chào mừng {userName}! Theo dõi công việc và tiến độ của bạn.
          </p>
        </div>

        {/* Personal Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📋</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {memberStats.assignedTasks}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Tasks được giao</p>
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
                  {memberStats.completedTasks}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Tasks hoàn thành</p>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🔄</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {memberStats.inProgressTasks}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Đang thực hiện</p>
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
                  {memberStats.pendingTasks}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Chờ xử lý</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Work Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="section-neumorphic p-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
              Tasks cần làm hôm nay
            </h2>
            <div className="space-y-4">
              {[
                {
                  title: 'Hoàn thành Login Component',
                  project: 'E-commerce Platform',
                  priority: 'High',
                  deadline: 'Hôm nay',
                  status: 'in-progress',
                  icon: '🔧'
                },
                {
                  title: 'Review API Documentation',
                  project: 'Mobile App Redesign',
                  priority: 'Medium',
                  deadline: 'Ngày mai',
                  status: 'pending',
                  icon: '📖'
                },
                {
                  title: 'Fix Button Styling Issues',
                  project: 'Dashboard UI',
                  priority: 'Low',
                  deadline: '2 ngày nữa',
                  status: 'pending',
                  icon: '🎨'
                },
                {
                  title: 'Write Unit Tests',
                  project: 'API Integration',
                  priority: 'High',
                  deadline: '3 ngày nữa',
                  status: 'pending',
                  icon: '🧪'
                }
              ].map((task, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                  <span className="text-2xl">{task.icon}</span>
                  <div className="flex-1">
                    <p className="text-[var(--color-text-primary)] font-medium">
                      {task.title}
                    </p>
                    <p className="text-[var(--color-text-secondary)] text-sm">
                      {task.project}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.priority === 'High' ? 'bg-red-100 text-red-800' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                      {task.deadline}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
              Hoạt động gần đây
            </h2>
            <div className="space-y-4">
              {[
                {
                  action: 'Hoàn thành task Database Schema',
                  project: 'E-commerce Platform',
                  time: '2 giờ trước',
                  icon: '✅',
                  type: 'completed'
                },
                {
                  action: 'Cập nhật progress Dashboard UI',
                  project: 'Admin Panel',
                  time: '4 giờ trước',
                  icon: '📊',
                  type: 'progress'
                },
                {
                  action: 'Comment trên task API Integration',
                  project: 'Mobile App',
                  time: '6 giờ trước',
                  icon: '💬',
                  type: 'comment'
                },
                {
                  action: 'Submit code review request',
                  project: 'Dashboard UI',
                  time: '1 ngày trước',
                  icon: '👀',
                  type: 'review'
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                  <span className="text-2xl">{activity.icon}</span>
                  <div className="flex-1">
                    <p className="text-[var(--color-text-primary)] font-medium">
                      {activity.action}
                    </p>
                    <p className="text-[var(--color-text-secondary)] text-sm">
                      {activity.project}
                    </p>
                  </div>
                  <span className="text-[var(--color-text-secondary)] text-xs">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team & Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="section-neumorphic p-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
              Team của tôi
            </h2>
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${memberStats.teamColor} rounded-xl flex items-center justify-center`}>
                  <span className="text-white text-xl">{memberStats.teamIcon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    {memberStats.teamName || 'Team Development'}
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    Nhóm phát triển sản phẩm
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-secondary)]">Team Lead</span>
                  <span className="text-[var(--color-text-primary)] font-medium">Nguyễn Văn Manager</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-secondary)]">Thành viên</span>
                  <span className="text-[var(--color-text-primary)] font-medium">6 người</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-secondary)]">Dự án đang chạy</span>
                  <span className="text-[var(--color-text-primary)] font-medium">3 dự án</span>
                </div>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
              Dự án đang tham gia
            </h2>
            <div className="space-y-3">
              {[
                {
                  name: 'E-commerce Platform',
                  role: 'Frontend Developer',
                  progress: 75,
                  status: 'On Track',
                  color: 'bg-green-500'
                },
                {
                  name: 'Mobile App Redesign',
                  role: 'UI Developer',
                  progress: 45,
                  status: 'In Progress',
                  color: 'bg-blue-500'
                },
                {
                  name: 'Dashboard UI Update',
                  role: 'React Developer',
                  progress: 90,
                  status: 'Almost Done',
                  color: 'bg-purple-500'
                }
              ].map((project, index) => (
                <div key={index} className="bg-white p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-[var(--color-text-primary)]">
                      {project.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${project.color}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                    Vai trò: {project.role}
                  </p>
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
              ))}
            </div>
          </div>
        </div>

        {/* Quick Member Actions */}
        <div className="section-neumorphic p-6">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
            Thao tác nhanh
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="neumorphic-button p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow duration-200">
              <span className="text-xl">📋</span>
              <span>Xem Tasks</span>
            </button>
            <button className="neumorphic-button p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow duration-200">
              <span className="text-xl">⏰</span>
              <span>Báo cáo thời gian</span>
            </button>
            <button className="neumorphic-button p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow duration-200">
              <span className="text-xl">💬</span>
              <span>Team Chat</span>
            </button>
            <button className="neumorphic-button p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow duration-200">
              <span className="text-xl">👤</span>
              <span>Profile</span>
            </button>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="section-neumorphic p-6">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
            Hiệu suất làm việc
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-secondary)]">Tasks hoàn thành tháng này</span>
                <span className="text-2xl">📈</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">15</p>
              <p className="text-[var(--color-text-secondary)] text-sm">+25% so với tháng trước</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-secondary)]">Điểm đánh giá trung bình</span>
                <span className="text-2xl">⭐</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">4.8/5</p>
              <p className="text-[var(--color-text-secondary)] text-sm">Xuất sắc</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-secondary)]">Thời gian hoàn thành trung bình</span>
                <span className="text-2xl">⏱️</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">2.5 ngày</p>
              <p className="text-[var(--color-text-secondary)] text-sm">Nhanh hơn 15% so với team</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MemberDashboardPage;
