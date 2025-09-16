'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
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
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<'admin' | 'team_leader' | 'member'>('member');
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  // Fetch user data from API
  const fetchUserData = async () => {
    if (typeof window === 'undefined') return;

    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');

    if (!userId || !authToken) {
      console.log('No userId or authToken found in localStorage');
      return;
    }

    setIsLoadingUser(true);
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-User-ID': userId,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const user = result.data;
        setUserName(`${user.firstName} ${user.lastName}`);
        setUserAvatar(user.avatar || null);
        setCurrentRole(user.role || 'member');
        
        // Optional: Update localStorage with fresh data
        localStorage.setItem('userName', `${user.firstName} ${user.lastName}`);
        localStorage.setItem('userRole', user.role || 'member');
        
        console.log('User data fetched successfully:', user);
      } else {
        console.error('Failed to fetch user data:', result.error);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to localStorage if API fails
      const storedName = localStorage.getItem('userName');
      const storedRole = localStorage.getItem('userRole');
      if (storedName) setUserName(storedName);
      if (storedRole && (storedRole === 'admin' || storedRole === 'team_leader' || storedRole === 'member')) {
        setCurrentRole(storedRole);
      }
    } finally {
      setIsLoadingUser(false);
    }
  };

  // Get user data from API and detect role
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Fetch user data from API first
      fetchUserData();

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

  // Listen for storage changes and periodically refresh user data
  useEffect(() => {
    const handleStorageChange = () => {
      // Re-fetch user data when localStorage changes (e.g., after login/logout)
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken');
      
      if (userId && authToken) {
        fetchUserData();
      } else {
        // Clear user data if no auth info
        setUserName('User Name');
        setUserAvatar(null);
        setCurrentRole('member');
      }
    };

    // Listen for custom storage events (when localStorage is updated in same tab)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for updates periodically (for same-tab updates)
    const interval = setInterval(() => {
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken');
      
      if (userId && authToken && !isLoadingUser) {
        fetchUserData();
      }
    }, 30000); // Refresh every 30 seconds

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isLoadingUser]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setShowLogoutModal(false);
    
    // Simulate logout API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Clear any stored auth data (localStorage, cookies, etc.)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userAvatar'); // Remove old avatar reference
    }
    
    // Clear component state
    setUserName('User Name');
    setUserAvatar(null);
    setCurrentRole('member');
    
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
        {
          icon: '👤',
          label: 'Profile',
          href: '/team_leader/profile',
          roles: ['team_leader']
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
        {filteredItems.map((item) => {
          // Check if current page is active
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
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
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed neumorphic-button-hover cursor-pointer"
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
            {isLoadingUser ? (
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
            ) : userAvatar ? (
              <Image
                src={userAvatar}
                alt={userName}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
                onError={() => {
                  console.log('Avatar failed to load, falling back to initials');
                  setUserAvatar(null);
                }}
                onLoadingComplete={(result) => {
                  if (result.naturalWidth === 0) {
                    console.log('Avatar loaded but invalid, falling back to initials');
                    setUserAvatar(null);
                  }
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {isLoadingUser ? 'Loading...' : userName}
              </p>
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
