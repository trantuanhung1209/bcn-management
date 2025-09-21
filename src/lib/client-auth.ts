// Client-side authentication utilities

interface AuthHeaders {
  'Content-Type': string;
  'Authorization'?: string;
}

export const getAuthHeaders = (): AuthHeaders => {
  const headers: AuthHeaders = {
    'Content-Type': 'application/json',
  };
  
  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const handleAuthError = (status: number) => {
  if (status === 401) {
    // Clear auth data and redirect to login
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = '/auth/login';
    return true; // Indicates this was an auth error
  }
  return false;
};

export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const headers = getAuthHeaders();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
    credentials: 'include',
  });
  
  // Handle auth errors
  if (!response.ok && handleAuthError(response.status)) {
    return null; // Auth error handled
  }
  
  return response;
};