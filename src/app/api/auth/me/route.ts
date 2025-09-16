import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/models/User';

// GET /api/auth/me - Get current user profile
export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    // Get userId dynamically from multiple sources
    let userId: string;
    
    try {
      // Method 1: Try to get userId from custom header (sent by client from localStorage)
      const userIdHeader = request.headers.get('X-User-ID');
      
      if (userIdHeader) {
        userId = userIdHeader;
        console.log('Using userId from header:', userId);
      } else {
        // Method 2: Try to decode JWT token to get userId
        // For JWT implementation, you would decode the token here
        // const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // userId = decoded.userId;
        
        // For now, fallback to default userId
        console.log('No userId in header, using fallback');
        userId = '68c31118f49db92cbacf1857';
      }
      
    } catch (error) {
      console.error('Error getting userId:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid user identification' },
        { status: 401 }
      );
    }

    // Get user from database using UserModel
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove password from response for security
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
      message: 'Profile retrieved successfully'
    });

  } catch (error) {
    console.error('GET /api/auth/me error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/auth/me - Update current user profile
export async function PUT(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Get userId dynamically (same as GET method)
    let userId: string;
    
    try {
      // Method 1: Try to get userId from custom header (sent by client from localStorage)
      const userIdHeader = request.headers.get('X-User-ID');
      
      if (userIdHeader) {
        userId = userIdHeader;
        console.log('Using userId from header for update:', userId);
      } else {
        // Method 2: Try to decode JWT token to get userId
        // For JWT implementation, you would decode the token here
        // const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // userId = decoded.userId;
        
        // For now, fallback to default userId
        console.log('No userId in header for update, using fallback');
        userId = '68c31118f49db92cbacf1857';
      }
      
    } catch (error) {
      console.error('Error getting userId for update:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid user identification' },
        { status: 401 }
      );
    }

    // Update user in database
    const updatedUser = await UserModel.update(userId, {
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      avatar: body.avatar,
      department: body.department,
      // Note: address, bio, skills, preferences would need to be added to User interface
      // For now, we'll handle them separately or extend the User model
    });
    
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to update user' },
        { status: 404 }
      );
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('PUT /api/auth/me error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// OPTIONS - Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}