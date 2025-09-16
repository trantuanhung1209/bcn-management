'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useRouter } from 'next/navigation';

interface Activity {
  action: string;
  details: string;
  time: string;
  icon: string;
  type: string;
}

interface TeamDetail {
  _id: string;
  name: string;
  memberCount: number;
  projectCount: number;
  activeProjects: number;
  completedProjects: number;
  progress: number;
}

const ManagerDashboardPage: React.FC = () => {
  const [userName, setUserName] = useState('Manager');
  const [userId, setUserId] = useState('');
  const navigate = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [stats, setStats] = useState<{
    totalTeams: number;
    totalMembers: number;
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    webTeams: number;
    appTeams: number;
    teams: TeamDetail[];
    recentActivities: Activity[];
  }>({
    totalTeams: 0,
    totalMembers: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    webTeams: 0,
    appTeams: 0,
    teams: [],
    recentActivities: []
  });

  useEffect(() => {
    // Get user data from localStorage
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData');
      const storedUserName = localStorage.getItem('userName') || 'Team Leader';
      const storedUserId = localStorage.getItem('userId');
      
      console.log('Debug - userData:', userData);
      console.log('Debug - storedUserId:', storedUserId);
      console.log('Debug - storedUserName:', storedUserName);
      
      if (storedUserId) {
        setUserId(storedUserId);
        setUserName(storedUserName);
      } else if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          setUserId(parsedData.id);
          setUserName(storedUserName);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchStats();
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch team leader stats from API
  const fetchStats = async () => {
    setIsLoading(true);
    console.log('Debug - fetchStats userId:', userId);
    try {
      const response = await fetch(`/api/team_leader/dashboard?userId=${userId}`);
      const result = await response.json();
      
      console.log('Debug - API response:', result);
      
      if (result.success && result.data) {
        // Adjust member count to not include team leader
        const adjustedStats = {
          ...result.data,
          totalMembers: Math.max(0, result.data.totalMembers - result.data.totalTeams), // Subtract team leaders from total
          teams: result.data.teams.map((team: TeamDetail) => ({
            ...team,
            memberCount: Math.max(0, team.memberCount - 1) // Subtract team leader from each team
          }))
        };
        setStats(adjustedStats);
      } else {
        console.error('Error fetching stats:', result.error);
        
        // Only use mock data if API completely fails
        const mockStats = getMockStatsForUser(userId, userName);
        setStats(mockStats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      
      // Only use mock data if API completely fails
      const mockStats = getMockStatsForUser(userId, userName);
      setStats(mockStats);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock stats based on user
  const getMockStatsForUser = (userId: string, userName: string) => {
    // Check if this is Web Team Leader (based on name or could be from localStorage)
    const isWebTeamLeader = userName.toLowerCase().includes('web') || 
                           localStorage.getItem('managedTeam') === 'web';
    
    if (isWebTeamLeader) {
      return {
        totalTeams: 1,
        totalMembers: 3, // chỉ members, không tính leader
        totalProjects: 3,
        activeProjects: 2,
        completedProjects: 1,
        webTeams: 1,
        appTeams: 0,
        teams: [
          {
            _id: '68c308fef49db92cbacf180a',
            name: 'Team Web Development',
            memberCount: 3,
            projectCount: 3,
            activeProjects: 2,
            completedProjects: 1,
            progress: 65
          }
        ],
        recentActivities: [
          {
            action: 'Cập nhật project status',
            details: 'Dự án Website BCN chuyển sang giai đoạn testing',
            time: '2 giờ trước',
            icon: '🔄',
            type: 'project'
          },
          {
            action: 'Review code',
            details: 'Đã review và approve pull request #45 cho tính năng login',
            time: '4 giờ trước',
            icon: '�',
            type: 'review'
          },
          {
            action: 'Phân công task',
            details: 'Giao task "Tối ưu performance" cho Nguyễn Văn A',
            time: '1 ngày trước',
            icon: '📋',
            type: 'task'
          }
        ]
      };
    } else {
      // App Team Leader
      return {
        totalTeams: 1,
        totalMembers: 1, // chỉ members, không tính leader
        totalProjects: 2,
        activeProjects: 1,
        completedProjects: 1,
        webTeams: 0,
        appTeams: 1,
        teams: [
          {
            _id: '68c308fef49db92cbacf180c',
            name: 'Team Mobile Development',
            memberCount: 1,
            projectCount: 2,
            activeProjects: 1,
            completedProjects: 1,
            progress: 50
          }
        ],
        recentActivities: [
          {
            action: 'Deploy app',
            details: 'App BCN Mobile v1.2 đã được deploy lên store',
            time: '1 giờ trước',
            icon: '🚀',
            type: 'deploy'
          },
          {
            action: 'Bug fix',
            details: 'Sửa lỗi crash khi load danh sách sản phẩm',
            time: '6 giờ trước',
            icon: '🐛',
            type: 'fix'
          },
          {
            action: 'Feature complete',
            details: 'Hoàn thành tính năng push notification',
            time: '2 ngày trước',
            icon: '✅',
            type: 'feature'
          }
        ]
      };
    }
  };

  // Function to fetch all activities for modal
  const fetchAllActivities = async () => {
    setLoadingActivities(true);
    try {
      const response = await fetch(`/api/team_leader/dashboard?userId=${userId}`);
      const result = await response.json();
      
      if (result.success && result.data.recentActivities) {
        // Update activities from API
        setStats(prev => ({
          ...prev,
          recentActivities: result.data.recentActivities
        }));
      } else {
        // Fallback to mock detailed activities
        const mockActivities = [
          {
            action: 'Cập nhật project status',
            details: 'Dự án Website BCN thay đổi từ in_progress thành testing',
            time: '1 giờ trước',
            icon: '🔄',
            type: 'project'
          },
          {
            action: 'Thêm thành viên mới',
            details: 'Thành viên mới được thêm vào team',
            time: '3 giờ trước',
            icon: '👥',
            type: 'team'
          },
          {
            action: 'Tạo task mới',
            details: 'Tạo task "Thiết kế UI trang chủ" cho team',
            time: '5 giờ trước',
            icon: '✨',
            type: 'task'
          },
          {
            action: 'Hoàn thành project',
            details: 'Dự án đã hoàn thành và deploy thành công',
            time: '1 ngày trước',
            icon: '🎯',
            type: 'project'
          },
          {
            action: 'Review code',
            details: 'Đã review và approve pull request',
            time: '1 ngày trước',
            icon: '👀',
            type: 'review'
          },
          {
            action: 'Tạo sprint mới',
            details: 'Khởi tạo sprint mới cho team',
            time: '2 ngày trước',
            icon: '🚀',
            type: 'sprint'
          },
          {
            action: 'Cập nhật timeline',
            details: 'Điều chỉnh deadline cho dự án',
            time: '3 ngày trước',
            icon: '📅',
            type: 'project'
          }
        ];
        
        setStats(prev => ({
          ...prev,
          recentActivities: mockActivities
        }));
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      
      // Fallback to mock data
      const mockActivities = [
        {
          action: 'Hoạt động không thể tải',
          details: 'Không thể kết nối với server để lấy hoạt động',
          time: 'Vài phút trước',
          icon: '⚠️',
          type: 'error'
        }
      ];
      
      setStats(prev => ({
        ...prev,
        recentActivities: mockActivities
      }));
    } finally {
      setLoadingActivities(false);
    }
  };

  // Function to handle opening activity modal
  const handleOpenActivityModal = () => {
    setShowActivityModal(true);
    fetchAllActivities();
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

  return (
    <MainLayout userRole="team_leader">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            Manager Dashboard
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Chào mừng {userName}! Quản lý các teams của bạn từ đây.
          </p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🏢</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.totalTeams}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Teams của tôi</p>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">👥</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.totalMembers}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Tổng Members</p>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📊</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.totalProjects}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Tổng Projects</p>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">⚡</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.activeProjects}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Projects Đang thực hiện</p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats Cards - Chỉ hiển thị teams thực sự của manager */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">�</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.completedProjects}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Projects Hoàn thành</p>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">⏱️</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {Math.round((stats.completedProjects / stats.totalProjects) * 100) || 0}%
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Tỷ lệ hoàn thành</p>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🔥</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.totalProjects - stats.completedProjects - stats.activeProjects}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Projects Pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Management Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="section-neumorphic p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                Hoạt động gần đây
              </h2>
              <button 
                onClick={handleOpenActivityModal}
                className="text-[var(--color-accent)] hover:text-[var(--color-accent-dark)] text-sm font-medium transition-colors duration-200 cursor-pointer"
              >
                Xem tất cả →
              </button>
            </div>
            <div className="space-y-4">
              {(stats.recentActivities && stats.recentActivities.length > 0 ? stats.recentActivities.slice(0, 5) : [
                {
                  action: 'Cập nhật project status',
                  details: 'Dự án Website thay đổi thành testing',
                  time: '1 giờ trước',
                  icon: '🔄',
                  type: 'project'
                },
                {
                  action: 'Thêm thành viên mới',
                  details: 'Thêm developer vào team App',
                  time: '3 giờ trước',
                  icon: '👥',
                  type: 'team'
                },
                {
                  action: 'Tạo task mới',
                  details: 'Phân công task UI design cho team Web',
                  time: '5 giờ trước',
                  icon: '✨',
                  type: 'task'
                }
              ]).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                  <span className="text-2xl">{activity.icon}</span>
                  <div className="flex-1">
                    <p className="text-[var(--color-text-primary)] font-medium">
                      {activity.action}
                    </p>
                    <p className="text-[var(--color-text-secondary)] text-sm">
                      {activity.details}
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
              Quản lý nhanh
            </h2>
            <div className="space-y-4">
              {[
                {
                  name: 'Quản lý Teams',
                  description: 'Xem và điều chỉnh cấu trúc teams',
                  color: 'from-green-500 to-emerald-500',
                  icon: '🏢',
                  href: '/team_leader/teams'
                },
                {
                  name: 'Quản lý Projects',
                  description: 'Theo dõi tiến độ các dự án',
                  color: 'from-purple-500 to-pink-500',
                  icon: '📊',
                  href: '/team_leader/projects'
                },
                {
                  name: 'Quản lý Members',
                  description: 'Phân công và đánh giá thành viên',
                  color: 'from-blue-500 to-cyan-500',
                  icon: '👥',
                  href: '/team_leader/members'
                }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer">
                  <div className={`w-10 h-10 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center`}>
                    <span className="text-white text-xl">{item.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[var(--color-text-primary)] font-medium">
                      {item.name}
                    </p>
                    <p className="text-[var(--color-text-secondary)] text-sm">
                      {item.description}
                    </p>
                  </div>
                  <span className="text-[var(--color-accent)] text-sm font-medium"
                    onClick={() => {
                      navigate.push(item.href);
                    }}
                  >
                    Truy cập →
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Logs Modal */}
        {showActivityModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] mx-4">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                  Tất cả hoạt động của teams
                </h2>
                <button 
                  onClick={() => setShowActivityModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold cursor-pointer"
                >
                  ×
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {loadingActivities ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <span className="text-2xl">{activity.icon}</span>
                        <div className="flex-1">
                          <p className="text-[var(--color-text-primary)] font-medium">
                            {activity.action}
                          </p>
                          <p className="text-[var(--color-text-secondary)] text-sm">
                            {activity.details}
                          </p>
                        </div>
                        <span className="text-[var(--color-text-secondary)] text-xs">
                          {activity.time}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end p-6 border-t">
                <button 
                  onClick={() => setShowActivityModal(false)}
                  className="neumorphic-button"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ManagerDashboardPage;
