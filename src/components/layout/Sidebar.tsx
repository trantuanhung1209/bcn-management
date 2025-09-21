'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  MdDashboard, 
  MdPeople, 
  MdPerson, 
  MdFolder, 
  MdSettings, 
  MdAssignment,
  MdLogout,
  MdAccessTime 
} from 'react-icons/md';
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
  const [userDataFetched, setUserDataFetched] = useState(false); // Track if data was already fetched

  // Fetch user data from API (only once per session)
  const fetchUserData = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');

    if (!userId || !authToken) {
      console.log('No userId or authToken found in localStorage');
      return;
    }

    // Skip if already fetched or currently loading
    if (userDataFetched || isLoadingUser) {
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
        setUserDataFetched(true); // Mark as fetched
        
        // Optional: Update localStorage with fresh data
        localStorage.setItem('userName', `${user.firstName} ${user.lastName}`);
        localStorage.setItem('userRole', user.role || 'member');
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
  }, [userDataFetched, isLoadingUser]);

  // Get user data from API and detect role
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Only fetch if not already fetched
      if (!userDataFetched) {
        fetchUserData();
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
  }, [userRole, pathname, userDataFetched, fetchUserData]);

  // Listen for storage changes only (remove periodic refresh)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Only react to auth-related storage changes
      if (e.key === 'authToken' || e.key === 'userId') {
        const userId = localStorage.getItem('userId');
        const authToken = localStorage.getItem('authToken');
        
        if (userId && authToken) {
          // Reset fetch flag and fetch new data
          setUserDataFetched(false);
          fetchUserData();
        } else {
          // Clear user data if no auth info
          setUserName('User Name');
          setUserAvatar(null);
          setCurrentRole('member');
          setUserDataFetched(false);
        }
      }
    };

    // Listen for custom storage events (when localStorage is updated in another tab)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchUserData]);

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
    setUserDataFetched(false); // Reset fetch flag
    
    // Redirect to login page
    router.push('/auth/login');
  };

  const getMenuItems = () => {
    const baseItems = [
      {
        icon: MdDashboard,
        label: 'Dashboard',
        href: `/${currentRole}/dashboard`,
        roles: ['admin', 'team_leader', 'member']
      }
    ];

    const roleSpecificItems = {
      admin: [
        {
          icon: MdPeople,
          label: 'Teams',
          href: '/admin/teams',
          roles: ['admin']
        },
        {
          icon: MdPerson,
          label: 'Users',
          href: '/admin/users',
          roles: ['admin']
        },
        {
          icon: MdFolder,
          label: 'Projects',
          href: '/admin/projects',
          roles: ['admin']
        },
        {
          icon: MdSettings,
          label: 'Settings',
          href: '/admin/settings',
          roles: ['admin']
        }
      ],
      team_leader: [
        {
          icon: MdPeople,
          label: 'My Team',
          href: '/team_leader/teams',
          roles: ['team_leader']
        },
        {
          icon: MdFolder,
          label: 'Projects',
          href: '/team_leader/projects',
          roles: ['team_leader']
        },
        {
          icon: MdPerson,
          label: 'Profile',
          href: '/team_leader/profile',
          roles: ['team_leader']
        }
      ],
      member: [
        {
          icon: MdAssignment,
          label: 'My Tasks',
          href: '/member/tasks',
          roles: ['member']
        },
        {
          icon: MdFolder,
          label: 'Projects',
          href: '/member/projects',
          roles: ['member']
        },
        {
          icon: MdPerson,
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
    <aside className="fixed left-0 top-0 h-screen w-64 section-neumorphic p-6 z-10"
      style={{
        borderRadius: '0 0px 0px 0 '
      }}
    >
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
          const IconComponent = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'text-[var(--color-accent)] bg-[var(--color-accent)]shadow-lg font-semibold' 
                  : 'text-[var(--color-text-primary)] hover:text-[var(--color-accent)] hover:bg-white/50 neumorphic-button-hover'
              }`}
            >
              <IconComponent className="text-xl group-hover:scale-110 transition-transform duration-200" />
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
          {isLoggingOut ? (
            <MdAccessTime className="text-xl group-hover:scale-110 transition-transform duration-200" />
          ) : (
            <MdLogout className="text-xl group-hover:scale-110 transition-transform duration-200" />
          )}
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
                onLoad={(event) => {
                  const img = event.target as HTMLImageElement;
                  if (img.naturalWidth === 0) {
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
