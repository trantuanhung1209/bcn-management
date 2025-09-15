import { NextRequest, NextResponse } from 'next/server';
import { ProjectModel } from '@/models/Project';
import { TeamModel } from '@/models/Team';
import { UserModel } from '@/models/User';
import { getAuthenticatedUserId } from '@/lib/auth-middleware';

// POST /api/projects/assign - Admin assigns project to team
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserModel.findById(userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Forbidden: Only admins can assign projects' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { projectId, teamId } = body;

    if (!projectId || !teamId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: projectId, teamId'
      }, { status: 400 });
    }

    // Get team info to find manager
    const team = await TeamModel.findById(teamId);
    if (!team) {
      return NextResponse.json({
        success: false,
        error: 'Team not found'
      }, { status: 404 });
    }

    // Get team leader as manager
    const manager = await UserModel.findById(team.teamLeader);
    if (!manager || manager.role !== 'manager') {
      return NextResponse.json({
        success: false,
        error: 'Team leader is not a manager'
      }, { status: 400 });
    }

    const success = await ProjectModel.assignToTeam(projectId, teamId, team.teamLeader);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Project assigned to team successfully. Manager needs to accept it.'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to assign project'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error assigning project:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to assign project'
    }, { status: 500 });
  }
}