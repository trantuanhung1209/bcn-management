'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';

interface Team {
  id: string;
  name: string;
  description: string;
  type: 'Web' | 'App';
  status: 'active' | 'inactive';
  memberCount: number;
  createdDate: string;
  teamLeader: string;
}

const AdminPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  
  // Form states
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [teamType, setTeamType] = useState<'Web' | 'App'>('Web');
  const [teamLeader, setTeamLeader] = useState('');
  
  // Filter states
  const [filterType, setFilterType] = useState<'all' | 'Web' | 'App'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch teams from API
  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/teams');
      const data = await response.json();
      
      if (data.success) {
        // Transform API data to match our interface
        const transformedTeams: Team[] = (data.data.teams || []).map((team: any) => ({
          id: team._id || team.id || Date.now().toString(),
          name: team.name || 'Unnamed Team',
          description: team.description || 'No description',
          type: team.type || 'Other', // You can map this from team data if available
          status: team.isActive ? 'active' : 'inactive',
          memberCount: (team.members ? team.members.length : 0) + 1, // +1 for team leader
          createdDate: team.createdAt ? team.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
          teamLeader: team.teamLeaderName || 'Team Leader' // You'll need to populate this from user data
        }));
        setTeams(transformedTeams);
      } else {
        console.error('Failed to fetch teams:', data.error);
        // Fallback to mock data for development
        const mockTeams: Team[] = [
          {
            id: '1',
            name: 'Team Web Development',
            description: 'Nhóm phát triển ứng dụng web và website cho khách hàng',
            type: 'Web',
            status: 'active',
            memberCount: 8,
            createdDate: '2024-01-15',
            teamLeader: 'Nguyễn Văn A'
          },
          {
            id: '2',
            name: 'Team Mobile App',
            description: 'Nhóm phát triển ứng dụng di động iOS và Android',
            type: 'App',
            status: 'active',
            memberCount: 6,
            createdDate: '2024-01-10',
            teamLeader: 'Trần Thị B'
          },
          {
            id: '3',
            name: 'Team Research & Development',
            description: 'Nhóm nghiên cứu và phát triển công nghệ mới',
            type: 'Web',
            status: 'inactive',
            memberCount: 4,
            createdDate: '2024-02-01',
            teamLeader: 'Lê Văn C'
          }
        ];
        setTeams(mockTeams);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      // Fallback to mock data
      const mockTeams: Team[] = [
        {
          id: '1',
          name: 'Team Web Development',
          description: 'Nhóm phát triển ứng dụng web và website cho khách hàng',
          type: 'Web',
          status: 'active',
          memberCount: 8,
          createdDate: '2024-01-15',
          teamLeader: 'Nguyễn Văn A'
        },
        {
          id: '2',
          name: 'Team Mobile App',
          description: 'Nhóm phát triển ứng dụng di động iOS và Android',
          type: 'App',
          status: 'active',
          memberCount: 6,
          createdDate: '2024-01-10',
          teamLeader: 'Trần Thị B'
        },
        {
          id: '3',
          name: 'Team Research & Development',
          description: 'Nhóm nghiên cứu và phát triển công nghệ mới',
          type: 'Web',
          status: 'inactive',
          memberCount: 4,
          createdDate: '2024-02-01',
          teamLeader: 'Lê Văn C'
        }
      ];
      setTeams(mockTeams);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const filteredTeams = teams.filter(team => {
    if (!team) return false;
    
    const matchesSearch = (team.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (team.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (team.teamLeader || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || team.type === filterType;
    const matchesStatus = filterStatus === 'all' || team.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateTeam = async () => {
    if (teamName.trim() && teamDescription.trim() && teamLeader.trim()) {
      try {
        const response = await fetch('/api/teams', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: teamName,
            description: teamDescription,
            teamLeader: '507f1f77bcf86cd799439011', // Mock team leader ID - replace with actual user ID
            members: [], // Initially empty
            projects: [] // Initially empty
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Add to local state for immediate UI update
          const newTeam: Team = {
            id: data.data._id,
            name: teamName,
            description: teamDescription,
            type: teamType,
            status: 'active',
            memberCount: 1, // Team leader only
            createdDate: new Date().toISOString().split('T')[0],
            teamLeader: teamLeader
          };
          
          setTeams(prev => [...prev, newTeam]);
          resetForm();
          setShowCreateModal(false);
        } else {
          alert('Lỗi khi tạo team: ' + data.error);
        }
      } catch (error) {
        console.error('Error creating team:', error);
        alert('Lỗi khi tạo team. Vui lòng thử lại.');
      }
    }
  };

  const handleEditTeam = async () => {
    if (editingTeam && teamName.trim() && teamDescription.trim() && teamLeader.trim()) {
      try {
        const response = await fetch(`/api/teams/${editingTeam.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: teamName,
            description: teamDescription,
            teamLeader: '507f1f77bcf86cd799439011', // Mock team leader ID - replace with actual user ID
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Update local state for immediate UI update
          setTeams(prev => prev.map(team => 
            team.id === editingTeam.id 
              ? {
                  ...team,
                  name: teamName,
                  description: teamDescription,
                  type: teamType,
                  teamLeader: teamLeader
                }
              : team
          ));
          resetForm();
          setShowEditModal(false);
          setEditingTeam(null);
        } else {
          alert('Lỗi khi cập nhật team: ' + data.error);
        }
      } catch (error) {
        console.error('Error updating team:', error);
        alert('Lỗi khi cập nhật team. Vui lòng thử lại.');
      }
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa team này?')) {
      try {
        const response = await fetch(`/api/teams/${teamId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          // Remove from local state for immediate UI update
          setTeams(prev => prev.filter(team => team.id !== teamId));
        } else {
          alert('Lỗi khi xóa team: ' + data.error);
        }
      } catch (error) {
        console.error('Error deleting team:', error);
        alert('Lỗi khi xóa team. Vui lòng thử lại.');
      }
    }
  };

  const handleToggleStatus = async (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: team.status === 'inactive' // Toggle status
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state for immediate UI update
        setTeams(prev => prev.map(t => 
          t.id === teamId 
            ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' }
            : t
        ));
      } else {
        alert('Lỗi khi thay đổi trạng thái team: ' + data.error);
      }
    } catch (error) {
      console.error('Error toggling team status:', error);
      alert('Lỗi khi thay đổi trạng thái team. Vui lòng thử lại.');
    }
  };

  const openEditModal = (team: Team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setTeamDescription(team.description);
    setTeamType(team.type);
    setTeamLeader(team.teamLeader);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setTeamName('');
    setTeamDescription('');
    setTeamType('Web');
    setTeamLeader('');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Web': return 'bg-blue-100 text-blue-800';
      case 'App': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
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
              Tạo, chỉnh sửa và quản lý các nhóm làm việc trong tổ chức
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="neumorphic-button flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Tạo Team Mới</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🌐</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {teams.filter(team => team.type === 'Web').length}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  Teams Web
                </p>
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
                  {teams.filter(team => team.type === 'App').length}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  Teams App
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="section-neumorphic p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner text-sm"
                placeholder="Tìm theo tên team, mô tả..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Loại team
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'Web' | 'App')}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner text-sm"
              >
                <option value="all">Tất cả</option>
                <option value="Web">Web</option>
                <option value="App">App</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Trạng thái
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner text-sm"
              >
                <option value="all">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterStatus('all');
                }}
                className="w-full px-3 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200 text-sm"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Teams Table */}
        <div className="section-neumorphic p-6">
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team Leader
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thành viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-[var(--color-text-primary)]">
                          {team?.name || 'Unnamed Team'}
                        </div>
                        <div className="text-sm text-[var(--color-text-secondary)] max-w-xs truncate">
                          {team?.description || 'No description'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(team?.type || 'Other')}`}>
                        {team?.type || 'Other'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                      {team?.teamLeader || 'No Leader'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                      {team?.memberCount || 0} thành viên
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(team?.status || 'inactive')}`}>
                        {team?.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                      {team?.createdDate ? new Date(team.createdDate).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(team)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Chỉnh sửa"
                          disabled={!team}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => team?.id && handleToggleStatus(team.id)}
                          className={`p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200 ${
                            team?.status === 'active' ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'
                          }`}
                          title={team?.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          disabled={!team?.id}
                        >
                          {team?.status === 'active' ? '⏸️' : '▶️'}
                        </button>
                        <button
                          onClick={() => team?.id && handleDeleteTeam(team.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Xóa"
                          disabled={!team?.id}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTeams.length === 0 && (
            <div className="text-center py-8">
              <p className="text-[var(--color-text-secondary)]">
                Không tìm thấy team nào phù hợp với bộ lọc
              </p>
            </div>
          )}
        </div>

        {/* Create Team Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--color-background)] rounded-2xl p-6 w-full max-w-md section-neumorphic">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
                Tạo Team Mới
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Tên team *
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner"
                    placeholder="Nhập tên team"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Mô tả *
                  </label>
                  <textarea
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner resize-none"
                    rows={3}
                    placeholder="Nhập mô tả team"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Loại team
                  </label>
                  <select
                    value={teamType}
                    onChange={(e) => setTeamType(e.target.value as 'Web' | 'App')}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner"
                  >
                    <option value="Web">Web</option>
                    <option value="App">App</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Team Leader *
                  </label>
                  <input
                    type="text"
                    value={teamLeader}
                    onChange={(e) => setTeamLeader(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner"
                    placeholder="Nhập tên team leader"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateTeam}
                  disabled={!teamName.trim() || !teamDescription.trim() || !teamLeader.trim()}
                  className="flex-1 neumorphic-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tạo Team
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Team Modal */}
        {showEditModal && editingTeam && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--color-background)] rounded-2xl p-6 w-full max-w-md section-neumorphic">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
                Chỉnh sửa Team
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Tên team *
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner"
                    placeholder="Nhập tên team"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Mô tả *
                  </label>
                  <textarea
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner resize-none"
                    rows={3}
                    placeholder="Nhập mô tả team"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Loại team
                  </label>
                  <select
                    value={teamType}
                    onChange={(e) => setTeamType(e.target.value as 'Web' | 'App')}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner"
                  >
                    <option value="Web">Web</option>
                    <option value="App">App</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Team Leader *
                  </label>
                  <input
                    type="text"
                    value={teamLeader}
                    onChange={(e) => setTeamLeader(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner"
                    placeholder="Nhập tên team leader"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTeam(null);
                    resetForm();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleEditTeam}
                  disabled={!teamName.trim() || !teamDescription.trim() || !teamLeader.trim()}
                  className="flex-1 neumorphic-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminPage;
