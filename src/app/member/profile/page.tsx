'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import MainLayout from '@/components/layout/MainLayout';
import { uploadAvatar, deleteAvatar } from '@/lib/supabase';

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  department?: string;
  role: string;
  bio?: string;
  joinDate: Date;
  lastLogin?: Date;
  skills: string[];
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    theme: 'light' | 'dark';
  };
  stats?: {
    basic: {
      tasksCompleted: number;
      averageRating: number;
      projectsParticipated: number;
      totalWorkingDays: number;
    };
    detailed: {
      totalTasks: number;
      inProgressTasks: number;
      pendingTasks: number;
      overdueTasks: number;
      completionRate: number;
      recentCompletedTasks: number;
      tasksWithRating: number;
    };
    achievements: Array<{
      id: string;
      title: string;
      description: string;
      icon: string;
      earned: boolean;
      earnedDate?: Date;
    }>;
  };
}

const MemberProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const [activeTab, setActiveTab] = useState<'info' | 'stats' | 'settings'>('info');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchUserStats = async () => {
    try {
      setIsLoadingStats(true);
      
      const response = await fetch('/api/auth/me/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
          'X-User-ID': localStorage.getItem('userId') || ''
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      } else {
        console.error('Failed to load stats:', result.error);
        return null;
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
      return null;
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
          'X-User-ID': localStorage.getItem('userId') || ''
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load profile');
      }

      // Fetch user stats separately
      const userStats = await fetchUserStats();

      // Mock additional data for demo (keeping skills and preferences)
      const mockProfile: UserProfile = {
        ...result.data,
        bio: result.data.bio || "Đây là bio mặc định của member. Tôi là một nhân viên năng động và có kinh nghiệm trong lĩnh vực công nghệ.",
        skills: result.data.skills || ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        preferences: result.data.preferences || {
          notifications: true,
          emailUpdates: true,
          theme: 'light'
        },
        stats: userStats
      };

      setProfile(mockProfile);
      setEditForm(mockProfile);
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchProfile();
    };
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setError(null);

      let avatarUrl = profile?.avatar;
      
      // Upload avatar to Supabase if there's a new file
      if (avatarFile) {
        try {
          setIsUploadingAvatar(true);
          const userId = localStorage.getItem('userId') || 'default-user';
          
          // Delete old avatar if exists
          if (profile?.avatar) {
            await deleteAvatar(profile.avatar);
          }
          
          // Upload new avatar to Supabase
          console.log('Uploading avatar to Supabase...');
          avatarUrl = await uploadAvatar(avatarFile, userId);
          console.log('Avatar uploaded successfully:', avatarUrl);
          
        } catch (uploadError) {
          console.error('Avatar upload failed:', uploadError);
          throw new Error(`Failed to upload avatar: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
        } finally {
          setIsUploadingAvatar(false);
        }
      }

      const updateData = {
        ...editForm,
        avatar: avatarUrl
      };

      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
          'X-User-ID': localStorage.getItem('userId') || '' // Send userId from localStorage
        },
        credentials: 'include',
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile');
      }

      setProfile(prev => prev ? {...prev, ...updateData} : null);
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      
      // Update localStorage for sidebar
      if (updateData.avatar) {
        localStorage.setItem('userAvatar', updateData.avatar);
      }
      if (updateData.firstName || updateData.lastName) {
        const fullName = `${updateData.firstName || ''} ${updateData.lastName || ''}`.trim();
        localStorage.setItem('userName', fullName);
      }
      
      alert('Profile updated successfully!');
      
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    if (hasHalfStar) {
      stars.push('🌟');
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push('☆');
    }
    
    return stars.join(' ');
  };

  if (isLoading) {
    return (
      <MainLayout userRole="member">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  if (error && !profile) {
    return (
      <MainLayout userRole="member">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button 
              onClick={fetchProfile}
              className="neumorphic-button cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout userRole="member">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No profile data available</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="member">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
              My Profile
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-1">
              Quản lý thông tin cá nhân và cài đặt tài khoản
            </p>
          </div>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="neumorphic-button flex items-center space-x-2 cursor-pointer"
            >
              <span>✏️</span>
              <span>Chỉnh sửa</span>
            </button>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditForm(profile);
                  setAvatarFile(null);
                  setAvatarPreview(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving || isUploadingAvatar}
                className="neumorphic-button cursor-pointer disabled:opacity-50"
              >
                {isUploadingAvatar ? 'Đang upload avatar...' : isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Profile Header Card */}
        <div className="section-neumorphic p-6">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center avatar-ring">
                {(avatarPreview || profile.avatar) ? (
                  <Image
                    src={avatarPreview || profile.avatar || '/default-avatar.svg'}
                    alt="Avatar"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl text-white">
                    {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                  </span>
                )}
              </div>
              
              {isEditing && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingAvatar ? '⏳' : '📷'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={isUploadingAvatar}
                  />
                </>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {profile.firstName} {profile.lastName}
                </h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {profile.role}
                </span>
              </div>
              
              <div className="space-y-2 text-[var(--color-text-secondary)]">
                <div className="flex items-center space-x-2">
                  <span>📧</span>
                  <span>{profile.email}</span>
                </div>
                {profile.department && (
                  <div className="flex items-center space-x-2">
                    <span>🏢</span>
                    <span>{profile.department}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <span>📅</span>
                  <span>Tham gia từ: {formatDate(profile.joinDate)}</span>
                </div>
                {profile.lastLogin && (
                  <div className="flex items-center space-x-2">
                    <span>🕐</span>
                    <span>Đăng nhập lần cuối: {formatDate(profile.lastLogin)}</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="mt-4">
                <p className="text-[var(--color-text-primary)] leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="section-neumorphic">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-3 font-medium transition-colors cursor-pointer ${
                activeTab === 'info'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📋 Thông tin cá nhân
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-3 font-medium transition-colors cursor-pointer ${
                activeTab === 'stats'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 Thống kê
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 font-medium transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ⚙️ Cài đặt
            </button>
          </div>

          <div className="p-6">
            {/* Personal Information Tab */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                      Thông tin cơ bản
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                        Họ
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.firstName || ''}
                          onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                          className="w-full px-4 py-2 neumorphic-input border-0 focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-[var(--color-text-primary)]">{profile.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                        Tên
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.lastName || ''}
                          onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                          className="w-full px-4 py-2 neumorphic-input border-0 focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-[var(--color-text-primary)]">{profile.lastName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                        Email
                      </label>
                      <p className="text-[var(--color-text-primary)]">{profile.email}</p>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                        Email không thể thay đổi
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                        Số điện thoại
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editForm.phone || ''}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                          className="w-full px-4 py-2 neumorphic-input border-0 focus:ring-2 focus:ring-blue-500"
                          placeholder="Nhập số điện thoại"
                        />
                      ) : (
                        <p className="text-[var(--color-text-primary)]">
                          {profile.phone || 'Chưa cập nhật'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                      Thông tin bổ sung
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                        Địa chỉ
                      </label>
                      {isEditing ? (
                        <textarea
                          value={editForm.address || ''}
                          onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                          className="w-full px-4 py-2 neumorphic-input border-0 focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Nhập địa chỉ"
                        />
                      ) : (
                        <p className="text-[var(--color-text-primary)]">
                          {profile.address || 'Chưa cập nhật'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                        Phòng ban
                      </label>
                      <p className="text-[var(--color-text-primary)]">
                        {profile.department || 'Chưa xác định'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                        Giới thiệu bản thân
                      </label>
                      {isEditing ? (
                        <textarea
                          value={editForm.bio || ''}
                          onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                          className="w-full px-4 py-2 neumorphic-input border-0 focus:ring-2 focus:ring-blue-500"
                          rows={4}
                          placeholder="Viết vài dòng về bản thân..."
                        />
                      ) : (
                        <p className="text-[var(--color-text-primary)]">
                          {profile.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Skills Section */}
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                    Kỹ năng
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">
                  Thống kê hiệu suất làm việc
                </h3>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="neumorphic-card p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl text-white">✅</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                      {isLoadingStats ? '...' : profile.stats?.basic.tasksCompleted || 0}
                    </p>
                    <p className="text-[var(--color-text-secondary)] text-sm">Tasks hoàn thành</p>
                  </div>

                  <div className="neumorphic-card p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl text-white">⭐</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                      {isLoadingStats ? '...' : `${profile.stats?.basic.averageRating || 0}/5`}
                    </p>
                    <p className="text-[var(--color-text-secondary)] text-sm">Đánh giá trung bình</p>
                    <div className="mt-2 text-lg">
                      {isLoadingStats ? '⭐⭐⭐⭐⭐' : getRatingStars(profile.stats?.basic.averageRating || 0)}
                    </div>
                  </div>

                  <div className="neumorphic-card p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl text-white">📂</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                      {isLoadingStats ? '...' : profile.stats?.basic.projectsParticipated || 0}
                    </p>
                    <p className="text-[var(--color-text-secondary)] text-sm">Dự án tham gia</p>
                  </div>

                  <div className="neumorphic-card p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl text-white">📅</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                      {isLoadingStats ? '...' : profile.stats?.basic.totalWorkingDays || 0}
                    </p>
                    <p className="text-[var(--color-text-secondary)] text-sm">Ngày làm việc</p>
                  </div>
                </div>

                {/* Achievement Badges */}
                <div>
                  <h4 className="text-md font-semibold text-[var(--color-text-primary)] mb-4">
                    Thành tích
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {isLoadingStats ? (
                      // Loading placeholders
                      Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="neumorphic-card p-4 text-center animate-pulse">
                          <div className="text-3xl mb-2">⏳</div>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">Loading...</p>
                          <p className="text-xs text-[var(--color-text-secondary)]">Đang tải...</p>
                        </div>
                      ))
                    ) : profile.stats?.achievements && profile.stats.achievements.length > 0 ? (
                      // Real achievements from API
                      profile.stats.achievements.map((achievement) => (
                        <div key={achievement.id} className="neumorphic-card p-4 text-center">
                          <div className="text-3xl mb-2">{achievement.icon}</div>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            {achievement.title}
                          </p>
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            {achievement.description}
                          </p>
                        </div>
                      ))
                    ) : (
                      // Default achievements if no data
                      <>
                        <div className="neumorphic-card p-4 text-center opacity-50">
                          <div className="text-3xl mb-2">🏆</div>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">Top Performer</p>
                          <p className="text-xs text-[var(--color-text-secondary)]">Hoàn thành 40+ tasks</p>
                        </div>
                        
                        <div className="neumorphic-card p-4 text-center opacity-50">
                          <div className="text-3xl mb-2">🎯</div>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">Quality Master</p>
                          <p className="text-xs text-[var(--color-text-secondary)]">Rating 4.5+ stars</p>
                        </div>
                        
                        <div className="neumorphic-card p-4 text-center opacity-50">
                          <div className="text-3xl mb-2">🚀</div>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">Team Player</p>
                          <p className="text-xs text-[var(--color-text-secondary)]">Tham gia 5+ projects</p>
                        </div>
                        
                        <div className="neumorphic-card p-4 text-center opacity-50">
                          <div className="text-3xl mb-2">💎</div>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">Veteran</p>
                          <p className="text-xs text-[var(--color-text-secondary)]">100+ ngày làm việc</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Detailed Statistics */}
                {profile.stats?.detailed && (
                  <div>
                    <h4 className="text-md font-semibold text-[var(--color-text-primary)] mb-4">
                      Thống kê chi tiết
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="neumorphic-card p-4 text-center">
                        <p className="text-lg font-bold text-blue-600">{profile.stats.detailed.totalTasks}</p>
                        <p className="text-sm text-[var(--color-text-secondary)]">Tổng tasks</p>
                      </div>
                      <div className="neumorphic-card p-4 text-center">
                        <p className="text-lg font-bold text-yellow-600">{profile.stats.detailed.inProgressTasks}</p>
                        <p className="text-sm text-[var(--color-text-secondary)]">Đang thực hiện</p>
                      </div>
                      <div className="neumorphic-card p-4 text-center">
                        <p className="text-lg font-bold text-orange-600">{profile.stats.detailed.pendingTasks}</p>
                        <p className="text-sm text-[var(--color-text-secondary)]">Chờ thực hiện</p>
                      </div>
                      <div className="neumorphic-card p-4 text-center">
                        <p className="text-lg font-bold text-red-600">{profile.stats.detailed.overdueTasks}</p>
                        <p className="text-sm text-[var(--color-text-secondary)]">Quá hạn</p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="neumorphic-card p-4 mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-[var(--color-text-primary)]">Tỷ lệ hoàn thành</span>
                        <span className="text-sm text-[var(--color-text-secondary)]">{profile.stats.detailed.completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${profile.stats.detailed.completionRate}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 text-xs text-[var(--color-text-secondary)]">
                        {profile.stats.detailed.recentCompletedTasks} tasks hoàn thành trong 30 ngày qua
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">
                  Cài đặt tài khoản
                </h3>

                {/* Notification Settings */}
                <div className="neumorphic-card p-6">
                  <h4 className="text-md font-semibold text-[var(--color-text-primary)] mb-4">
                    Thông báo
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[var(--color-text-primary)] font-medium">
                          Thông báo trong ứng dụng
                        </p>
                        <p className="text-[var(--color-text-secondary)] text-sm">
                          Nhận thông báo về tasks và projects
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.preferences?.notifications ?? profile.preferences.notifications}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            preferences: {
                              ...editForm.preferences,
                              ...profile.preferences,
                              notifications: e.target.checked
                            }
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[var(--color-text-primary)] font-medium">
                          Email cập nhật
                        </p>
                        <p className="text-[var(--color-text-secondary)] text-sm">
                          Nhận email về tiến độ công việc
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.preferences?.emailUpdates ?? profile.preferences.emailUpdates}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            preferences: {
                              ...editForm.preferences,
                              ...profile.preferences,
                              emailUpdates: e.target.checked
                            }
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Theme Settings */}
                <div className="neumorphic-card p-6">
                  <h4 className="text-md font-semibold text-[var(--color-text-primary)] mb-4">
                    Giao diện
                  </h4>
                  
                  <div>
                    <p className="text-[var(--color-text-secondary)] text-sm mb-3">
                      Chọn theme hiển thị
                    </p>
                    <div className="flex space-x-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="theme"
                          value="light"
                          checked={(editForm.preferences?.theme ?? profile.preferences.theme) === 'light'}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            preferences: {
                              ...editForm.preferences,
                              ...profile.preferences,
                              theme: e.target.value as 'light' | 'dark'
                            }
                          })}
                          className="mr-2"
                        />
                        <span className="text-[var(--color-text-primary)]">☀️ Light</span>
                      </label>
                      
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="theme"
                          value="dark"
                          checked={(editForm.preferences?.theme ?? profile.preferences.theme) === 'dark'}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            preferences: {
                              ...editForm.preferences,
                              ...profile.preferences,
                              theme: e.target.value as 'light' | 'dark'
                            }
                          })}
                          className="mr-2"
                        />
                        <span className="text-[var(--color-text-primary)]">🌙 Dark</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="neumorphic-card p-6">
                  <h4 className="text-md font-semibold text-[var(--color-text-primary)] mb-4">
                    Bảo mật
                  </h4>
                  
                  <div className="space-y-3">
                    <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">🔑</span>
                        <div>
                          <p className="text-[var(--color-text-primary)] font-medium">
                            Đổi mật khẩu
                          </p>
                          <p className="text-[var(--color-text-secondary)] text-sm">
                            Cập nhật mật khẩu đăng nhập
                          </p>
                        </div>
                      </div>
                    </button>
                    
                    <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">📱</span>
                        <div>
                          <p className="text-[var(--color-text-primary)] font-medium">
                            Xác thực 2 bước
                          </p>
                          <p className="text-[var(--color-text-secondary)] text-sm">
                            Tăng cường bảo mật tài khoản
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Save Settings Button */}
                {isEditing && (
                  <div className="pt-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving || isUploadingAvatar}
                      className="neumorphic-button w-full cursor-pointer disabled:opacity-50"
                    >
                      {isUploadingAvatar ? 'Đang upload avatar...' : isSaving ? 'Đang lưu cài đặt...' : 'Lưu cài đặt'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MemberProfilePage;
