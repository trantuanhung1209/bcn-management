'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';

const DashboardPage: React.FC = () => {
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'member'>('member');
  const [managedTeam, setManagedTeam] = useState<string>('');
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    // Get user role from localStorage
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('userRole') as 'admin' | 'manager' | 'member';
      const storedManagedTeam = localStorage.getItem('managedTeam') || '';
      const storedUserName = localStorage.getItem('userName') || 'User';
      if (storedRole) {
        setUserRole(storedRole);
        setManagedTeam(storedManagedTeam);
        setUserName(storedUserName);
      }
    }
  }, []);

  // Get team-specific data for managers
  const getTeamStats = () => {
    if (userRole === 'manager') {
      if (managedTeam === 'web') {
        return {
          teamName: 'Team Web',
          totalMembers: 3,
          teamColor: 'from-blue-500 to-cyan-500',
          teamIcon: '🌐'
        };
      } else if (managedTeam === 'app') {
        return {
          teamName: 'Team App',
          totalMembers: 2,
          teamColor: 'from-green-500 to-emerald-500',
          teamIcon: '📱'
        };
      }
    }
    return {
      teamName: 'All Teams',
      totalMembers: 5,
      teamColor: 'from-purple-500 to-pink-500',
      teamIcon: '👥'
    };
  };

  const teamStats = getTeamStats();

  return (
    <MainLayout userRole={userRole}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            {userRole === 'manager' ? `Dashboard - ${teamStats.teamName}` : 'Dashboard'}
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            {userRole === 'manager' 
              ? `Chào mừng ${userName}! Quản lý ${teamStats.teamName} của bạn.`
              : 'Chào mừng bạn quay trở lại! Đây là tổng quan về hệ thống.'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 bg-gradient-to-r ${teamStats.teamColor} rounded-xl flex items-center justify-center`}>
                <span className="text-white text-xl">{teamStats.teamIcon}</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {userRole === 'admin' ? 2 : 1}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  {userRole === 'admin' ? 'Teams' : 'Team'}
                </p>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">👨‍💼</span>
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
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">✅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">8</p>
                <p className="text-[var(--color-text-secondary)] text-sm">Hoạt động</p>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">⚡</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">95%</p>
                <p className="text-[var(--color-text-secondary)] text-sm">Hiệu suất</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="section-neumorphic p-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
              Hoạt động gần đây
            </h2>
            <div className="space-y-4">
              {[
                {
                  action: userRole === 'manager' ? `Thêm thành viên mới vào ${teamStats.teamName}` : 'Thêm thành viên mới Team Web',
                  team: userRole === 'manager' ? teamStats.teamName : 'Team Web',
                  time: '2 giờ trước',
                  icon: '👥'
                },
                {
                  action: userRole === 'manager' ? `Cập nhật dự án ${teamStats.teamName}` : 'Cập nhật dự án Team App',
                  team: userRole === 'manager' ? teamStats.teamName : 'Team App',
                  time: '4 giờ trước',
                  icon: userRole === 'manager' && managedTeam === 'web' ? '🌐' : '📱'
                },
                {
                  action: userRole === 'manager' ? `Hoàn thành task trong ${teamStats.teamName}` : 'Hoàn thành task Team Web',
                  team: userRole === 'manager' ? teamStats.teamName : 'Team Web',
                  time: '1 ngày trước',
                  icon: '✅'
                }
              ].filter((_, index) => userRole === 'admin' || index < 2).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                  <span className="text-2xl">{activity.icon}</span>
                  <div className="flex-1">
                    <p className="text-[var(--color-text-primary)] font-medium">
                      {activity.action}
                    </p>
                    <p className="text-[var(--color-text-secondary)] text-sm">
                      {activity.team}
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
              {userRole === 'manager' ? `${teamStats.teamName} của bạn` : 'Teams phổ biến'}
            </h2>
            <div className="space-y-4">
              {(userRole === 'manager' ? [
                {
                  name: teamStats.teamName,
                  members: teamStats.totalMembers,
                  color: teamStats.teamColor
                }
              ] : [
                {
                  name: 'Team Web',
                  members: 3,
                  color: 'from-blue-500 to-cyan-500'
                },
                {
                  name: 'Team App',
                  members: 2,
                  color: 'from-green-500 to-emerald-500'
                }
              ]).map((team, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                  <div className={`w-10 h-10 bg-gradient-to-r ${team.color} rounded-lg flex items-center justify-center`}>
                    <span className="text-white font-bold">
                      {team.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[var(--color-text-primary)] font-medium">
                      {team.name}
                    </p>
                    <p className="text-[var(--color-text-secondary)] text-sm">
                      {team.members} thành viên
                    </p>
                  </div>
                  <span className="text-[var(--color-accent)] text-sm font-medium">
                    Xem chi tiết →
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="section-neumorphic p-6">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
            Thao tác nhanh
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userRole === 'admin' && (
              <button className="neumorphic-button p-4 flex items-center space-x-3">
                <span className="text-xl">➕</span>
                <span>Tạo Team Mới</span>
              </button>
            )}
            {(userRole === 'admin' || userRole === 'manager') && (
              <button className="neumorphic-button p-4 flex items-center space-x-3">
                <span className="text-xl">👨‍💼</span>
                <span>Thêm Thành Viên</span>
              </button>
            )}
            <button className="neumorphic-button p-4 flex items-center space-x-3">
              <span className="text-xl">📊</span>
              <span>Xem Báo Cáo</span>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
  
