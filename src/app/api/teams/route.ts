import { NextRequest, NextResponse } from 'next/server';
import { TeamModel } from '@/models/Team';
import { UserModel } from '@/models/User';
import { ObjectId } from 'mongodb';
import { filterTeamsForManager } from '@/lib/server-utils';

// GET - Lấy danh sách teams với phân quyền theo manager
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamLeader = searchParams.get('teamLeader');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const withMembers = searchParams.get('withMembers') === 'true';
    
    // Lấy thông tin user từ query params hoặc headers để xác định quyền
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');

    const filters: any = {};
    
    if (teamLeader) filters.teamLeader = teamLeader;
    // Mặc định chỉ hiển thị teams active, trừ khi explicitly set isActive=false
    filters.isActive = isActive !== null ? isActive === 'true' : true;
    if (search) filters.search = search;
    
    filters.page = page;
    filters.limit = limit;

    let { teams, total } = await TeamModel.findAll(filters);

    // Áp dụng phân quyền theo team cho manager
    if (userId && userRole && userRole === 'manager') {
      teams = await filterTeamsForManager(userId, userRole, teams);
      total = teams.length; // Cập nhật lại total sau khi filter
    }

    // Nếu cần thông tin members chi tiết
    if (withMembers) {
      const teamsWithMembers = await Promise.all(
        teams.map(async (team) => {
          try {
            // Lấy thông tin team leader
            const teamLeaderInfo = await UserModel.findById(team.teamLeader);
            
            // Lấy thông tin members
            const memberInfos = await Promise.all(
              team.members.map(async (memberId) => {
                try {
                  return await UserModel.findById(memberId);
                } catch (error) {
                  console.error(`Error fetching member ${memberId}:`, error);
                  return null;
                }
              })
            );
            
            // Filter out null members và transform data
            const validMembers = memberInfos
              .filter(Boolean)
              .map(member => ({
                id: member!._id!.toString(),
                name: `${member!.firstName} ${member!.lastName}`,
                email: member!.email,
                role: member!.role === 'team_leader' ? 'manager' : 
                      member!.role === 'admin' ? 'admin' : 'member',
                avatar: member!.avatar,
                status: member!.isActive ? 'active' : 'inactive',
                joinedDate: member!.createdAt.toISOString(),
                gender: member!.gender || 'Nam',
                birthday: member!.birthday || '2000-01-01',
                studentId: member!.studentId || `SV${member!._id!.toString().slice(-3)}`,
                academicYear: member!.academicYear || 'K21',
                field: member!.field || (team.name.includes('Web') ? 'Web' : 'App'),
                isUP: member!.role === 'team_leader'
              }));

            return {
              ...team,
              teamLeaderName: teamLeaderInfo ? `${teamLeaderInfo.firstName} ${teamLeaderInfo.lastName}` : 'Unknown',
              membersInfo: validMembers
            };
          } catch (error) {
            console.error(`Error fetching team ${team._id} members:`, error);
            return team;
          }
        })
      );
      
      return NextResponse.json({
        success: true,
        data: {
          teams: teamsWithMembers,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        teams,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

// POST - Tạo team mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, teamLeader, members = [], projects = [] } = body;

    // Validate required fields
    if (!name || !description || !teamLeader) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if team name already exists
    const existingTeam = await TeamModel.findByName(name);
    if (existingTeam) {
      return NextResponse.json(
        { success: false, error: 'Team name already exists' },
        { status: 400 }
      );
    }

    const teamData = {
      name,
      description,
      teamLeader: new ObjectId(teamLeader),
      members: members.map((id: string) => new ObjectId(id)),
      projects: projects.map((id: string) => new ObjectId(id)),
      isActive: true
    };

    const newTeam = await TeamModel.create(teamData);

    return NextResponse.json({
      success: true,
      data: newTeam,
      message: 'Team created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create team' },
      { status: 500 }
    );
  }
}
