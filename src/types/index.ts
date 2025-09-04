import { ObjectId } from 'mongodb';

// User roles in the system
export enum UserRole {
  ADMIN = 'admin',
  TEAM_LEADER = 'team_leader',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

// Project status
export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  TESTING = 'testing',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled'
}

// Task priority
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Task status
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done'
}

// User interface
export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  department?: string;
  teams: ObjectId[];
  projects: ObjectId[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Team interface
export interface Team {
  _id?: ObjectId;
  name: string;
  description?: string;
  teamLeader: ObjectId;
  members: ObjectId[];
  projects: ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Project interface
export interface Project {
  _id?: ObjectId;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: TaskPriority;
  team: ObjectId;
  assignedTo: ObjectId[];
  startDate: Date;
  endDate?: Date;
  deadline?: Date;
  progress: number; // 0-100
  budget?: number;
  tags: string[];
  attachments: string[];
  isActive: boolean;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Task interface
export interface Task {
  _id?: ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: ObjectId;
  assignedTo: ObjectId;
  createdBy: ObjectId;
  estimatedHours?: number;
  actualHours?: number;
  startDate?: Date;
  dueDate?: Date;
  completedAt?: Date;
  tags: string[];
  comments: Comment[];
  attachments: string[];
  dependencies: ObjectId[]; // other tasks this depends on
  createdAt: Date;
  updatedAt: Date;
}

// Comment interface
export interface Comment {
  _id?: ObjectId;
  content: string;
  author: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Activity Log interface
export interface ActivityLog {
  _id?: ObjectId;
  user: ObjectId;
  action: string;
  target: string; // 'user', 'team', 'project', 'task'
  targetId: ObjectId;
  details: Record<string, any>;
  createdAt: Date;
}

// Dashboard Stats interface
export interface DashboardStats {
  totalUsers: number;
  totalTeams: number;
  totalProjects: number;
  totalTasks: number;
  completedProjects: number;
  completedTasks: number;
  ongoingProjects: number;
  overdueTasks: number;
}

// Auth interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  department?: string;
}

// Session interface
export interface Session {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    avatar?: string;
  };
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Filter and pagination interfaces
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProjectFilter extends PaginationParams {
  status?: ProjectStatus;
  team?: string;
  priority?: TaskPriority;
  search?: string;
}

export interface TaskFilter extends PaginationParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  project?: string;
  assignedTo?: string;
  search?: string;
}

export interface UserFilter extends PaginationParams {
  role?: UserRole;
  department?: string;
  isActive?: boolean;
  search?: string;
}
