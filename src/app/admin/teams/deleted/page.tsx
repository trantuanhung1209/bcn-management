'use client';

import { useState, useEffect, useCallback } from 'react';
import MainLayout from '@/components/layout/MainLayout';

interface Team {
  _id: string;
  name: string;
  description?: string;
  teamLeader: {
    _id: string;
    name: string;
    email: string;
  };
  members: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  deletedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface DeletedTeamsResponse {
  success: boolean;
  data: {
    teams: Team[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function DeletedTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeader, setSelectedLeader] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [restoring, setRestoring] = useState<string | null>(null);

  const limit = 10;

  const fetchDeletedTeams = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedLeader) params.append('teamLeader', selectedLeader);

      const response = await fetch(`/api/teams/deleted?${params}`);
      const data: DeletedTeamsResponse = await response.json();

      if (data.success) {
        setTeams(data.data.teams);
        setTotal(data.data.total);
        setTotalPages(data.data.totalPages);
      } else {
        setError('Không thể tải danh sách teams đã xóa');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tải dữ liệu');
      console.error('Error fetching deleted teams:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedLeader]);

  const handleRestore = async (teamId: string) => {
    try {
      setRestoring(teamId);
      const response = await fetch(`/api/teams/${teamId}/restore`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        await fetchDeletedTeams(); // Refresh danh sách
        alert('Khôi phục team thành công!');
      } else {
        alert('Không thể khôi phục team: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error restoring team:', err);
      alert('Có lỗi xảy ra khi khôi phục team');
    } finally {
      setRestoring(null);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchDeletedTeams();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchDeletedTeams();
  }, [fetchDeletedTeams]);

  if (loading && teams.length === 0) {
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
      <div className="space-y-8">
        {/* Header Section */}
        <div className="section-neumorphic p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 via-red-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">🗑️</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">
                  Teams Đã Xóa
                </h1>
                <p className="text-[var(--color-text-secondary)]">
                  Quản lý và khôi phục các team đã bị xóa
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-3xl font-bold text-red-600">{total}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">Teams đã xóa</p>
              </div>
              <button
                onClick={() => window.history.back()}
                className="neumorphic-button flex items-center space-x-2 px-6 py-3"
              >
                <span>←</span>
                <span>Quay lại</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="section-neumorphic p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
              Tìm kiếm & Lọc
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Tìm kiếm team
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập tên team hoặc mô tả..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner border border-gray-200"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Team Leader
              </label>
              <select
                value={selectedLeader}
                onChange={(e) => setSelectedLeader(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner border border-gray-200"
              >
                <option value="">Tất cả Team Leader</option>
              </select>
            </div>
            
            <div className="lg:col-span-4 flex items-end space-x-3">
              <button
                onClick={handleSearch}
                className="neumorphic-button bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 hover:from-blue-600 hover:to-blue-700 flex items-center space-x-2"
              >
                <span>🔍</span>
                <span>Tìm kiếm</span>
              </button>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedLeader('');
                  setCurrentPage(1);
                }}
                className="px-6 py-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200 border border-gray-200"
              >
                Đặt lại
              </button>
            </div>
          </div>
          
          {/* Results Info */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-[var(--color-text-secondary)]">
              <span className="font-medium">Kết quả:</span> Hiển thị {teams.length} trong tổng số {total} teams đã xóa
            </p>
          </div>
        </div>

        {error && (
          <div className="section-neumorphic p-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500">
            <div className="flex items-center space-x-3">
              <span className="text-red-500 text-xl">⚠️</span>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Teams Grid */}
        <div className="section-neumorphic p-6">
          {teams.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">�</span>
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                Không có teams đã xóa
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                Chưa có team nào bị xóa hoặc không tìm thấy kết quả phù hợp
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                  Danh sách Teams đã xóa
                </h2>
                <div className="text-sm text-[var(--color-text-secondary)]">
                  {teams.length} teams
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {teams.map((team) => (
                  <div key={team._id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                    {/* Status Badge */}
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-red-500 to-red-600 text-white px-4 py-2 rounded-bl-xl">
                      <span className="text-xs font-semibold">ĐÃ XÓA</span>
                    </div>
                    
                    {/* Team Header */}
                    <div className="mb-4 pr-20">
                      <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2 line-clamp-1">
                        {team.name}
                      </h3>
                      {team.description && (
                        <p className="text-[var(--color-text-secondary)] text-sm line-clamp-2">
                          {team.description}
                        </p>
                      )}
                    </div>

                    {/* Team Info Grid */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 text-sm">👤</span>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">Team Leader</p>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            {team.teamLeader?.name || 'Không có'}
                          </p>
                          {team.teamLeader?.email && (
                            <p className="text-xs text-[var(--color-text-secondary)]">
                              {team.teamLeader.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-green-600 text-sm">👥</span>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">Thành viên</p>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            {team.members?.length || 0} người
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                            <span className="text-purple-600 text-xs">📅</span>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--color-text-secondary)]">Ngày tạo</p>
                            <p className="text-xs font-medium text-[var(--color-text-primary)]">
                              {new Date(team.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center">
                            <span className="text-red-600 text-xs">🗑️</span>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--color-text-secondary)]">Ngày xóa</p>
                            <p className="text-xs font-medium text-red-600">
                              {new Date(team.deletedAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Members Preview */}
                    {team.members.length > 0 && (
                      <div className="mb-6">
                        <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">
                          Thành viên trong team
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {team.members.slice(0, 4).map((member, index) => (
                            <span
                              key={`${team._id}-member-${member._id}-${index}`}
                              className="px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200"
                            >
                              {member.name}
                            </span>
                          ))}
                          {team.members.length > 4 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium border border-gray-200">
                              +{team.members.length - 4} khác
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleRestore(team._id)}
                        disabled={restoring === team._id}
                        className="w-full neumorphic-button bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
                      >
                        {restoring === team._id ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Đang khôi phục...</span>
                          </>
                        ) : (
                          <>
                            <span>↩️</span>
                            <span>Khôi phục Team</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="section-neumorphic p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="text-sm text-[var(--color-text-secondary)]">
                Trang {currentPage} của {totalPages} ({total} teams)
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="neumorphic-button px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <span>←</span>
                  <span>Trước</span>
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + Math.max(1, currentPage - 2);
                    if (page > totalPages) return null;
                    
                    return (
                      <button
                        key={`pagination-${i}-${page}`}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 min-w-[40px] ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-[var(--color-accent)] to-blue-600 text-white shadow-lg font-medium'
                            : 'neumorphic-button hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }).filter(Boolean)}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="neumorphic-button px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <span>Sau</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
