import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  try {
    // Try to get token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      return decoded.userId;
    }

    // Try to get token from cookies
    const token = request.cookies.get('auth-token')?.value;
    if (token) {
      const decoded = verifyToken(token);
      return decoded.userId;
    }

    return null;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  const userId = await getAuthenticatedUserId(request);
  
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  return null; // No error, user is authenticated
}

export async function requireManagerRole(request: NextRequest): Promise<NextResponse | null> {
  const userId = await getAuthenticatedUserId(request);
  
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  // In a real app, you would check the user's role from the database
  // For now, we'll assume the user is a manager
  // TODO: Add actual role checking from database
  
  return null; // No error, user is authenticated and has manager role
}