'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import LogoutConfirmModal from '@/components/ui/LogoutConfirmModal';

interface SidebarProps {
  userRole?: 'admin' | 'team_leader' | 'member';
}

const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userName, setUserName] = useState('User Name');
  const [currentRole, setCurrentRole] = useState<'admin' | 'team_leader' | 'member'>('member');

  // Get user name from localStorage and detect role
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('userName');
      if (storedName) {
        setUserName(storedName);
      }

      // Detect role from userRole prop, URL, or localStorage
      if (userRole) {
        setCurrentRole(userRole);
        localStorage.setItem('userRole', userRole);
      } else if (pathname.startsWith('/admin')) {
        setCurrentRole('admin');
        localStorage.setItem('userRole', 'admin');
      } else if (pathname.startsWith('/team_leader')) {
        setCurrentRole('team_leader');
        localStorage.setItem('userRole', 'team_leader');
      } else if (pathname.startsWith('/member')) {
        setCurrentRole('member');
        localStorage.setItem('userRole', 'member');
      } else {
        const storedRole = localStorage.getItem('userRole');
        if (storedRole) {
          // Convert old 'manager' role to 'team_leader'
          const normalizedRole = storedRole === 'manager' ? 'team_leader' : storedRole;
          if (normalizedRole === 'admin' || normalizedRole === 'team_leader' || normalizedRole === 'member') {
            setCurrentRole(normalizedRole);
          }
        }
      }
    }
  }, [userRole, pathname]);

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
        href: `/${currentRole}/dashboard`,
        roles: ['admin', 'team_leader', 'member']
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
      team_leader: [
        {
          icon: '👥',
          label: 'My Team',
          href: '/team_leader/teams',
          roles: ['team_leader']
        },
        {
          icon: '📊',
          label: 'Projects',
          href: '/team_leader/projects',
          roles: ['team_leader']
        },
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

    return [...baseItems, ...(roleSpecificItems[currentRole] || [])];
  };

  const menuItems = getMenuItems();

  const filteredItems = menuItems.filter(item => 
    item.roles.includes(currentRole)
  );

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 section-neumorphic p-6 z-10">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          TeamHub
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Management System</p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {filteredItems.map((item, index) => {
          // Check if current page is active
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'neumorphic-button bg-[var(--color-accent)] text-white shadow-lg font-semibold' 
                  : 'text-[var(--color-text-primary)] hover:text-[var(--color-accent)] hover:bg-white/50 neumorphic-button-hover'
              }`}
            >
              <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-6 left-6 right-6 space-y-3">
        {/* Logout Button */}
        <button
          onClick={() => setShowLogoutModal(true)}
          disabled={isLoggingOut}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed neumorphic-button-hover"
        >
          <span className="text-xl group-hover:scale-110 transition-transform duration-200">
            {isLoggingOut ? '⏳' : '🚪'}
          </span>
          <span className="font-medium">
            {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </span>
        </button>

        {/* User Info */}
        <div className="bg-[var(--color-background)] rounded-xl p-4 section-neumorphic">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              U
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{userName}</p>
              <p className="text-xs text-[var(--color-text-secondary)] capitalize">
                {currentRole === 'admin' ? 'Quản trị viên' : 
                 currentRole === 'team_leader' ? 'Trưởng nhóm' : 'Thành viên'}
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
