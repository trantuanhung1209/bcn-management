"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: "admin" | "team_leader" | "member" | "viewer";
  department?: string;
  gender?: 'Nam' | 'Nữ' | 'Khác';
  birthday?: string;
  studentId?: string;
  academicYear?: string;
  field?: 'Web' | 'App';
  teams: string[];
  projects: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Team {
  _id: string;
  name: string;
  isActive: boolean;
}

export default function DeletedUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  useEffect(() => {
    fetchDeletedUsers();
    fetchTeams();
  }, []);

  const fetchDeletedUsers = async () => {
    try {
      const response = await fetch("/api/users/deleted");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching deleted users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/teams");
      if (response.ok) {
        const data = await response.json();
        setTeams(data.data.teams);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const handleRestore = async (userId: string) => {
    const user = users.find(u => u._id === userId);
    const userName = user ? (user.fullName || `${user.firstName} ${user.lastName}`) : 'this user';
    
    if (confirm(`Bạn có chắc chắn muốn khôi phục user "${userName}"?`)) {
      try {
        const response = await fetch(`/api/users/${userId}/restore`, {
          method: "POST",
        });

        if (response.ok) {
          fetchDeletedUsers();
          alert(`✅ Đã khôi phục user "${userName}" thành công!`);
        } else {
          const data = await response.json();
          alert(`❌ Lỗi khôi phục user: ${data.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error("Error restoring user:", error);
        alert(`❌ Lỗi khôi phục user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handlePermanentDelete = async (userId: string) => {
    const user = users.find(u => u._id === userId);
    const userName = user ? (user.fullName || `${user.firstName} ${user.lastName}`) : 'this user';
    
    if (confirm(`⚠️ CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN user "${userName}"?\n\nHành động này KHÔNG THỂ HOÀN TÁC!\n\n✅ Nhấn OK để xóa vĩnh viễn\n❌ Nhấn Cancel để hủy`)) {
      try {
        const response = await fetch(`/api/users/${userId}/permanent-delete`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchDeletedUsers();
          alert(`✅ Đã xóa vĩnh viễn user "${userName}" thành công!`);
        } else {
          const data = await response.json();
          alert(`❌ Lỗi xóa vĩnh viễn user: ${data.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error("Error permanently deleting user:", error);
        alert(`❌ Lỗi xóa vĩnh viễn user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handlePermanentDeleteAll = async () => {
    const nonAdminUsers = filteredUsers.filter(user => user.role !== 'admin');
    
    if (nonAdminUsers.length === 0) {
      alert('⚠️ Không có user nào để xóa (không tính admin users)');
      return;
    }
    
    const confirmMessage = `⚠️ CẢNH BÁO CỰC KỲ NGHIÊM TRỌNG!

Bạn có chắc chắn muốn XÓA VĨNH VIỄN TẤT CẢ ${nonAdminUsers.length} users đã bị xóa?

HÀNH ĐỘNG NÀY:
❌ KHÔNG THỂ HOÀN TÁC
❌ SẼ XÓA VĨNH VIỄN KHỎI DATABASE
❌ TẤT CẢ DỮ LIỆU SẼ MẤT HOÀN TOÀN

Danh sách users sẽ bị xóa:
${nonAdminUsers.map(user => `• ${user.fullName || `${user.firstName} ${user.lastName}`} (${user.email})`).join('\n')}

✅ Nhấn OK để XÓA VĨNH VIỄN TẤT CẢ
❌ Nhấn Cancel để hủy`;

    if (confirm(confirmMessage)) {
      // Double confirmation
      if (confirm(`🚨 XÁC NHẬN LẦN CUỐI!\n\nBạn THỰC SỰ muốn xóa vĩnh viễn ${nonAdminUsers.length} users?\n\nHành động này KHÔNG THỂ HOÀN TÁC!`)) {
        try {
          const response = await fetch('/api/users/deleted/permanent-delete-all', {
            method: 'DELETE',
          });

          if (response.ok) {
            const data = await response.json();
            fetchDeletedUsers();
            alert(`✅ Đã xóa vĩnh viễn ${data.deletedCount} users thành công!\n\n${data.message}`);
          } else {
            const data = await response.json();
            alert(`❌ Lỗi xóa vĩnh viễn users: ${data.error || 'Unknown error'}`);
          }
        } catch (error) {
          console.error('Error permanently deleting all users:', error);
          alert(`❌ Lỗi xóa vĩnh viễn users: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }
  };

  const getTeamName = (teamIds: string[]) => {
    if (!teamIds || teamIds.length === 0) return null;
    const team = teams.find((t) => t._id === teamIds[0]);
    return team ? team.name : null;
  };

  // Filter users based on search term and role filter (excluding admin users)
  const filteredUsers = users.filter((user) => {
    // Exclude admin users
    if (user.role === "admin") return false;

    const displayName = user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim();
    const matchesSearch =
      displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <MainLayout userRole="admin">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
                🗑️ Users Đã Xóa
              </h1>
              <p className="text-[var(--color-text-secondary)] mt-1">
                Quản lý các người dùng đã bị xóa - có thể khôi phục hoặc xóa vĩnh viễn
              </p>
            </div>
            <div className="flex space-x-3">
              {filteredUsers.filter(user => user.role !== 'admin').length > 0 && (
                <button
                  onClick={handlePermanentDeleteAll}
                  className="neumorphic-button bg-red-600 hover:bg-red-700 text-white"
                  title={`Xóa vĩnh viễn tất cả ${filteredUsers.filter(user => user.role !== 'admin').length} users`}
                >
                  💀 Xóa tất cả ({filteredUsers.filter(user => user.role !== 'admin').length})
                </button>
              )}
              <button
                onClick={() => window.location.href = '/admin/users'}
                className="neumorphic-button bg-blue-500 hover:bg-blue-600 text-white"
              >
                ← Quay lại Users
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="neumorphic-card p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Search Deleted Users
                </label>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="neumorphic-input w-full px-4 py-3 text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Filter by Role
                </label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="neumorphic-input w-full px-4 py-3 text-[var(--color-text-primary)] focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="team_leader">Team Leader</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="neumorphic-card p-6 text-center">
              <div className="text-4xl mb-3">🗑️</div>
              <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Total Deleted Users
              </h3>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                {filteredUsers.length}
              </p>
            </div>
            <div className="neumorphic-card p-6 text-center">
              <div className="text-4xl mb-3">♻️</div>
              <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Can Be Restored
              </h3>
              <p className="text-2xl font-bold text-[var(--color-text-accent)]">
                {filteredUsers.length}
              </p>
            </div>
            <div className="neumorphic-card p-6 text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Available Actions
              </h3>
              <p className="text-sm font-bold text-[var(--color-text-accent)]">
                Restore • Delete Forever
              </p>
            </div>
          </div>

          {/* Users Table */}
          <div className="neumorphic-card overflow-hidden">
            <div className="section-neumorphic p-6 border-b border-[var(--color-border)]">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Deleted Users ({filteredUsers.length})
              </h2>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="min-w-full">
                <thead
                  style={{ background: "var(--color-background-secondary)" }}
                >
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Academic Year
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Deleted Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {filteredUsers.length > 0
                    ? filteredUsers.map((user) => (
                        <tr
                          key={user._id}
                          className="hover:bg-[var(--color-primary)] transition-colors bg-red-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold opacity-60">
                                  {(user.fullName || user.firstName || "U")
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-[var(--color-text-primary)] opacity-70">
                                  {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim()}
                                </div>
                                <div className="text-xs text-[var(--color-text-secondary)]">
                                  {user.role === "team_leader" ? "👔 Team Leader" : 
                                   user.role === "member" ? "👤 Member" : "👁️ Viewer"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-primary)]">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-200 text-gray-600">
                              {user.gender === 'Nam' ? '👨 Nam' : 
                               user.gender === 'Nữ' ? '👩 Nữ' : 
                               user.gender === 'Khác' ? '🏳️‍⚧️ Khác' : '❓ Chưa có'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-primary)] opacity-70">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-primary)]">
                            {user.academicYear ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-200 text-gray-600">
                                🎓 {user.academicYear}
                              </span>
                            ) : (
                              <span className="text-[var(--color-text-placeholder)]">
                                Chưa có
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-primary)]">
                            {getTeamName(user.teams) ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-200 text-gray-600">
                                👥 {getTeamName(user.teams)}
                              </span>
                            ) : (
                              <span className="text-[var(--color-text-placeholder)]">
                                No team
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                            {new Date(user.updatedAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleRestore(user._id)}
                                className="px-3 py-1 text-sm rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                                title="Khôi phục user"
                              >
                                ♻️ Khôi phục
                              </button>
                              <button
                                onClick={() => handlePermanentDelete(user._id)}
                                className="px-3 py-1 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                                title="Xóa vĩnh viễn user"
                              >
                                💀 Xóa vĩnh viễn
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    : null}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🗑️</div>
                  <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                    No deleted users found
                  </h3>
                  <p className="text-[var(--color-text-secondary)]">
                    {searchTerm || filterRole !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "There are no deleted users at the moment."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}