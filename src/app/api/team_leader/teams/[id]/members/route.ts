import { NextRequest, NextResponse } from 'next/server';
import { TeamModel } from '@/models/Team';
import { UserModel } from '@/models/User';
import { ObjectId } from 'mongodb';

interface Params {
  id: string;
}

// GET - Lấy danh sách thành viên team với đầy đủ thông tin
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid team ID' },
        { status: 400 }
      );
    }

    // Kiểm tra team có tồn tại không
    const team = await TeamModel.findById(id);
    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    // Lấy thông tin team leader
    const teamLeader = await UserModel.findById(team.teamLeader);
    if (!teamLeader) {
      return NextResponse.json(
        { success: false, error: 'Team leader not found' },
        { status: 404 }
      );
    }

    // Lấy thông tin tất cả members
    const members = await Promise.all(
      team.members.map(async (memberId) => {
        const member = await UserModel.findById(memberId);
        return member;
      })
    );

    // Filter out null members
    const validMembers = members.filter(member => member !== null);

    // Chuẩn bị dữ liệu trả về
    const teamMembersData = [
      {
        id: teamLeader._id?.toString(),
        name: `${teamLeader.firstName} ${teamLeader.lastName}`,
        email: teamLeader.email,
        role: 'manager', // Team leader có role manager trong context team
        avatar: teamLeader.avatar,
        status: teamLeader.isActive ? 'active' : 'inactive',
        joinedDate: team.createdAt.toISOString().split('T')[0], // Team leader joined when team was created
        gender: teamLeader.gender || 'Khác',
        birthday: teamLeader.birthday || '',
        studentId: teamLeader.studentId || '',
        academicYear: teamLeader.academicYear || '',
        field: teamLeader.field || 'Web',
        isUP: false // Team leader không phải UP member
      },
      ...validMembers.map(member => ({
        id: member._id?.toString(),
        name: `${member.firstName} ${member.lastName}`,
        email: member.email,
        role: 'member',
        avatar: member.avatar,
        status: member.isActive ? 'active' : 'inactive',
        joinedDate: member.createdAt.toISOString().split('T')[0],
        gender: member.gender || 'Khác',
        birthday: member.birthday || '',
        studentId: member.studentId || '',
        academicYear: member.academicYear || '',
        field: member.field || 'Web',
        isUP: false // Tạm thời set false, có thể cập nhật logic sau
      }))
    ];

    return NextResponse.json({
      success: true,
      data: {
        team: {
          id: team._id?.toString(),
          name: team.name,
          description: team.description,
          createdDate: team.createdAt.toISOString().split('T')[0],
          status: team.isActive ? 'active' : 'inactive',
          color: team.name.toLowerCase().includes('web') ? 'from-blue-500 to-cyan-500' : 'from-green-500 to-emerald-500',
          teamType: team.name.toLowerCase().includes('web') ? 'web' : 'app'
        },
        members: teamMembersData,
        total: teamMembersData.length
      }
    });

  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

// POST - Thêm thành viên mới vào team
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid team ID' },
        { status: 400 }
      );
    }

    const { 
      name, 
      email, 
      gender = 'Nam', 
      birthday = '', 
      studentId = '', 
      academicYear = '', 
      field = 'Web',
      isUP = false 
    } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Tách firstName và lastName từ name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    // Tạo user mới
    const newUserData = {
      email,
      password: 'defaultpassword123', // Password mặc định, user sẽ cần đổi
      firstName,
      lastName,
      role: 'member' as any,
      gender,
      birthday,
      studentId,
      academicYear,
      field,
      teams: [new ObjectId(id)],
      projects: [],
      isActive: true
    };

    const newUser = await UserModel.create(newUserData);

    // Thêm user vào team
    await TeamModel.addMember(id, newUser._id!);

    // Chuẩn bị dữ liệu trả về
    const newMemberData = {
      id: newUser._id?.toString(),
      name: `${newUser.firstName} ${newUser.lastName}`,
      email: newUser.email,
      role: 'member',
      avatar: newUser.avatar,
      status: 'active',
      joinedDate: newUser.createdAt.toISOString().split('T')[0],
      gender: newUser.gender || 'Khác',
      birthday: newUser.birthday || '',
      studentId: newUser.studentId || '',
      academicYear: newUser.academicYear || '',
      field: newUser.field || 'Web',
      isUP: isUP
    };

    return NextResponse.json({
      success: true,
      data: newMemberData,
      message: 'Member added successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding team member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add team member' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa thành viên khỏi team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!ObjectId.isValid(id) || !memberId || !ObjectId.isValid(memberId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid team or member ID' },
        { status: 400 }
      );
    }

    // Kiểm tra member có tồn tại trong team không
    const team = await TeamModel.findById(id);
    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    // Không cho phép xóa team leader
    if (team.teamLeader.toString() === memberId) {
      return NextResponse.json(
        { success: false, error: 'Cannot remove team leader' },
        { status: 400 }
      );
    }

    const success = await TeamModel.removeMember(id, memberId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to remove member from team' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Member removed from team successfully'
    });

  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove team member' },
      { status: 500 }
    );
  }
}