'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const DashboardRedirectPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Get user role from localStorage and redirect to appropriate dashboard
    if (typeof window !== 'undefined') {
      const userRole = localStorage.getItem('userRole') as 'admin' | 'team_leader' | 'member';
      
      if (userRole) {
        // Map team_leader to its own path
        const dashboardPath = userRole === 'team_leader' ? 'team_leader' : userRole;
        router.push(`/${dashboardPath}/dashboard`);
      } else {
        // No role found, redirect to login
        router.push('/auth/login');
      }
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default DashboardRedirectPage;
