import { NextRequest, NextResponse } from 'next/server';
import { ProjectModel } from '@/models/Project';
import { TeamModel } from '@/models/Team';
import { TaskModel } from '@/models/Task';
import { getAuthenticatedUserId } from '@/lib/auth-middleware';
import { TaskStatus } from '@/types';

// GET: Get projects assigned to team leader's team
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user ID from token/session
    const teamLeaderId = await getAuthenticatedUserId(request);
    
    if (!teamLeaderId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // pending, accepted, rejected, all
    const search = searchParams.get('search') || '';

    // Find team leader's team
    console.log('Looking for team with leader ID:', teamLeaderId);
    const team = await TeamModel.findByLeader(teamLeaderId);
    console.log('Found team:', team);
    
    if (!team) {
      console.log('No team found for team leader:', teamLeaderId);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Bạn chưa được gán làm team leader của team nào. Vui lòng liên hệ admin để được phân công.',
          code: 'NO_TEAM_ASSIGNED'
        },
        { status: 404 }
      );
    }

    // Get projects assigned to this team
    const filters: any = {
      team: team._id,
      isActive: true
    };

    // Filter by assignment status if specified
    if (status && status !== 'all') {
      if (status === 'pending') {
        filters.isAssigned = false;
        filters.assignedAt = { $exists: false };
      } else if (status === 'accepted') {
        filters.isAssigned = true;
        filters.acceptedAt = { $exists: true };
      } else if (status === 'rejected') {
        filters.isAssigned = false;
        filters.rejectedAt = { $exists: true };
      }
    }

    const projects = await ProjectModel.findAll({
      ...filters,
      search,
      page: 1,
      limit: 100 // Get all for team leader
    });

    console.log('Found projects:', projects);

    // Get task statistics for each project
    const projectsWithStats = await Promise.all(
      projects.projects.map(async (project) => {
        try {
          // Get all tasks for this project
          const allTasks = await TaskModel.findByProject(project._id!.toString());
          const totalTasks = allTasks.length;
          
          // Count completed tasks (status === 'done')
          const completedTasks = allTasks.filter(task => 
            task.status === TaskStatus.DONE
          ).length;

          console.log(`Project ${project.name}: ${completedTasks}/${totalTasks} tasks completed`);

          return {
            ...project,
            totalTasks,
            completedTasks
          };
        } catch (error) {
          console.error(`Error getting tasks for project ${project._id}:`, error);
          return {
            ...project,
            totalTasks: 0,
            completedTasks: 0
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        projects: projectsWithStats,
        total: projects.total,
        team: {
          id: team._id,
          name: team.name,
          leader: team.teamLeader
        }
      }
    });
  } catch (error) {
    console.error('Error fetching team leader projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}