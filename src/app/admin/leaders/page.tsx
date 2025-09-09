'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { User, UserRole } from '@/types';

interface Leader extends Omit<User, 'password'> {
  teamsCount?: number;
  projectsCount?: number;
}

interface LeaderFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  department: string;
}

const LeaderManagementPage: React.FC = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingLeader, setEditingLeader] = useState<Leader | null>(null);
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);
  const [leaderTeams, setLeaderTeams] = useState<any[]>([]);
  
  // Form states
  const [formData, setFormData] = useState<LeaderFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    department: ''
  });
  
  // Filter states
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch leaders from API
  const fetchLeaders = React.useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus !== 'all') params.append('isActive', filterStatus === 'active' ? 'true' : 'false');
      if (filterDepartment !== 'all') params.append('department', filterDepartment);

      const response = await fetch(`/api/leaders?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setLeaders(data.data.leaders || []);
        setCurrentPage(data.data.page || 1);
        setTotalPages(data.data.totalPages || 1);
      } else {
        console.error('Failed to fetch leaders:', data.error);
        // Fallback to mock data for development
        const mockLeaders: Leader[] = [
          {
            _id: '1' as any,
            email: 'leader1@company.com',
            firstName: 'Nguyễn',
            lastName: 'Văn A',
            role: UserRole.TEAM_LEADER,
            department: 'Công nghệ thông tin',
            phone: '0123456789',
            teams: [],
            projects: [],
            isActive: true,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15'),
            teamsCount: 2,
            projectsCount: 5
          },
          {
            _id: '2' as any,
            email: 'leader2@company.com',
            firstName: 'Trần',
            lastName: 'Thị B',
            role: UserRole.TEAM_LEADER,
            department: 'Thiết kế',
            phone: '0987654321',
            teams: [],
            projects: [],
            isActive: true,
            createdAt: new Date('2024-01-10'),
            updatedAt: new Date('2024-01-10'),
            teamsCount: 1,
            projectsCount: 3
          },
          {
            _id: '3' as any,
            email: 'leader3@company.com',
            firstName: 'Lê',
            lastName: 'Văn C',
            role: UserRole.TEAM_LEADER,
            department: 'Marketing',
            phone: '0111222333',
            teams: [],
            projects: [],
            isActive: false,
            createdAt: new Date('2024-02-01'),
            updatedAt: new Date('2024-02-01'),
            teamsCount: 0,
            projectsCount: 1
          }
        ];
        setLeaders(mockLeaders);
      }
    } catch (error) {
      console.error('Error fetching leaders:', error);
      // Fallback to mock data
      const mockLeaders: Leader[] = [
        {
          _id: '1' as any,
          email: 'leader1@company.com',
          firstName: 'Nguyễn',
          lastName: 'Văn A',
          role: UserRole.TEAM_LEADER,
          department: 'Công nghệ thông tin',
          phone: '0123456789',
          teams: [],
          projects: [],
          isActive: true,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          teamsCount: 2,
          projectsCount: 5
        },
        {
          _id: '2' as any,
          email: 'leader2@company.com',
          firstName: 'Trần',
          lastName: 'Thị B',
          role: UserRole.TEAM_LEADER,
          department: 'Thiết kế',
          phone: '0987654321',
          teams: [],
          projects: [],
          isActive: true,
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-10'),
          teamsCount: 1,
          projectsCount: 3
        }
      ];
      setLeaders(mockLeaders);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filterDepartment, filterStatus]);

  // Fetch leader teams
  const fetchLeaderTeams = async (leaderId: string) => {
    try {
      const response = await fetch(`/api/leaders/${leaderId}/teams`);
      const data = await response.json();
      
      if (data.success) {
        setLeaderTeams(data.data.teams || []);
      } else {
        console.error('Failed to fetch leader teams:', data.error);
        setLeaderTeams([]);
      }
    } catch (error) {
      console.error('Error fetching leader teams:', error);
      setLeaderTeams([]);
    }
  };

  useEffect(() => {
    fetchLeaders(currentPage);
  }, [currentPage, fetchLeaders]);

  const filteredLeaders = leaders.filter(leader => {
    if (!leader) return false;
    
    const matchesSearch = (leader.firstName + ' ' + leader.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         leader.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (leader.department || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || leader.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && leader.isActive) ||
      (filterStatus === 'inactive' && !leader.isActive);
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleCreateLeader = async () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      const response = await fetch('/api/leaders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh leaders list
        await fetchLeaders(currentPage);
        resetForm();
        setShowCreateModal(false);
        alert('Tạo leader thành công!');
      } else {
        alert('Lỗi khi tạo leader: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating leader:', error);
      alert('Lỗi khi tạo leader. Vui lòng thử lại.');
    }
  };

  const handleEditLeader = async () => {
    if (!editingLeader || !formData.email || !formData.firstName || !formData.lastName) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      const response = await fetch(`/api/leaders/${editingLeader._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          department: formData.department
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh leaders list
        await fetchLeaders(currentPage);
        resetForm();
        setShowEditModal(false);
        setEditingLeader(null);
        alert('Cập nhật leader thành công!');
      } else {
        alert('Lỗi khi cập nhật leader: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating leader:', error);
      alert('Lỗi khi cập nhật leader. Vui lòng thử lại.');
    }
  };

  const handleDeleteLeader = async (leaderId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa leader này?')) {
      try {
        const response = await fetch(`/api/leaders/${leaderId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          // Refresh leaders list
          await fetchLeaders(currentPage);
          alert('Xóa leader thành công!');
        } else {
          alert('Lỗi khi xóa leader: ' + data.error);
        }
      } catch (error) {
        console.error('Error deleting leader:', error);
        alert('Lỗi khi xóa leader. Vui lòng thử lại.');
      }
    }
  };

  const handleToggleStatus = async (leaderId: string) => {
    const leader = leaders.find(l => l._id?.toString() === leaderId);
    if (!leader) return;

    try {
      const response = await fetch(`/api/leaders/${leaderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !leader.isActive
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh leaders list
        await fetchLeaders(currentPage);
        alert(`${leader.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} leader thành công!`);
      } else {
        alert('Lỗi khi thay đổi trạng thái leader: ' + data.error);
      }
    } catch (error) {
      console.error('Error toggling leader status:', error);
      alert('Lỗi khi thay đổi trạng thái leader. Vui lòng thử lại.');
    }
  };

  const openEditModal = (leader: Leader) => {
    setEditingLeader(leader);
    setFormData({
      email: leader.email,
      password: '', // Don't show existing password
      firstName: leader.firstName,
      lastName: leader.lastName,
      phone: leader.phone || '',
      department: leader.department || ''
    });
    setShowEditModal(true);
  };

  const openDetailModal = async (leader: Leader) => {
    setSelectedLeader(leader);
    setShowDetailModal(true);
    if (leader._id) {
      await fetchLeaderTeams(leader._id.toString());
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      department: ''
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getDepartmentColor = (department: string) => {
    const colors = {
      'Công nghệ thông tin': 'bg-blue-100 text-blue-800',
      'Thiết kế': 'bg-purple-100 text-purple-800',
      'Marketing': 'bg-orange-100 text-orange-800',
      'Kinh doanh': 'bg-green-100 text-green-800',
      'Nhân sự': 'bg-pink-100 text-pink-800'
    };
    return colors[department as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
              Quản lý Leaders
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-1">
              Tạo, chỉnh sửa và quản lý các team leaders trong tổ chức
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="neumorphic-button flex items-center space-x-2"
          >
            <span>👤</span>
            <span>Tạo Leader Mới</span>
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
                  {leaders.length}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  Tổng số leaders
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
                  {leaders.filter(leader => leader.isActive).length}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  Leaders hoạt động
                </p>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-400 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🏢</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {Array.from(new Set(leaders.map(l => l.department).filter(Boolean))).length}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  Phòng ban
                </p>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-400 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📊</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {leaders.reduce((total, leader) => total + (leader.teamsCount || 0), 0)}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  Tổng teams
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
                placeholder="Tìm theo tên, email, phòng ban..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Phòng ban
              </label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner text-sm"
              >
                <option value="all">Tất cả</option>
                <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                <option value="Thiết kế">Thiết kế</option>
                <option value="Marketing">Marketing</option>
                <option value="Kinh doanh">Kinh doanh</option>
                <option value="Nhân sự">Nhân sự</option>
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
                  setFilterDepartment('all');
                  setFilterStatus('all');
                }}
                className="w-full px-3 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200 text-sm"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Leaders Table */}
        <div className="section-neumorphic p-6">
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leader
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phòng ban
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teams
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
                {filteredLeaders.map((leader) => (
                  <tr key={leader._id?.toString()} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {leader.firstName.charAt(0)}{leader.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[var(--color-text-primary)]">
                            {leader.firstName} {leader.lastName}
                          </div>
                          <div className="text-sm text-[var(--color-text-secondary)]">
                            {leader.phone || 'Chưa có số điện thoại'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                      {leader.email}
                    </td>
                    <td className="px-6 py-4">
                      {leader.department ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDepartmentColor(leader.department)}`}>
                          {leader.department}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Chưa phân bổ</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                      {leader.teamsCount || 0} teams
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(leader.isActive)}`}>
                        {leader.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                      {leader.createdAt ? new Date(leader.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailModal(leader)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Xem chi tiết"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => openEditModal(leader)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => leader._id && handleToggleStatus(leader._id.toString())}
                          className={`p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200 ${
                            leader.isActive ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'
                          }`}
                          title={leader.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        >
                          {leader.isActive ? '⏸️' : '▶️'}
                        </button>
                        <button
                          onClick={() => leader._id && handleDeleteLeader(leader._id.toString())}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Xóa"
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

          {filteredLeaders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-[var(--color-text-secondary)]">
                Không tìm thấy leader nào phù hợp với bộ lọc
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg border ${
                  currentPage === page
                    ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        )}

        {/* Create Leader Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--color-background)] rounded-2xl p-6 w-full max-w-md section-neumorphic max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
                Tạo Leader Mới
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner"
                    placeholder="Nhập email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Mật khẩu *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner"
                    placeholder="Nhập mật khẩu"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      Họ *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner"
                      placeholder="Họ"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      Tên *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner"
                      placeholder="Tên"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Phòng ban
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner"
                  >
                    <option value="">Chọn phòng ban</option>
                    <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                    <option value="Thiết kế">Thiết kế</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Kinh doanh">Kinh doanh</option>
                    <option value="Nhân sự">Nhân sự</option>
                  </select>
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
                  onClick={handleCreateLeader}
                  disabled={!formData.email || !formData.password || !formData.firstName || !formData.lastName}
                  className="flex-1 neumorphic-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tạo Leader
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Leader Modal */}
        {showEditModal && editingLeader && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--color-background)] rounded-2xl p-6 w-full max-w-md section-neumorphic max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
                Chỉnh sửa Leader
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner"
                    placeholder="Nhập email"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      Họ *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner"
                      placeholder="Họ"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      Tên *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner"
                      placeholder="Tên"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Phòng ban
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner"
                  >
                    <option value="">Chọn phòng ban</option>
                    <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                    <option value="Thiết kế">Thiết kế</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Kinh doanh">Kinh doanh</option>
                    <option value="Nhân sự">Nhân sự</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingLeader(null);
                    resetForm();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleEditLeader}
                  disabled={!formData.email || !formData.firstName || !formData.lastName}
                  className="flex-1 neumorphic-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Leader Modal */}
        {showDetailModal && selectedLeader && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--color-background)] rounded-2xl p-6 w-full max-w-2xl section-neumorphic max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                  Chi tiết Leader
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="section-neumorphic p-4">
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                    Thông tin cơ bản
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                        Họ tên
                      </label>
                      <p className="text-[var(--color-text-primary)]">
                        {selectedLeader.firstName} {selectedLeader.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                        Email
                      </label>
                      <p className="text-[var(--color-text-primary)]">
                        {selectedLeader.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                        Số điện thoại
                      </label>
                      <p className="text-[var(--color-text-primary)]">
                        {selectedLeader.phone || 'Chưa có'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                        Phòng ban
                      </label>
                      <p className="text-[var(--color-text-primary)]">
                        {selectedLeader.department || 'Chưa phân bổ'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                        Trạng thái
                      </label>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLeader.isActive)}`}>
                        {selectedLeader.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                        Ngày tạo
                      </label>
                      <p className="text-[var(--color-text-primary)]">
                        {selectedLeader.createdAt ? new Date(selectedLeader.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Teams */}
                <div className="section-neumorphic p-4">
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                    Teams đang quản lý ({leaderTeams.length})
                  </h3>
                  {leaderTeams.length > 0 ? (
                    <div className="space-y-3">
                      {leaderTeams.map((team) => (
                        <div key={team._id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-[var(--color-text-primary)]">
                                {team.name}
                              </h4>
                              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                {team.description}
                              </p>
                              <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                                {team.members?.length || 0} thành viên
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(team.isActive)}`}>
                              {team.isActive ? 'Hoạt động' : 'Không hoạt động'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[var(--color-text-secondary)] text-center py-4">
                      Chưa quản lý team nào
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default LeaderManagementPage;
