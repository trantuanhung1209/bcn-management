import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Authentication utilities
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    
    if (userData) {
      const parsedData = JSON.parse(userData);
      return parsedData.token || null;
    }
    
    // Fallback to direct authToken
    const fallbackToken = localStorage.getItem('authToken');
    return fallbackToken;
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  
  return null;
}

export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

export const apiRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const defaultOptions: RequestInit = {
    headers: getAuthHeaders(),
    credentials: 'include', // Include cookies in request
    ...options,
  };
  
  // Merge headers if provided
  if (options.headers) {
    defaultOptions.headers = {
      ...defaultOptions.headers,
      ...options.headers,
    };
  }
  
  return fetch(url, defaultOptions);
}

// Date formatting
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// String utilities
export const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Progress calculation
export const calculateProgress = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export const getProgressColor = (progress: number): string => {
  if (progress < 30) return 'text-red-500';
  if (progress < 70) return 'text-yellow-500';
  return 'text-green-500';
};

// Color utilities for status
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    // Project status
    planning: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    testing: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    on_hold: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    
    // Task status
    todo: 'bg-gray-100 text-gray-800',
    review: 'bg-orange-100 text-orange-800',
    done: 'bg-green-100 text-green-800',
    
    // Priority
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
}

export const getPriorityColor = (priority: string): string => {
  const priorityColors: Record<string, string> = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    urgent: 'text-red-600',
  };
  
  return priorityColors[priority] || 'text-gray-600';
}

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

// File utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
