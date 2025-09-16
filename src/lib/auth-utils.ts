// Utility functions for authentication and session management
import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { UserModel } from '@/models/User';

export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
}

// Get user session from localStorage or sessionStorage
export function getUserSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    if (userData) {
      return JSON.parse(userData);
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
  }
  
  return null;
}

// Save user session to localStorage
export function saveUserSession(user: UserSession): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('userData', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

// Remove user session
export function removeUserSession(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('userData');
  sessionStorage.removeItem('userData');
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getUserSession() !== null;
}

// Check if user has specific role
export function hasRole(requiredRole: string): boolean {
  const user = getUserSession();
  return user?.role === requiredRole;
}

// Get user ID from session
export function getUserId(): string | null {
  const user = getUserSession();
  return user?.id || null;
}

// Redirect to login if not authenticated
export function requireAuth(): void {
  if (typeof window === 'undefined') return;
  
  if (!isAuthenticated()) {
    window.location.href = '/auth/login';
  }
}

// Redirect based on user role
export function redirectByRole(): void {
  if (typeof window === 'undefined') return;
  
  const user = getUserSession();
  if (!user) {
    window.location.href = '/auth/login';
    return;
  }
  
  switch (user.role) {
    case 'admin':
      window.location.href = '/admin/dashboard';
      break;
    case 'team_leader':
    case 'team_leader':
      window.location.href = '/team_leader/dashboard';
      break;
    case 'member':
      window.location.href = '/member/dashboard';
      break;
    default:
      window.location.href = '/dashboard';
  }
}

// Check if manager can access team data
export function canManagerAccessTeam(managerId: string, targetTeamId: string, managerTeams: string[]): boolean {
  // Admin can access everything
  const user = getUserSession();
  if (user?.role === 'admin') return true;
  
  // Team leader can only access teams they manage or belong to
  if (user?.role === 'team_leader') {
    return managerTeams.includes(targetTeamId);
  }
  
  return false;
}

// Check if manager can access user data (if user belongs to same team)
export function canManagerAccessUser(managerId: string, targetUserId: string, managerTeams: string[], userTeams: string[]): boolean {
  // Admin can access everything
  const user = getUserSession();
  if (user?.role === 'admin') return true;
  
  // Manager can access themselves
  if (managerId === targetUserId) return true;
  
  // Team leader can access users in their teams
  if (user?.role === 'team_leader') {
    return managerTeams.some(teamId => userTeams.includes(teamId));
  }
  
  return false;
}

// Check if manager can access project data (if project belongs to their team)
export function canManagerAccessProject(managerId: string, projectTeamId: string, managerTeams: string[]): boolean {
  // Admin can access everything
  const user = getUserSession();
  if (user?.role === 'admin') return true;
  
  // Manager can only access projects from their teams
  if (user?.role === 'team_leader') {
    return managerTeams.includes(projectTeamId);
  }
  
  return false;
}

// Get teams that a manager can access
export function getManagerAccessibleTeams(managerId: string, allTeams: any[]): any[] {
  const user = getUserSession();
  if (user?.role === 'admin') return allTeams;
  
  if (user?.role === 'team_leader') {
    // Return teams where manager is team leader or member
    return allTeams.filter(team => 
      team.teamLeader.toString() === managerId || 
      team.members.some((member: any) => member.toString() === managerId)
    );
  }
  
  return [];
}

// Get user from token (server-side)
export async function getUserFromToken(request: NextRequest): Promise<UserSession | null> {
  try {
    // Try to get token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      // Get user from database
      const user = await UserModel.findById(decoded.userId);
      if (!user) return null;
      
      return {
        id: user._id!.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar
      };
    }

    // Try to get token from cookies
    const token = request.cookies.get('auth-token')?.value;
    if (token) {
      const decoded = verifyToken(token);
      
      // Get user from database
      const user = await UserModel.findById(decoded.userId);
      if (!user) return null;
      
      return {
        id: user._id!.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar
      };
    }

    return null;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}