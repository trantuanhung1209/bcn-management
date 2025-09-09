'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  teamId?: string;
  teamName?: string;
  createdAt: string;
  isDeleted?: boolean;
}

interface Team {
  _id: string;
  name: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'member' as 'admin' | 'manager' | 'member',
    teamId: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data.filter((team: Team & { isDeleted?: boolean }) => !team.isDeleted));
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingUser 
        ? `/api/admin/users/${editingUser._id}` 
        : '/api/admin/users';
      
      const method = editingUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchUsers();
        setShowCreateModal(false);
        setEditingUser(null);
        setFormData({
          name: '',
          email: '',
          role: 'member',
          teamId: ''
        });
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      teamId: user.teamId || ''
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchUsers();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-[var(--color-accent-1)] text-[var(--color-text-primary)]';
      case 'manager':
        return 'bg-[var(--color-accent-5)] text-[var(--color-text-primary)]';
      case 'member':
        return 'bg-[var(--color-accent-4)] text-[var(--color-text-primary)]';
      default:
        return 'bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)]';
    }
  };

  // Filter users based on search term and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
          <div className="flex items-center justify-center h-full">
            <div className="neumorphic-card p-8">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-accent)] border-t-transparent"></div>
                <span className="text-lg font-medium text-[var(--color-text-primary)]">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="neumorphic-card p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">User Management</h1>
                <p className="text-[var(--color-text-secondary)]">Manage system users and their roles</p>
              </div>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setFormData({
                    name: '',
                    email: '',
                    role: 'member',
                    teamId: ''
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
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="member">Member</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="neumorphic-card p-6 text-center">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">Total Users</h3>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">{filteredUsers.length}</p>
            </div>
            <div className="neumorphic-card p-6 text-center">
              <div className="text-4xl mb-3">🛡️</div>
              <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">Admins</h3>
              <p className="text-2xl font-bold text-[var(--color-text-accent)]">
                {filteredUsers.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <div className="neumorphic-card p-6 text-center">
              <div className="text-4xl mb-3">👔</div>
              <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">Managers</h3>
              <p className="text-2xl font-bold text-[var(--color-text-accent)]">
                {filteredUsers.filter(u => u.role === 'manager').length}
              </p>
            </div>
            <div className="neumorphic-card p-6 text-center">
              <div className="text-4xl mb-3">👤</div>
              <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">Members</h3>
              <p className="text-2xl font-bold text-[var(--color-text-accent)]">
                {filteredUsers.filter(u => u.role === 'member').length}
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
                <thead style={{ background: 'var(--color-background-secondary)' }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-[var(--color-primary)] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-[var(--color-text-primary)]">{user.name}</div>
                            <div className="text-sm text-[var(--color-text-secondary)]">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role === 'admin' ? '🛡️ Admin' : user.role === 'manager' ? '👔 Manager' : '👤 Member'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-primary)]">
                        {user.teamName ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-[var(--color-secondary)] text-[var(--color-text-primary)]">
                            🏢 {user.teamName}
                          </span>
                        ) : (
                          <span className="text-[var(--color-text-placeholder)]">No team</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                        {new Date(user.createdAt).toLocaleDateString()}
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
                            className="px-3 py-1 text-sm rounded-lg bg-[var(--color-accent-1)] text-[var(--color-text-primary)] hover:bg-red-500 hover:text-white transition-colors"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">No users found</h3>
                  <p className="text-[var(--color-text-secondary)]">
                    {searchTerm || filterRole !== 'all' 
                      ? 'Try adjusting your search or filter criteria.' 
                      : 'Get started by adding your first user.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="neumorphic-card w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="section-neumorphic p-6 border-b border-[var(--color-border)]">
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
                  {editingUser ? '✏️ Edit User' : '➕ Create New User'}
                </h3>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    👤 Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="neumorphic-input w-full px-4 py-3 text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none"
                    placeholder="Enter full name"
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="neumorphic-input w-full px-4 py-3 text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    🎭 Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'manager' | 'member' })}
                    className="neumorphic-input w-full px-4 py-3 text-[var(--color-text-primary)] focus:outline-none"
                  >
                    <option value="member">👤 Member</option>
                    <option value="manager">👔 Manager</option>
                    <option value="admin">🛡️ Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    🏢 Team (Optional)
                  </label>
                  <select
                    value={formData.teamId}
                    onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
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
                  <button
                    type="submit"
                    className="neumorphic-button"
                  >
                    {editingUser ? '💾 Update User' : '➕ Create User'}
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
