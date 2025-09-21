import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
import { UserModel } from "@/models/User"
import { TeamModel } from "@/models/Team"
import { ProjectModel } from "@/models/Project"
import { NextRequest } from "next/server"

// Password hashing
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
}

// JWT token generation
export const generateToken = (payload: any): string => {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export const verifyToken = (token: string): any => {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.verify(token, secret);
}

// ObjectId validation
export const isValidObjectId = (id: string): boolean => {
  return ObjectId.isValid(id);
}

export const toObjectId = (id: string): ObjectId => {
  if (!isValidObjectId(id)) {
    throw new Error("Invalid ObjectId format");
  }
  return new ObjectId(id);
}

// API response helpers
export const successResponse = <T>(data: T, message?: string) => {
  return {
    success: true,
    data,
    message: message || 'Operation successful'
  };
}

export const errorResponse = (message: string, error?: string) => {
  return {
    success: false,
    message,
    error
  };
}

// Team-based access control for managers
export const getManagerTeams = async (managerId: string): Promise<ObjectId[]> => {
  const manager = await UserModel.findById(managerId);
  if (!manager) return [];
  
  // Get teams where user is manager (team leader) or member
  const userTeams = await TeamModel.findByUser(managerId);
  return userTeams.map(team => team._id!);
}

export const canManagerAccessTeam = async (managerId: string, targetTeamId: string, userRole: string): Promise<boolean> => {
  // Admin can access everything
  if (userRole === 'admin') return true;
  
  // Team leader can only access teams they manage or belong to
  if (userRole === 'team_leader') {
    const managerTeams = await getManagerTeams(managerId);
    return managerTeams.some(teamId => teamId.toString() === targetTeamId);
  }
  
  return false;
}

export const canManagerAccessUser = async (managerId: string, targetUserId: string, userRole: string): Promise<boolean> => {
  // Admin can access everything
  if (userRole === 'admin') return true;
  
  // Team leader can access themselves
  if (managerId === targetUserId) return true;
  
  // Team leader can access users in their teams
  if (userRole === 'team_leader') {
    const managerTeams = await getManagerTeams(managerId);
    const targetUser = await UserModel.findById(targetUserId);
    
    if (!targetUser) return false;
    
    // Check if target user belongs to any of manager's teams
    return targetUser.teams.some(userTeamId => 
      managerTeams.some(managerTeamId => managerTeamId.toString() === userTeamId.toString())
    );
  }
  
  return false;
}

export const canManagerAccessProject = async (managerId: string, projectId: string, userRole: string): Promise<boolean> => {
  // Admin can access everything
  if (userRole === 'admin') return true;
  
  // Team leader can only access projects from their teams
  if (userRole === 'team_leader') {
    const project = await ProjectModel.findById(projectId);
    if (!project) return false;
    
    const managerTeams = await getManagerTeams(managerId);
    return managerTeams.some(teamId => teamId.toString() === project.team.toString());
  }
  
  return false;
}

// Filter data based on manager's team access
export const filterTeamsForManager = async (managerId: string, userRole: string, teams: any[]): Promise<any[]> => {
  if (userRole === 'admin') return teams;
  
  if (userRole === 'team_leader') {
    const managerTeams = await getManagerTeams(managerId);
    const managerTeamIds = managerTeams.map(id => id.toString());
    
    return teams.filter(team => managerTeamIds.includes(team._id.toString()));
  }
  
  return [];
}

export const filterUsersForManager = async (managerId: string, userRole: string, users: any[]): Promise<any[]> => {
  if (userRole === 'admin') return users;
  
  if (userRole === 'team_leader') {
    const managerTeams = await getManagerTeams(managerId);
    const managerTeamIds = managerTeams.map(id => id.toString());
    
    return users.filter(user => 
      user._id.toString() === managerId || // Manager can see themselves
      user.teams.some((userTeamId: ObjectId) => 
        managerTeamIds.includes(userTeamId.toString())
      )
    );
  }
  
  return [];
}

// Get ID from URL path for dynamic routes
export const getIdFromUrl = (request: NextRequest, pathSegment: string = 'id'): string => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  
  // For routes like /api/tasks/[id] - get the id after 'tasks'
  if (pathSegment !== 'id') {
    const index = pathParts.indexOf(pathSegment);
    return index !== -1 && pathParts[index + 1] ? pathParts[index + 1] : '';
  }
  
  // For general dynamic routes, get the last meaningful segment
  return pathParts[pathParts.length - 1] || '';
}

// Get user from authorization token
export const getUserFromToken = async (request: NextRequest): Promise<any | null> => {
  try {
    const authHeader = request.headers.get('authorization');
    console.log('Auth header received:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid auth header found');
      return null;
    }

    const token = authHeader.split(' ')[1];
    console.log('Token extracted:', token ? 'exists' : 'null');
    
    const decoded = verifyToken(token);
    console.log('Token decoded:', decoded);
    
    if (!decoded || !decoded.userId) {
      console.log('Invalid token payload');
      return null;
    }

    const user = await UserModel.findById(decoded.userId);
    console.log('User found:', user ? user._id : 'null');
    return user;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export const filterProjectsForManager = async (managerId: string, userRole: string, projects: any[]): Promise<any[]> => {
  if (userRole === 'admin') return projects;
  
  if (userRole === 'team_leader') {
    const managerTeams = await getManagerTeams(managerId);
    const managerTeamIds = managerTeams.map(id => id.toString());
    
    return projects.filter(project => 
      managerTeamIds.includes(project.team.toString())
    );
  }
  
  return [];
}
