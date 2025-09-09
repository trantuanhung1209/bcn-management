'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import LogoutConfirmModal from '@/components/ui/LogoutConfirmModal';

interface MainLayoutProps {
  children: React.ReactNode;
  userRole?: 'admin' | 'manager' | 'member';
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, userRole }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [detectedRole, setDetectedRole] = useState<'admin' | 'manager' | 'member'>('member');

  // Detect role from URL path or localStorage
  useEffect(() => {
    if (userRole) {
      setDetectedRole(userRole);
      return;
    }

    // Detect from URL path
    if (pathname.startsWith('/admin')) {
      setDetectedRole('admin');
      if (typeof window !== 'undefined') {
        localStorage.setItem('userRole', 'admin');
      }
    } else if (pathname.startsWith('/manager')) {
      setDetectedRole('manager');
      if (typeof window !== 'undefined') {
        localStorage.setItem('userRole', 'manager');
      }
    } else if (pathname.startsWith('/member')) {
      setDetectedRole('member');
      if (typeof window !== 'undefined') {
        localStorage.setItem('userRole', 'member');
      }
    } else {
      // Try to get from localStorage
      if (typeof window !== 'undefined') {
        const storedRole = localStorage.getItem('userRole') as 'admin' | 'manager' | 'member';
        if (storedRole) {
          setDetectedRole(storedRole);
        }
      }
    }
  }, [pathname, userRole]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setShowLogoutModal(false);
    
    // Simulate logout API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Clear any stored auth data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    
    // Redirect to login page
    router.push('/auth/login');
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar userRole={detectedRole} />
      
      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm px-8 py-4 sticky top-0 z-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Welcome Back!</h2>
              <p className="text-gray-600 text-sm">Manage your teams efficiently</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative bg-white rounded-full p-2 shadow-sm hover:shadow-md transition-all duration-200">
                <span className="text-xl">🔔</span>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </span>
              </div>

              {/* Quick Logout Button */}
              <button
                onClick={() => setShowLogoutModal(true)}
                disabled={isLoggingOut}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Đăng xuất nhanh"
              >
                <span>{isLoggingOut ? '⏳' : '🚪'}</span>
                <span className="hidden sm:inline">
                  {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {children}
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default MainLayout;
