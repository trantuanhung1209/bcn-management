import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/models/User';
import { TeamModel } from '@/models/Team';

// GET - Lấy thông tin team leader hiện tại và teams được quản lý
export async function GET(request: NextRequest) {
  try {
    // Tạm thời get từ query param hoặc localStorage
    // Trong thực tế sẽ lấy từ session/JWT token
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Lấy thông tin user
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Kiểm tra role team_leader
    if (user.role !== 'team_leader') {
      return NextResponse.json(
        { success: false, error: 'User is not a team leader' },
        { status: 403 }
      );
    }

    // Lấy teams được quản lý bởi team leader này
    const teams = await TeamModel.findAll({
      teamLeader: userId,
      isActive: true
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        },
        teams: teams.teams,
        totalTeams: teams.total
      }
    });

  } catch (error) {
    console.error('Error fetching team leader info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team leader info' },
      { status: 500 }
    );
  }
}