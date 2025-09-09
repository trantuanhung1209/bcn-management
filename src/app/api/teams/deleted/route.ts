import { NextRequest, NextResponse } from 'next/server';
import { TeamModel } from '@/models/Team';

// GET - Lấy danh sách teams đã bị xóa (soft delete)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamLeader = searchParams.get('teamLeader');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const filters: any = {};
    
    if (teamLeader) filters.teamLeader = teamLeader;
    if (search) filters.search = search;
    
    filters.page = page;
    filters.limit = limit;

    const { teams, total } = await TeamModel.findDeleted(filters);

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
    console.error('Error fetching deleted teams:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deleted teams' },
      { status: 500 }
    );
  }
}
