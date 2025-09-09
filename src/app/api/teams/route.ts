import { NextRequest, NextResponse } from 'next/server';
import { TeamModel } from '@/models/Team';
import { ObjectId } from 'mongodb';

// GET - Lấy danh sách teams
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamLeader = searchParams.get('teamLeader');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const filters: any = {};
    
    if (teamLeader) filters.teamLeader = teamLeader;
    // Mặc định chỉ hiển thị teams active, trừ khi explicitly set isActive=false
    filters.isActive = isActive !== null ? isActive === 'true' : true;
    if (search) filters.search = search;
    
    filters.page = page;
    filters.limit = limit;

    const { teams, total } = await TeamModel.findAll(filters);

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
