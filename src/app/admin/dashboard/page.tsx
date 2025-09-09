'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';

const AdminDashboardPage: React.FC = () => {
  const [userName, setUserName] = useState('Admin');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeams: 0,
    totalProjects: 0,
    totalLeaders: 0,
    activeUsers: 0,
    webTeams: 0,
    appTeams: 0,
    completedProjects: 0
  });

  useEffect(() => {
    // Get user name from localStorage
    if (typeof window !== 'undefined') {
      const storedUserName = localStorage.getItem('userName') || 'Admin';
      setUserName(storedUserName);
    }

    // Simulate fetching admin stats
    const fetchStats = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock admin statistics
      setStats({
        totalUsers: 25,
        totalTeams: 8,
        totalProjects: 15,
        totalLeaders: 5,
        activeUsers: 23,
        webTeams: 5,
        appTeams: 3,
        completedProjects: 12
      });
      setIsLoading(false);
    };

    fetchStats();
  }, []);

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
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            Admin Dashboard
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Chào mừng {userName}! Quản lý toàn bộ hệ thống từ đây.
          </p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">👥</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.totalUsers}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Tổng Users</p>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🏢</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.totalTeams}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Tổng Teams</p>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📊</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.totalProjects}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Tổng Projects</p>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">👑</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.totalLeaders}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Team Leaders</p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">✅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.activeUsers}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Users Hoạt động</p>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🌐</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.webTeams}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Teams Web</p>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-400 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📱</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.appTeams}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Teams App</p>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🎯</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.completedProjects}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Projects Hoàn thành</p>
              </div>
            </div>
          </div>
        </div>

        {/* Management Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="section-neumorphic p-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
              Hoạt động quản trị gần đây
            </h2>
            <div className="space-y-4">
              {[
                {
                  action: 'Tạo team leader mới',
                  details: 'Thêm Nguyễn Văn A vào role Team Leader',
                  time: '2 giờ trước',
                  icon: '👑',
                  type: 'leader'
                },
                {
                  action: 'Cập nhật team configuration',
                  details: 'Thay đổi cấu trúc Team Web Development',
                  time: '4 giờ trước',
                  icon: '🔧',
                  type: 'team'
                },
                {
                  action: 'Phê duyệt project mới',
                  details: 'Dự án E-commerce Platform được phê duyệt',
                  time: '1 ngày trước',
                  icon: '✅',
                  type: 'project'
                },
                {
                  action: 'Backup hệ thống',
                  details: 'Sao lưu dữ liệu định kỳ hoàn thành',
                  time: '2 ngày trước',
                  icon: '💾',
                  type: 'system'
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                  <span className="text-2xl">{activity.icon}</span>
                  <div className="flex-1">
                    <p className="text-[var(--color-text-primary)] font-medium">
                      {activity.action}
                    </p>
                    <p className="text-[var(--color-text-secondary)] text-sm">
                      {activity.details}
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
              Quản lý hệ thống
            </h2>
            <div className="space-y-4">
              {[
                {
                  name: 'Quản lý Users',
                  description: 'Tạo, chỉnh sửa và phân quyền users',
                  color: 'from-blue-500 to-cyan-500',
                  icon: '👥',
                  href: '/admin/users'
                },
                {
                  name: 'Quản lý Teams',
                  description: 'Tổ chức và cấu trúc teams',
                  color: 'from-green-500 to-emerald-500',
                  icon: '🏢',
                  href: '/admin/teams'
                },
                {
                  name: 'Quản lý Leaders',
                  description: 'Phân công và giám sát team leaders',
                  color: 'from-purple-500 to-pink-500',
                  icon: '👑',
                  href: '/admin/leaders'
                },
                {
                  name: 'Quản lý Projects',
                  description: 'Theo dõi và điều phối dự án',
                  color: 'from-orange-500 to-red-500',
                  icon: '📊',
                  href: '/admin/projects'
                }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer">
                  <div className={`w-10 h-10 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center`}>
                    <span className="text-white text-xl">{item.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[var(--color-text-primary)] font-medium">
                      {item.name}
                    </p>
                    <p className="text-[var(--color-text-secondary)] text-sm">
                      {item.description}
                    </p>
                  </div>
                  <span className="text-[var(--color-accent)] text-sm font-medium">
                    Truy cập →
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="section-neumorphic p-6">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
            Thao tác quản trị nhanh
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="neumorphic-button p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow duration-200">
              <span className="text-xl">👤</span>
              <span>Tạo User Mới</span>
            </button>
            <button className="neumorphic-button p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow duration-200">
              <span className="text-xl">🏢</span>
              <span>Tạo Team Mới</span>
            </button>
            <button className="neumorphic-button p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow duration-200">
              <span className="text-xl">👑</span>
              <span>Thêm Leader</span>
            </button>
            <button className="neumorphic-button p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow duration-200">
              <span className="text-xl">📊</span>
              <span>Xem Báo Cáo</span>
            </button>
          </div>
        </div>

        {/* System Health */}
        <div className="section-neumorphic p-6">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
            Tình trạng hệ thống
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-secondary)]">Database</span>
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">99.9%</p>
              <p className="text-[var(--color-text-secondary)] text-sm">Hoạt động tốt</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-secondary)]">API Server</span>
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">100%</p>
              <p className="text-[var(--color-text-secondary)] text-sm">Hoạt động tốt</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-secondary)]">Storage</span>
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">78%</p>
              <p className="text-[var(--color-text-secondary)] text-sm">Đã sử dụng</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboardPage;
