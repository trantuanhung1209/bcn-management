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
          {name?.charAt(0) || '?'}
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
    {name?.charAt(0) || '?'}
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

const ManagerTeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableUsers, setAvailableUsers] = useState<TeamMember[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState<'all' | 'Nam' | 'Nữ' | 'Khác'>('all');
  const [filterField, setFilterField] = useState<'all' | 'Web' | 'App'>('all');
  const [filterAcademicYear, setFilterAcademicYear] = useState<string>('all');

  // Get current user and team data
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setIsLoading(true);
        
        // Tạm thời dùng userId từ localStorage hoặc test với team leader đã tạo
        // Trong thực tế sẽ lấy từ session/JWT
        const userId = localStorage.getItem('userId') || '507f1f77bcf86cd799439011'; // Fallback ID
        
        // Fetch team leader info và teams
        const response = await fetch(`/api/team_leader/me?userId=${userId}`);
        const data = await response.json();
        
        if (data.success && data.data.teams.length > 0) {
          // Lấy team đầu tiên (team leader chỉ quản lý 1 team)
          const team = data.data.teams[0];
          
          // Fetch chi tiết members của team
          const membersResponse = await fetch(`/api/team_leader/teams/${team._id}/members`);
          const membersData = await membersResponse.json();
          
          if (membersData.success) {
            const teamData = {
              id: membersData.data.team.id,
              name: membersData.data.team.name,
              description: membersData.data.team.description,
              createdDate: membersData.data.team.createdDate,
              status: membersData.data.team.status,
              color: membersData.data.team.color,
              teamType: membersData.data.team.teamType,
              members: membersData.data.members
            };
            
            setTeams([teamData]);
          }
        } else {
          setTeams([]);
        }
      } catch (error) {
        console.error('Error fetching team data:', error);
        setTeams([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  // Fetch available users (users without team)
  const fetchAvailableUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await fetch('/api/users?noTeam=true');
      const data = await response.json();
      
      if (data.success && data.data) {
        // Transform API data to match TeamMember interface
        const transformedUsers = data.data.map((user: any) => ({
          id: user._id?.toString() || user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'Unknown',
          email: user.email || '',
          role: 'member' as const,
          avatar: user.avatar,
          status: user.isActive ? 'active' as const : 'inactive' as const,
          joinedDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '',
          gender: user.gender || 'Khác' as const,
          birthday: user.birthday || '',
          studentId: user.studentId || '',
          academicYear: user.academicYear || '',
          field: user.field || 'Web' as const,
          isUP: user.isUP || false
        }));
        
        setAvailableUsers(transformedUsers);
      } else {
        setAvailableUsers([]);
      }
    } catch (error) {
      console.error('Error fetching available users:', error);
      setAvailableUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleAddMember = async () => {
    if (selectedUserId && teams.length > 0) {
      try {
        const response = await fetch(`/api/team_leader/teams/${teams[0].id}/members`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: selectedUserId
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Thêm member mới vào state
          setTeams(prev => prev.map(team => 
            team.id === teams[0].id 
              ? { ...team, members: [...team.members, data.data] }
              : team
          ));

          // Reset form và cập nhật danh sách user có sẵn
          setSelectedUserId('');
          setShowAddMemberModal(false);
          fetchAvailableUsers(); // Refresh danh sách user có sẵn
        } else {
          alert(data.error || 'Có lỗi xảy ra khi thêm thành viên');
        }
      } catch (error) {
        console.error('Error adding member:', error);
        alert('Có lỗi xảy ra khi thêm thành viên');
      }
    }
  };

  // Filter and search function for members
  const filterMembers = (members: TeamMember[]) => {
    // Hàm để xác định thứ tự ưu tiên của vai trò
    const getRolePriority = (role: string) => {
      switch (role) {
        case 'admin': return 3;
        case 'manager': return 2;
        case 'member': return 1;
        default: return 0;
      }
    };

    // Loại bỏ trùng lặp và ưu tiên vai trò cao hơn
    const uniqueMembers: { [key: string]: TeamMember } = {};
    
    members.forEach(member => {
      const existingMember = uniqueMembers[member.email];
      if (!existingMember || getRolePriority(member.role) > getRolePriority(existingMember.role)) {
        uniqueMembers[member.email] = member;
      }
    });

    const deduplicatedMembers = Object.values(uniqueMembers);

    return deduplicatedMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.studentId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGender = filterGender === 'all' || member.gender === filterGender;
      const matchesField = filterField === 'all' || member.field === filterField;
      const matchesAcademicYear = filterAcademicYear === 'all' || member.academicYear === filterAcademicYear;
      
      return matchesSearch && matchesGender && matchesField && matchesAcademicYear;
    });
  };

  const handleRemoveMember = (member: TeamMember) => {
    setMemberToDelete(member);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete || teams.length === 0) return;

    try {
      const response = await fetch(`/api/team_leader/teams/${teams[0].id}/members?memberId=${memberToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Xóa member khỏi state
        setTeams(prev => prev.map(team => 
          team.id === teams[0].id 
            ? { ...team, members: team.members.filter(member => member.id !== memberToDelete.id) }
            : team
        ));
        
        // Reset states
        setShowDeleteConfirm(false);
        setMemberToDelete(null);
      } else {
        alert(data.error || 'Có lỗi xảy ra khi xóa thành viên');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Có lỗi xảy ra khi xóa thành viên');
    }
  };

  const cancelDeleteMember = () => {
    setShowDeleteConfirm(false);
    setMemberToDelete(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'member': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'manager': return 'Quản lý';
      case 'member': return 'Thành viên';
      default: return role;
    }
  };

  if (isLoading) {
    return (
      <MainLayout userRole="team_leader">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  if (teams.length === 0) {
    return (
      <MainLayout userRole="team_leader">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
            Không có team được phân công
          </h2>
          <p className="text-[var(--color-text-secondary)]">
            Bạn chưa được phân công quản lý team nào. Vui lòng liên hệ admin để được hỗ trợ.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="team_leader">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
              Quản lý {teams[0]?.name || 'Team'}
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-1">
              Quản lý thành viên trong {teams[0]?.name || 'team'} của bạn
            </p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="section-neumorphic p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner text-sm"
                placeholder="Tên, email, MSSV..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Giới tính
              </label>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value as 'all' | 'Nam' | 'Nữ' | 'Khác')}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner text-sm"
              >
                <option value="all">Tất cả</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Lĩnh vực
              </label>
              <select
                value={filterField}
                onChange={(e) => setFilterField(e.target.value as 'all' | 'Web' | 'App')}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner text-sm"
              >
                <option value="all">Tất cả</option>
                <option value="Web">Web</option>
                <option value="App">App</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Niên khóa
              </label>
              <select
                value={filterAcademicYear}
                onChange={(e) => setFilterAcademicYear(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner text-sm"
              >
                <option value="all">Tất cả</option>
                <option value="K20">K20</option>
                <option value="K21">K21</option>
                <option value="K22">K22</option>
                <option value="K23">K23</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterGender('all');
                  setFilterField('all');
                  setFilterAcademicYear('all');
                }}
                className="w-full px-3 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200 text-sm cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Members Table */}
        <div className="section-neumorphic p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Danh sách thành viên ({(() => {
                const filteredMembers = filterMembers(teams[0].members);
                return filteredMembers.length;
              })()})
            </h3>
            <button 
              onClick={() => {
                setShowAddMemberModal(true);
                fetchAvailableUsers();
              }}
              className="neumorphic-button text-sm px-4 py-2"
            >
              ➕ Thêm thành viên
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giới tính</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sinh nhật</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MSSV</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niên khóa</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lĩnh vực</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filterMembers(teams[0].members).map((member) => (
                  <tr key={`team-member-${member.id}`} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        {member.isUP ? (
                          <UPAvatar name={member.name} />
                        ) : (
                          <RegularAvatar name={member.name} />
                        )}
                        <span className="font-medium text-[var(--color-text-primary)]">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{member.gender}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                      {new Date(member.birthday).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{member.studentId}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{member.academicYear}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.field === 'Web' ? 'bg-blue-100 text-blue-800' :
                        member.field === 'App' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {member.field}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{member.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                        {getRoleText(member.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${
                          member.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></span>
                        {member.role !== 'manager' && (
                          <button
                            onClick={() => handleRemoveMember(member)}
                            className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200 cursor-pointer"
                            title="Xóa thành viên"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filterMembers(teams[0].members).length === 0 && (
            <div className="text-center py-8">
              <p className="text-[var(--color-text-secondary)]">Không tìm thấy thành viên nào phù hợp với bộ lọc</p>
            </div>
          )}
        </div>

        {/* Add Member Modal */}
        {showAddMemberModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--color-background)] rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto section-neumorphic">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
                Thêm Thành Viên Mới
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Chọn thành viên từ danh sách
                  </label>
                  
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
                      <span className="ml-2 text-[var(--color-text-secondary)]">Đang tải danh sách...</span>
                    </div>
                  ) : availableUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-2">👤</div>
                      <p className="text-[var(--color-text-secondary)]">
                        Không có user nào chưa tham gia team
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {availableUsers.map((user) => (
                        <div
                          key={`available-user-${user.id}`}
                          onClick={() => setSelectedUserId(user.id)}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            selectedUserId === user.id
                              ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                              : 'border-gray-200 hover:border-[var(--color-accent)]/50 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            {user.isUP ? (
                              <UPAvatar name={user.name} />
                            ) : (
                              <RegularAvatar name={user.name} />
                            )}
                            <div className="flex-1">
                              <h3 className="font-medium text-[var(--color-text-primary)]">
                                {user.name}
                              </h3>
                              <p className="text-sm text-[var(--color-text-secondary)]">
                                {user.email}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  {user.studentId}
                                </span>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  {user.academicYear}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  user.field === 'Web' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                                }`}>
                                  {user.field}
                                </span>
                              </div>
                            </div>
                            {selectedUserId === user.id && (
                              <div className="text-[var(--color-accent)]">
                                ✓
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setSelectedUserId('');
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddMember}
                  disabled={!selectedUserId}
                  className="flex-1 neumorphic-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Thêm thành viên
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && memberToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--color-background)] rounded-2xl p-6 w-full max-w-md section-neumorphic">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
                Xác nhận xóa thành viên
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  {memberToDelete.isUP ? (
                    <UPAvatar name={memberToDelete.name} />
                  ) : (
                    <RegularAvatar name={memberToDelete.name} />
                  )}
                  <div>
                    <h3 className="font-medium text-[var(--color-text-primary)]">
                      {memberToDelete.name}
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {memberToDelete.email}
                    </p>
                  </div>
                </div>
                
                <p className="text-[var(--color-text-secondary)]">
                  Bạn có chắc chắn muốn xóa thành viên này khỏi team không? 
                  Hành động này không thể hoàn tác.
                </p>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={cancelDeleteMember}
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDeleteMember}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors duration-200 cursor-pointer"
                >
                  Xóa thành viên
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ManagerTeamsPage;
