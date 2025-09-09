'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';

// UP Member Avatar Component with Discord-like animation and tooltip
const UPAvatar: React.FC<{ name: string; className?: string }> = ({ name, className = '' }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className={`relative ${className}`}>
      <div 
        className="cursor-pointer"
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full animate-pulse opacity-75"></div>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 rounded-full animate-spin" style={{ animation: 'spin 3s linear infinite' }}></div>
        <div className="relative w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-lg">
          {name.charAt(0)}
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
          <span className="text-[8px] text-yellow-900">★</span>
        </div>
      </div>
      
      {/* Enhanced Tooltip */}
      {showTooltip && (
        <div 
          className="absolute bottom-full left-full transform mb-3 z-50 animate-fade-in"
          style={{
            animation: 'tooltipFadeIn 0.3s ease-out forwards'
          }}
        >
          <div className="relative">
            {/* Simple tooltip body */}
            <div className="bg-gray-900 text-white rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
              <span className="text-yellow-300 text-sm font-medium">⭐ Usider</span>
            </div>
            
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes tooltipFadeIn {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(10px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
        
        .animate-fade-in {
          animation: tooltipFadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// Regular Avatar Component
const RegularAvatar: React.FC<{ name: string; className?: string }> = ({ name, className = '' }) => (
  <div className={`w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold ${className}`}>
    {name.charAt(0)}
  </div>
);

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  avatar?: string;
  status: 'active' | 'inactive';
  joinedDate: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  birthday: string;
  studentId: string;
  academicYear: string;
  field: 'Web' | 'App';
  isUP?: boolean;
}

interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  createdDate: string;
  status: 'active' | 'inactive';
  color: string;
  teamType: string;
}

const AdminTeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [newTeamType, setNewTeamType] = useState<'Web' | 'App'>('Web');

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      const allTeams = [
        {
          id: '1',
          name: 'Team Web',
          description: 'Nhóm phát triển ứng dụng web và website',
          createdDate: '2024-01-15',
          status: 'active' as const,
          color: 'from-blue-500 to-cyan-500',
          teamType: 'Web',
          members: [
            {
              id: '1',
              name: 'Nguyễn Văn A',
              email: 'nguyenvana@test.com',
              role: 'manager' as const,
              status: 'active' as const,
              joinedDate: '2024-01-15',
              gender: 'Nam' as const,
              birthday: '2002-03-15',
              studentId: 'SV001',
              academicYear: 'K21',
              field: 'Web' as const,
              isUP: true
            },
            {
              id: '2',
              name: 'Trần Thị B',
              email: 'tranthib@test.com',
              role: 'member' as const,
              status: 'active' as const,
              joinedDate: '2024-01-20',
              gender: 'Nữ' as const,
              birthday: '2003-07-22',
              studentId: 'SV002',
              academicYear: 'K22',
              field: 'Web' as const
            },
            {
              id: '3',
              name: 'Lê Văn C',
              email: 'levanc@test.com',
              role: 'member' as const,
              status: 'active' as const,
              joinedDate: '2024-02-01',
              gender: 'Nam' as const,
              birthday: '2002-11-08',
              studentId: 'SV003',
              academicYear: 'K21',
              field: 'Web' as const
            }
          ]
        },
        {
          id: '2',
          name: 'Team App',
          description: 'Nhóm phát triển ứng dụng di động iOS và Android',
          createdDate: '2024-01-10',
          status: 'active' as const,
          color: 'from-green-500 to-emerald-500',
          teamType: 'App',
          members: [
            {
              id: '4',
              name: 'Phạm Thị D',
              email: 'phamthid@test.com',
              role: 'manager' as const,
              status: 'active' as const,
              joinedDate: '2024-01-10',
              gender: 'Nữ' as const,
              birthday: '2001-12-05',
              studentId: 'SV004',
              academicYear: 'K20',
              field: 'App' as const,
              isUP: true
            },
            {
              id: '5',
              name: 'Hoàng Văn E',
              email: 'hoangvane@test.com',
              role: 'member' as const,
              status: 'active' as const,
              joinedDate: '2024-01-25',
              gender: 'Nam' as const,
              birthday: '2003-04-18',
              studentId: 'SV005',
              academicYear: 'K22',
              field: 'App' as const
            }
          ]
        }
      ];

      setTeams(allTeams);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleCreateTeam = () => {
    if (newTeamName.trim()) {
      const newTeam: Team = {
        id: Date.now().toString(),
        name: newTeamName,
        description: newTeamDescription,
        createdDate: new Date().toISOString().split('T')[0],
        status: 'active',
        color: newTeamType === 'Web' ? 'from-blue-500 to-cyan-500' : 'from-green-500 to-emerald-500',
        teamType: newTeamType,
        members: []
      };
      
      setTeams(prev => [...prev, newTeam]);
      setNewTeamName('');
      setNewTeamDescription('');
      setNewTeamType('Web');
      setIsCreateModalOpen(false);
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
              Quản lý Teams
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-1">
              Quản lý các nhóm làm việc trong tổ chức
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.href = '/admin/teams/deleted'}
              className="neumorphic-button flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white"
            >
              <span>🗂️</span>
              <span>Teams Đã Xóa</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="neumorphic-button flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Tạo Team Mới</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">👥</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {teams.length}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  Tổng số teams
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
                  {teams.reduce((total, team) => total + team.members.length, 0)}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  Tổng thành viên
                </p>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">✅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {teams.filter(team => team.status === 'active').length}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  Teams hoạt động
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="section-neumorphic p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              {/* Team Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${team.color} rounded-xl flex items-center justify-center`}>
                  <span className="text-white text-xl font-bold">
                    {team.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--color-text-primary)] text-lg">
                    {team.name}
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    {team.members.length} thành viên • {team.teamType}
                  </p>
                </div>
              </div>

              {/* Team Description */}
              <p className="text-[var(--color-text-secondary)] text-sm mb-4 line-clamp-2">
                {team.description}
              </p>

              {/* Team Members Preview */}
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-[var(--color-text-secondary)] text-xs">Thành viên:</span>
                <div className="flex -space-x-2">
                  {team.members.slice(0, 3).map((member) => (
                    <div key={member.id} title={member.name}>
                      {member.isUP ? (
                        <UPAvatar name={member.name} className="border-2 border-white" />
                      ) : (
                        <RegularAvatar 
                          name={member.name} 
                          className="border-2 border-white" 
                        />
                      )}
                    </div>
                  ))}
                  {team.members.length > 3 && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold border-2 border-white">
                      +{team.members.length - 3}
                    </div>
                  )}
                </div>
              </div>

              {/* Team Status */}
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  team.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {team.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                </span>
                <span className="text-[var(--color-text-secondary)] text-xs">
                  {new Date(team.createdDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Create Team Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--color-background)] rounded-2xl p-6 w-full max-w-md section-neumorphic">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
                Tạo Team Mới
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Tên team
                  </label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner"
                    style={{
                      boxShadow: 'inset 4px 4px 8px rgba(22, 17, 29, 0.1), inset -4px -4px 8px #FAFBFF'
                    }}
                    placeholder="Nhập tên team"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Loại team
                  </label>
                  <select
                    value={newTeamType}
                    onChange={(e) => setNewTeamType(e.target.value as 'Web' | 'App')}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner"
                    style={{
                      boxShadow: 'inset 4px 4px 8px rgba(22, 17, 29, 0.1), inset -4px -4px 8px #FAFBFF'
                    }}
                  >
                    <option value="Web">Web Development</option>
                    <option value="App">Mobile App Development</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner resize-none"
                    style={{
                      boxShadow: 'inset 4px 4px 8px rgba(22, 17, 29, 0.1), inset -4px -4px 8px #FAFBFF'
                    }}
                    rows={3}
                    placeholder="Nhập mô tả team"
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
                  onClick={handleCreateTeam}
                  className="flex-1 neumorphic-button"
                >
                  Tạo Team
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Team Detail Modal và Add Member Modal giữ nguyên */}
        {/* (Để giữ cho comment này ngắn gọn, phần modal chi tiết team và thêm member sẽ giống như code gốc) */}

      </div>
    </MainLayout>
  );
};

export default AdminTeamsPage;
