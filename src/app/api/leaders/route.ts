import { NextResponse } from 'next/server';
import { UserModel } from '@/models/User';
import { UserRole } from '@/types';

// GET - Lấy danh sách leaders
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const department = searchParams.get('department');

    const filters: any = {
      role: UserRole.TEAM_LEADER,
      page,
      limit
    };

    if (search) {
      filters.search = search;
    }

    if (isActive !== null) {
      filters.isActive = isActive === 'true';
    }

    if (department) {
      filters.department = department;
    }

    const result = await UserModel.findAll(filters);
    
    return NextResponse.json({
      success: true,
      data: {
        leaders: result.users,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      }
    });

  } catch (error: any) {
    console.error('Error fetching leaders:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Lỗi khi lấy danh sách leaders' 
      },
      { status: 500 }
    );
  }
}

// POST - Tạo leader mới
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone, department } = body;

    // Kiểm tra dữ liệu đầu vào
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email, mật khẩu, tên và họ là bắt buộc' 
        },
        { status: 400 }
      );
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email đã được sử dụng' 
        },
        { status: 400 }
      );
    }

    // Tạo leader mới
    const newLeader = await UserModel.create({
      email,
      password,
      firstName,
      lastName,
      role: UserRole.TEAM_LEADER,
      phone: phone || '',
      department: department || '',
      teams: [],
      projects: [],
      isActive: true
    });

    // Loại bỏ password khỏi response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...leaderResponse } = newLeader;

    return NextResponse.json({
      success: true,
      data: leaderResponse,
      message: 'Tạo leader thành công'
    });

  } catch (error: any) {
    console.error('Error creating leader:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Lỗi khi tạo leader' 
      },
      { status: 500 }
    );
  }
}
