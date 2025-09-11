"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";

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
        <div className="relative w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold border-2 border-white shadow-lg">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
          <span className="text-[8px] text-yellow-900">★</span>
        </div>
      </div>
      
      {/* Enhanced Tooltip */}
      {showTooltip && (
        <div 
          className="absolute bottom-full left-[200%] transform -translate-x-1/2 mb-3 z-50 animate-fade-in"
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
  isUP?: boolean;
  createdAt: string;
}

interface Team {
  _id: string;
  name: string;
  isActive: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "member" as "team_leader" | "member" | "viewer",
    teamId: "",
  });

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/teams");
      if (response.ok) {
        const data = await response.json();
        setTeams(data.data.teams.filter((team: Team) => team.isActive));
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingUser ? `/api/users/${editingUser._id}` : "/api/users";

      const method = editingUser ? "PUT" : "POST";

      // Prepare data to send
      const submitData = editingUser 
        ? {
            // When editing, send role and teams (always send teams array to update team associations)
            role: formData.role,
            teams: formData.teamId ? [formData.teamId] : []
          }
        : {
            // When creating, send all fields
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            role: formData.role,
            ...(formData.teamId && { teams: [formData.teamId] })
          };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        fetchUsers();
        setShowCreateModal(false);
        setEditingUser(null);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          role: "member",
          teamId: "",
        });
        
        // Show success message
        const action = editingUser ? "cập nhật" : "tạo";
        const userName = editingUser 
          ? (editingUser.fullName || `${editingUser.firstName} ${editingUser.lastName}`)
          : `${formData.firstName} ${formData.lastName}`;
        alert(`✅ Đã ${action} user "${userName}" thành công!`);
      } else {
        const errorData = await response.json();
        alert(`❌ Lỗi ${editingUser ? "cập nhật" : "tạo"} user: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error saving user:", error);
      alert(`❌ Lỗi ${editingUser ? "cập nhật" : "tạo"} user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role === "admin" ? "member" : user.role, // Convert admin to member for editing
      teamId: user.teams && user.teams.length > 0 ? user.teams[0] : "",
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (userId: string) => {
    const user = users.find(u => u._id === userId);
    const userName = user ? (user.fullName || `${user.firstName} ${user.lastName}`) : 'this user';
    
    if (confirm(`Bạn có chắc chắn muốn xóa user "${userName}"?\n\nUser sẽ được chuyển vào thùng rác và có thể khôi phục sau.`)) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchUsers();
          alert(`✅ Đã xóa user "${userName}" thành công! User có thể được khôi phục từ trang "Users Đã Xóa".`);
        } else {
          const data = await response.json();
          alert(`❌ Lỗi xóa user: ${data.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        alert(`❌ Lỗi xóa user: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
                Quản lý Users
              </h1>
              <p className="text-[var(--color-text-secondary)] mt-1">
                Tạo, chỉnh sửa và quản lý các người dùng trong tổ chức
              </p>
            </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.href = '/admin/users/deleted'}
              className="neumorphic-button bg-orange-500 hover:bg-orange-600 text-white"
            >
              🗂️ Users Đã Xóa
            </button>
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/seed', { method: 'POST' });
                  const data = await response.json();
                  if (data.success) {
                    alert('Dữ liệu mẫu đã được tạo thành công!');
                    fetchUsers(); // Refresh data
                  } else {
                    alert('Lỗi tạo dữ liệu mẫu: ' + data.error);
                  }
                } catch (error) {
                  alert('Lỗi: ' + (error instanceof Error ? error.message : 'Unknown error'));
                }
              }}
              className="neumorphic-button bg-purple-500 hover:bg-purple-600 text-white"
            >
              🔧 Tạo Dữ Liệu Mẫu
            </button>
            <button
                onClick={() => {
                  setEditingUser(null);
                  setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    role: "member",
                    teamId: "",
                  });
                  setShowCreateModal(true);
                }}
                className="neumorphic-button"
              >
                ➕ Add New User
              </button>
          </div>
          </div>

          {/* Search and Filter */}
          <div className="neumorphic-card p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Search Users
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
              <div className="text-4xl mb-3">👥</div>
              <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Total Users
              </h3>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                {filteredUsers.length}
              </p>
            </div>
            <div className="neumorphic-card p-6 text-center">
              <div className="text-4xl mb-3">👔</div>
              <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Team Leaders
              </h3>
              <p className="text-2xl font-bold text-[var(--color-text-accent)]">
                {filteredUsers.filter((u) => u.role === "team_leader").length}
              </p>
            </div>
            <div className="neumorphic-card p-6 text-center">
              <div className="text-4xl mb-3">👤</div>
              <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Members
              </h3>
              <p className="text-2xl font-bold text-[var(--color-text-accent)]">
                {filteredUsers.filter((u) => u.role === "member").length}
              </p>
            </div>
          </div>

          {/* Users Table */}
          <div className="neumorphic-card overflow-hidden">
            <div className="section-neumorphic p-6 border-b border-[var(--color-border)]">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                All Users ({filteredUsers.length})
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
                          className="hover:bg-[var(--color-primary)] transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {user.isUP ? (
                                  <UPAvatar 
                                    name={user.fullName || user.firstName || "U"} 
                                    className=""
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white font-semibold">
                                    {(user.fullName || user.firstName || "U")
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-[var(--color-text-primary)]">
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
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-[var(--color-secondary)] text-[var(--color-text-primary)]">
                              {user.gender === 'Nam' ? '👨 Nam' : 
                               user.gender === 'Nữ' ? '👩 Nữ' : 
                               user.gender === 'Khác' ? '🏳️‍⚧️ Khác' : '❓ Chưa có'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-primary)]">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-primary)]">
                            {user.academicYear ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-[var(--color-accent-4)] text-[var(--color-text-primary)]">
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
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-[var(--color-secondary)] text-[var(--color-text-primary)]">
                                👥 {getTeamName(user.teams)}
                              </span>
                            ) : (
                              <span className="text-[var(--color-text-placeholder)]">
                                No team
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEdit(user)}
                                className="px-3 py-1 text-sm rounded-lg bg-[var(--color-accent-5)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent)] transition-colors"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDelete(user._id)}
                                className="px-3 py-1 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                                title="Xóa user (có thể khôi phục)"
                              >
                                🗑️ Xóa
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
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                    No users found
                  </h3>
                  <p className="text-[var(--color-text-secondary)]">
                    {searchTerm || filterRole !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "Get started by adding your first user."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="neumorphic-card w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="section-neumorphic p-6 border-b border-[var(--color-border)]">
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
                  {editingUser ? "✏️ Edit User" : "➕ Create New User"}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {!editingUser && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        👤 First Name
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        className="neumorphic-input w-full px-4 py-3 text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none"
                        placeholder="Enter first name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        👤 Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className="neumorphic-input w-full px-4 py-3 text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none"
                        placeholder="Enter last name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        ✉️ Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="neumorphic-input w-full px-4 py-3 text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none"
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                  </>
                )}

                {editingUser && (
                  <div className="bg-[var(--color-background-secondary)] p-4 rounded-lg mb-4">
                    <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">User Information</h4>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      <strong>Name:</strong> {editingUser.fullName || `${editingUser.firstName} ${editingUser.lastName}`}
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      <strong>Email:</strong> {editingUser.email}
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      <strong>Current Team:</strong> {getTeamName(editingUser.teams) || 'No team assigned'}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    🎭 Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as
                          | "team_leader"
                          | "member"
                          | "viewer",
                      })
                    }
                    className="neumorphic-input w-full px-4 py-3 text-[var(--color-text-primary)] focus:outline-none"
                  >
                    <option value="member">👤 Member</option>
                    <option value="team_leader">👔 Team Leader</option>
                    <option value="viewer">👁️ Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    👥 {editingUser ? 'Change Team' : 'Team (Optional)'}
                  </label>
                  <select
                    value={formData.teamId}
                    onChange={(e) =>
                      setFormData({ ...formData, teamId: e.target.value })
                    }
                    className="neumorphic-input w-full px-4 py-3 text-[var(--color-text-primary)] focus:outline-none"
                  >
                    <option value="">No team assigned</option>
                    {teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingUser(null);
                    }}
                    className="px-6 py-3 text-[var(--color-text-secondary)] bg-[var(--color-background-secondary)] rounded-lg hover:bg-[var(--color-border)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="neumorphic-button">
                    {editingUser ? "💾 Update User" : "➕ Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
