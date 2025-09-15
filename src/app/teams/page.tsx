'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const TeamsRedirectPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Get user role from localStorage and redirect to appropriate teams page
    if (typeof window !== 'undefined') {
      const userRole = localStorage.getItem('userRole') as 'admin' | 'team_leader' | 'member';
      
      if (userRole === 'admin') {
        // Admin có thể ở trang này
      } else if (userRole === 'team_leader') {
        router.push('/team_leader/teams');
      } else {
        // Members don't have access to teams management, redirect to dashboard
        router.push('/member/dashboard');
      }
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default TeamsRedirectPage;
