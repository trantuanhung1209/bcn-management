'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useRouter } from 'next/navigation';

const AdminDashboardPage: React.FC = () => {
  const [userName, setUserName] = useState('Admin');
  const navigate = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [allActivities, setAllActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [systemHealth, setSystemHealth] = useState({
    database: { status: 'unknown', uptime: 0, responseTime: 0 },
    api: { status: 'unknown', uptime: 0, responseTime: 0 },
    storage: { status: 'unknown', used: 0, total: 100, available: 100 }
  });
  const [loadingSystemHealth, setLoadingSystemHealth] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeams: 0,
    totalProjects: 0,
    totalLeaders: 0,
    activeUsers: 0,
    webTeams: 0,
    appTeams: 0,
    completedProjects: 0,
    recentActivities: []
  });

  useEffect(() => {
    // Get user name from localStorage
    if (typeof window !== 'undefined') {
      const storedUserName = localStorage.getItem('userName') || 'Admin';
      setUserName(storedUserName);
    }

    // Fetch real admin stats from API
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/stats');
        const result = await response.json();
        
        if (result.success) {
          setStats(result.data);
        } else {
          console.error('Error fetching stats:', result.error);
          // Fallback to mock data if API fails (excluding admin users)
          setStats({
            totalUsers: 20, // Reduced from 25 to exclude admin users
            totalTeams: 8,
            totalProjects: 15,
            totalLeaders: 5,
            activeUsers: 18, // Reduced from 23 to exclude admin users
            webTeams: 5,
            appTeams: 3,
            completedProjects: 12,
            recentActivities: []
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback to mock data if API fails (excluding admin users)
        setStats({
          totalUsers: 20, // Reduced from 25 to exclude admin users
          totalTeams: 8,
          totalProjects: 15,
          totalLeaders: 5,
          activeUsers: 18, // Reduced from 23 to exclude admin users
          webTeams: 5,
          appTeams: 3,
          completedProjects: 12,
          recentActivities: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Function to fetch system health
  const fetchSystemHealth = async () => {
    setLoadingSystemHealth(true);
    try {
      const response = await fetch('/api/admin/system-health');
      const result = await response.json();
      
      if (result.success) {
        setSystemHealth(result.data);
      } else {
        console.error('Error fetching system health:', result.error);
      }
    } catch (error) {
      console.error('Error fetching system health:', error);
    } finally {
      setLoadingSystemHealth(false);
    }
  };

  // Fetch system health on component mount and then every 30 seconds
  useEffect(() => {
    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Function to fetch all activities for modal
  const fetchAllActivities = async () => {
    setLoadingActivities(true);
    try {
      const response = await fetch('/api/admin/activity-logs');
      const result = await response.json();
      
      if (result.success) {
        setAllActivities(result.data);
      } else {
        console.error('Error fetching activity logs:', result.error);
        // Fallback to empty array
        setAllActivities([]);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      setAllActivities([]);
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
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            Admin Dashboard
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Chào mừng {userName}! Quản lý toàn bộ hệ thống từ đây.
          </p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">👥</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.totalUsers}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Tổng Users</p>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🏢</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.totalTeams}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Tổng Teams</p>
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
                <span className="text-white text-xl">👑</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.totalLeaders}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Team Leaders</p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">✅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.activeUsers}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Users Hoạt động</p>
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
                  {stats.webTeams}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Teams Web</p>
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
                  {stats.appTeams}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Teams App</p>
              </div>
            </div>
          </div>

          <div className="section-neumorphic p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🎯</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.completedProjects}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">Projects Hoàn thành</p>
              </div>
            </div>
          </div>
        </div>

        {/* Management Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="section-neumorphic p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                Hoạt động quản trị gần đây
              </h2>
              <button 
                onClick={handleOpenActivityModal}
                className="text-[var(--color-accent)] hover:text-[var(--color-accent-dark)] text-sm font-medium transition-colors duration-200"
              >
                Xem tất cả →
              </button>
            </div>
            <div className="space-y-4">
              {(stats.recentActivities && stats.recentActivities.length > 0 ? stats.recentActivities : [
                {
                  action: 'Tạo team leader mới',
                  details: 'Thêm Nguyễn Văn A vào role Team Leader',
                  time: '2 giờ trước',
                  icon: '👑',
                  type: 'leader'
                },
                {
                  action: 'Cập nhật team configuration',
                  details: 'Thay đổi cấu trúc Team Web Development',
                  time: '4 giờ trước',
                  icon: '🔧',
                  type: 'team'
                },
                {
                  action: 'Phê duyệt project mới',
                  details: 'Dự án E-commerce Platform được phê duyệt',
                  time: '1 ngày trước',
                  icon: '✅',
                  type: 'project'
                },
                {
                  action: 'Backup hệ thống',
                  details: 'Sao lưu dữ liệu định kỳ hoàn thành',
                  time: '2 ngày trước',
                  icon: '💾',
                  type: 'system'
                },
                {
                  action: 'Tạo user mới',
                  details: 'Thêm thành viên mới vào hệ thống',
                  time: '3 ngày trước',
                  icon: '👤',
                  type: 'user'
                }
              ]).slice(0, 5).map((activity, index) => (
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
              Quản lý hệ thống
            </h2>
            <div className="space-y-4">
              {[
                {
                  name: 'Quản lý Users',
                  description: 'Tạo, chỉnh sửa và phân quyền users',
                  color: 'from-blue-500 to-cyan-500',
                  icon: '👥',
                  href: '/admin/users'
                },
                {
                  name: 'Quản lý Teams',
                  description: 'Tổ chức và cấu trúc teams',
                  color: 'from-green-500 to-emerald-500',
                  icon: '🏢',
                  href: '/admin/teams'
                },
                {
                  name: 'Quản lý Leaders',
                  description: 'Phân công và giám sát team leaders',
                  color: 'from-purple-500 to-pink-500',
                  icon: '👑',
                  href: '/admin/leaders'
                },
                {
                  name: 'Quản lý Projects',
                  description: 'Theo dõi và điều phối dự án',
                  color: 'from-orange-500 to-red-500',
                  icon: '📊',
                  href: '/admin/projects'
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

        {/* System Health */}
        <div className="section-neumorphic p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              Tình trạng hệ thống
            </h2>
            {loadingSystemHealth && (
              <div className="w-4 h-4 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Database Health */}
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-secondary)]">Database</span>
                <span className={`w-3 h-3 rounded-full ${
                  systemHealth.database.status === 'healthy' ? 'bg-green-500' :
                  systemHealth.database.status === 'warning' ? 'bg-yellow-500' : 
                  systemHealth.database.status === 'unhealthy' ? 'bg-red-500' : 'bg-gray-400'
                }`}></span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">
                {systemHealth.database.uptime}%
              </p>
              <p className="text-[var(--color-text-secondary)] text-sm">
                {systemHealth.database.status === 'healthy' ? 'Hoạt động tốt' :
                 systemHealth.database.status === 'warning' ? 'Cảnh báo' :
                 systemHealth.database.status === 'unhealthy' ? 'Có vấn đề' : 'Đang kiểm tra...'}
              </p>
              {systemHealth.database.responseTime > 0 && (
                <p className="text-[var(--color-text-secondary)] text-xs mt-1">
                  Response: {systemHealth.database.responseTime}ms
                </p>
              )}
            </div>
            
            {/* API Server Health */}
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-secondary)]">API Server</span>
                <span className={`w-3 h-3 rounded-full ${
                  systemHealth.api.status === 'healthy' ? 'bg-green-500' :
                  systemHealth.api.status === 'warning' ? 'bg-yellow-500' : 
                  systemHealth.api.status === 'unhealthy' ? 'bg-red-500' : 'bg-gray-400'
                }`}></span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">
                {systemHealth.api.uptime}%
              </p>
              <p className="text-[var(--color-text-secondary)] text-sm">
                {systemHealth.api.status === 'healthy' ? 'Hoạt động tốt' :
                 systemHealth.api.status === 'warning' ? 'Cảnh báo' :
                 systemHealth.api.status === 'unhealthy' ? 'Có vấn đề' : 'Đang kiểm tra...'}
              </p>
              {systemHealth.api.responseTime > 0 && (
                <p className="text-[var(--color-text-secondary)] text-xs mt-1">
                  Response: {systemHealth.api.responseTime}ms
                </p>
              )}
            </div>
            
            {/* Storage Health */}
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-secondary)]">Storage</span>
                <span className={`w-3 h-3 rounded-full ${
                  systemHealth.storage.status === 'healthy' ? 'bg-green-500' :
                  systemHealth.storage.status === 'warning' ? 'bg-yellow-500' : 
                  systemHealth.storage.status === 'unhealthy' ? 'bg-red-500' : 'bg-gray-400'
                }`}></span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">
                {systemHealth.storage.used}%
              </p>
              <p className="text-[var(--color-text-secondary)] text-sm">
                {systemHealth.storage.status === 'healthy' ? 'Dung lượng tốt' :
                 systemHealth.storage.status === 'warning' ? 'Sắp đầy' :
                 systemHealth.storage.status === 'unhealthy' ? 'Dung lượng thấp' : 'Đang sử dụng'}
              </p>
              <p className="text-[var(--color-text-secondary)] text-xs mt-1">
                {systemHealth.storage.available}GB còn lại
              </p>
            </div>
          </div>
        </div>

        {/* Activity Logs Modal */}
        {showActivityModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] mx-4">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                  Tất cả hoạt động quản trị
                </h2>
                <button 
                  onClick={() => setShowActivityModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
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
                    {(allActivities.length > 0 ? allActivities : [
                      {
                        action: 'Tạo team leader mới',
                        details: 'Thêm Nguyễn Văn A vào role Team Leader',
                        time: '2 giờ trước',
                        icon: '👑',
                        type: 'leader'
                      },
                      {
                        action: 'Cập nhật team configuration',
                        details: 'Thay đổi cấu trúc Team Web Development',
                        time: '4 giờ trước',
                        icon: '🔧',
                        type: 'team'
                      },
                      {
                        action: 'Phê duyệt project mới',
                        details: 'Dự án E-commerce Platform được phê duyệt',
                        time: '1 ngày trước',
                        icon: '✅',
                        type: 'project'
                      },
                      {
                        action: 'Backup hệ thống',
                        details: 'Sao lưu dữ liệu định kỳ hoàn thành',
                        time: '2 ngày trước',
                        icon: '💾',
                        type: 'system'
                      },
                      {
                        action: 'Tạo user mới',
                        details: 'Thêm thành viên mới vào hệ thống',
                        time: '3 ngày trước',
                        icon: '👤',
                        type: 'user'
                      },
                      {
                        action: 'Cập nhật project status',
                        details: 'Thay đổi trạng thái dự án thành hoàn thành',
                        time: '4 ngày trước',
                        icon: '📊',
                        type: 'project'
                      },
                      {
                        action: 'Thêm thành viên vào team',
                        details: 'Gán user mới vào Team Mobile Development',
                        time: '5 ngày trước',
                        icon: '👥',
                        type: 'team'
                      },
                      {
                        action: 'Tạo dự án mới',
                        details: 'Khởi tạo dự án Website bán hàng',
                        time: '1 tuần trước',
                        icon: '🚀',
                        type: 'project'
                      },
                      {
                        action: 'Cập nhật quyền user',
                        details: 'Nâng cấp user thành Team Leader',
                        time: '1 tuần trước',
                        icon: '👑',
                        type: 'user'
                      },
                      {
                        action: 'Xóa team không hoạt động',
                        details: 'Loại bỏ team đã ngừng hoạt động',
                        time: '2 tuần trước',
                        icon: '🗑️',
                        type: 'team'
                      }
                    ]).map((activity, index) => (
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

export default AdminDashboardPage;
