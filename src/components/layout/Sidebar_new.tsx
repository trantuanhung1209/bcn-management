'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LogoutConfirmModal from '@/components/ui/LogoutConfirmModal';

interface SidebarProps {
  userRole?: 'admin' | 'manager' | 'member';
}

const Sidebar: React.FC<SidebarProps> = ({ userRole = 'member' }) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userName, setUserName] = useState('User Name');

  // Get user name from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('userName');
      if (storedName) {
        setUserName(storedName);
      }
    }
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setShowLogoutModal(false);
    
    // Simulate logout API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Clear any stored auth data (localStorage, cookies, etc.)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    
    // Redirect to login page
    router.push('/auth/login');
  };

  const getMenuItems = () => {
    const baseItems = [
      {
        icon: '🏠',
        label: 'Dashboard',
        href: `/${userRole}/dashboard`,
        roles: ['admin', 'manager', 'member']
      }
    ];

    const roleSpecificItems = {
      admin: [
        {
          icon: '👥',
          label: 'Teams',
          href: '/admin/teams',
          roles: ['admin']
        },
        {
          icon: '👨‍💼',
          label: 'Quản lý Leaders',
          href: '/admin/leaders',
          roles: ['admin']
        },
        {
          icon: '👤',
          label: 'Users',
          href: '/admin/users',
          roles: ['admin']
        },
        {
          icon: '📊',
          label: 'Projects',
          href: '/admin/projects',
          roles: ['admin']
        },
        {
          icon: '⚙️',
          label: 'Settings',
          href: '/admin/settings',
          roles: ['admin']
        }
      ],
      manager: [
        {
          icon: '👥',
          label: 'My Team',
          href: '/manager/teams',
          roles: ['manager']
        },
        {
          icon: '📊',
          label: 'Projects',
          href: '/manager/projects',
          roles: ['manager']
        },
        {
          icon: '👨‍👩‍👧‍👦',
          label: 'Members',
          href: '/manager/members',
          roles: ['manager']
        }
      ],
      member: [
        {
          icon: '📋',
          label: 'My Tasks',
          href: '/member/tasks',
          roles: ['member']
        },
        {
          icon: '📊',
          label: 'Projects',
          href: '/member/projects',
          roles: ['member']
        },
        {
          icon: '👤',
          label: 'Profile',
          href: '/member/profile',
          roles: ['member']
        }
      ]
    };

    return [...baseItems, ...(roleSpecificItems[userRole] || [])];
  };

  const menuItems = getMenuItems();

  const filteredItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 section-neumorphic p-6 z-10">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          TeamHub
        </h1>
        <p className="text-sm text-gray-600">Management System</p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {filteredItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:text-blue-600 transition-all duration-200 hover:bg-white group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform duration-200">
              {item.icon}
            </span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-6 left-6 right-6 space-y-3">
        {/* Logout Button */}
        <button
          onClick={() => setShowLogoutModal(true)}
          disabled={isLoggingOut}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-xl group-hover:scale-110 transition-transform duration-200">
            {isLoggingOut ? '⏳' : '🚪'}
          </span>
          <span className="font-medium">
            {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </span>
        </button>

        {/* User Info */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              U
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{userName}</p>
              <p className="text-xs text-gray-600 capitalize">
                {userRole === 'admin' ? 'Quản trị viên' : 
                 userRole === 'manager' ? 'Quản lý' : 'Thành viên'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </aside>
  );
};

export default Sidebar;
