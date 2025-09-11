'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';

const SettingsPage: React.FC = () => {
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'member'>('admin'); // Default to admin since this is admin settings page
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user role from localStorage
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('userRole') as 'admin' | 'manager' | 'member';
      if (storedRole) {
        setUserRole(storedRole);
      }
      setIsLoading(false);
    }
  }, []);

  // Show loading while checking role
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Redirect if not admin
  if (userRole !== 'admin') {
    return (
      <MainLayout userRole={userRole}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl text-red-600">🚫</span>
            </div>
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Truy cập bị từ chối
            </h2>
            <p className="text-gray-600">
              Chỉ có quản trị viên mới có thể truy cập trang này.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole={userRole}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            Cài đặt hệ thống
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Quản lý các cài đặt và cấu hình hệ thống
          </p>
        </div>

        {/* Admin Badge */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">👑</span>
            <div>
              <h2 className="text-xl font-bold">Quyền Quản trị viên</h2>
              <p className="text-red-100">Bạn có quyền truy cập đầy đủ vào hệ thống</p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Settings */}
          <div className="section-neumorphic p-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center">
              <span className="mr-2">⚙️</span>
              Cài đặt hệ thống
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">Chế độ bảo trì</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">Tạm dừng hệ thống để bảo trì</p>
                </div>
                <button className="w-12 h-6 bg-gray-300 rounded-full relative transition-colors duration-200 hover:bg-gray-400">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform duration-200"></div>
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">Tự động backup</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">Sao lưu dữ liệu hàng ngày</p>
                </div>
                <button className="w-12 h-6 bg-green-500 rounded-full relative transition-colors duration-200 hover:bg-green-600">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-transform duration-200"></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">Email thông báo</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">Gửi thông báo qua email</p>
                </div>
                <button className="w-12 h-6 bg-green-500 rounded-full relative transition-colors duration-200 hover:bg-green-600">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-transform duration-200"></div>
                </button>
              </div>
            </div>
          </div>

          {/* User Management */}
          <div className="section-neumorphic p-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center">
              <span className="mr-2">👥</span>
              Quản lý người dùng
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-white rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-[var(--color-text-primary)]">Tổng số người dùng</p>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">5</span>
                </div>
              </div>
              
              <div className="p-3 bg-white rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-[var(--color-text-primary)]">Người dùng hoạt động</p>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">5</span>
                </div>
              </div>

              <button className="w-full neumorphic-button mt-4">
                Quản lý người dùng
              </button>
            </div>
          </div>

          {/* Database Settings */}
          <div className="section-neumorphic p-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center">
              <span className="mr-2">💾</span>
              Cơ sở dữ liệu
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-white rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-[var(--color-text-primary)]">Kết nối database</p>
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                </div>
              </div>
              
              <div className="p-3 bg-white rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-[var(--color-text-primary)]">Dung lượng sử dụng</p>
                  <span className="text-sm text-[var(--color-text-secondary)]">2.4 GB / 10 GB</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 neumorphic-button">
                  Sao lưu ngay
                </button>
                <button className="flex-1 py-3 px-4 rounded-xl bg-orange-100 text-orange-700 font-medium hover:bg-orange-200 transition-colors duration-200">
                  Tối ưu DB
                </button>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="section-neumorphic p-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center">
              <span className="mr-2">🔒</span>
              Bảo mật
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">Xác thực 2 lớp</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">Tăng cường bảo mật đăng nhập</p>
                </div>
                <button className="w-12 h-6 bg-gray-300 rounded-full relative transition-colors duration-200 hover:bg-gray-400">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform duration-200"></div>
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">Hết hạn session</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">Tự động đăng xuất sau 24h</p>
                </div>
                <button className="w-12 h-6 bg-green-500 rounded-full relative transition-colors duration-200 hover:bg-green-600">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-transform duration-200"></div>
                </button>
              </div>

              <button className="w-full py-3 px-4 rounded-xl bg-red-100 text-red-700 font-medium hover:bg-red-200 transition-colors duration-200">
                Xem nhật ký bảo mật
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button className="neumorphic-button">
            Lưu thay đổi
          </button>
          <button className="py-3 px-6 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200">
            Khôi phục mặc định
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
