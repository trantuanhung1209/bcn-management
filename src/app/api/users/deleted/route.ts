import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    // Build filters for deleted users
    const filters: any = { 
      page, 
      limit,
      isActive: false // Only deleted users
    };

    if (search) {
      filters.search = search;
    }

    if (role && role !== 'all') {
      filters.role = role;
    }

    // Get deleted users with pagination
    const { users, total } = await UserModel.findAll(filters);

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
    console.error('Error fetching deleted users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deleted users' },
      { status: 500 }
    );
  }
}
