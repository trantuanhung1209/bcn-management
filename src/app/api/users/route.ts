import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/models/User';
import { ObjectId } from 'mongodb';
import { filterUsersForManager } from '@/lib/server-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const isActive = searchParams.get('deleted') !== 'true';
    
    // Lấy thông tin user để xác định quyền truy cập
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');

    // Build filters
    const filters: any = { 
      page, 
      limit,
      isActive
    };

    if (search) {
      filters.search = search;
    }

    if (role && role !== 'all') {
      filters.role = role;
    }

    // Get users with pagination
    let { users, total } = await UserModel.findAll(filters);

    // Áp dụng phân quyền theo team cho manager
    if (userId && userRole && userRole === 'manager') {
      users = await filterUsersForManager(userId, userRole, users);
      total = users.length; // Cập nhật lại total sau khi filter
    }

    // Remove passwords from response
    const safeUsers = users.map(user => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return NextResponse.json({
      users: safeUsers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, role, department, teams } = body;

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Convert teams string array to ObjectId array
    const teamObjectIds = teams ? teams.map((teamId: string) => new ObjectId(teamId)) : [];

    // Create new user
    const userData = {
      firstName,
      lastName,
      email,
      role,
      department,
      password: 'defaultPassword123', // Should be changed on first login
      teams: teamObjectIds,
      projects: [],
      isActive: true
    };

    const user = await UserModel.create(userData);

    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
