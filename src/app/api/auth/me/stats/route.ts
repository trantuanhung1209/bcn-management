import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/models/User';
import { TaskModel } from '@/models/Task';
import { ProjectModel } from '@/models/Project';

// GET /api/auth/me/stats - Get current user statistics
export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    // Get userId from header
    let userId: string;
    
    try {
      const userIdHeader = request.headers.get('X-User-ID');
      
      if (userIdHeader) {
        userId = userIdHeader;
        console.log('Using userId from header:', userId);
      } else {
        console.log('No userId in header, using fallback');
        userId = '68c31118f49db92cbacf1857'; // Fallback userId
      }
      
    } catch (error) {
      console.error('Error getting userId:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid user identification' },
        { status: 401 }
      );
    }

    // Verify user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user statistics
    const stats = await getUserStats(userId);

    return NextResponse.json({
      success: true,
      data: stats,
      message: 'User statistics retrieved successfully'
    });

  } catch (error) {
    console.error('GET /api/auth/me/stats error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate user statistics
async function getUserStats(userId: string) {
  try {
    // Get all tasks for this user using TaskModel
    const userTasks = await TaskModel.findByUser(userId);
    
    // Calculate tasks completed
    const completedTasks = userTasks.filter((task: any) => task.status === 'completed');
    const tasksCompleted = completedTasks.length;

    // Calculate average rating from completed tasks
    const tasksWithRating = completedTasks.filter((task: any) => task.rating && task.rating > 0);
    const averageRating = tasksWithRating.length > 0 
      ? tasksWithRating.reduce((sum: number, task: any) => sum + (task.rating || 0), 0) / tasksWithRating.length
      : 0;

    // Get projects user is participating in using ProjectModel
    const userProjects = await ProjectModel.findByUser(userId);
    const projectsParticipated = userProjects.length;

    // Calculate total working days (from join date to now or from tasks)
    const user = await UserModel.findById(userId);
    const joinDate = user?.createdAt || new Date();
    const today = new Date();
    const timeDiff = today.getTime() - new Date(joinDate).getTime();
    const totalWorkingDays = Math.floor(timeDiff / (1000 * 3600 * 24));

    // Calculate additional metrics
    const inProgressTasks = userTasks.filter((task: any) => task.status === 'in_progress').length;
    const pendingTasks = userTasks.filter((task: any) => task.status === 'todo').length;
    const overdueTasks = userTasks.filter((task: any) => {
      if (task.status === 'completed') return false;
      return task.dueDate && new Date(task.dueDate) < new Date();
    }).length;

    // Calculate completion rate
    const totalTasks = userTasks.length;
    const completionRate = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0;

    // Get recent activity (tasks completed in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCompletedTasks = completedTasks.filter((task: any) => 
      task.updatedAt && new Date(task.updatedAt) >= thirtyDaysAgo
    ).length;

    return {
      basic: {
        tasksCompleted,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        projectsParticipated,
        totalWorkingDays
      },
      detailed: {
        totalTasks,
        inProgressTasks,
        pendingTasks,
        overdueTasks,
        completionRate: Math.round(completionRate * 10) / 10,
        recentCompletedTasks,
        tasksWithRating: tasksWithRating.length
      },
      achievements: calculateAchievements(tasksCompleted, averageRating, projectsParticipated, totalWorkingDays)
    };

  } catch (error) {
    console.error('Error calculating user stats:', error);
    throw error;
  }
}

// Helper function to calculate user achievements
function calculateAchievements(tasksCompleted: number, averageRating: number, projectsParticipated: number, totalWorkingDays: number) {
  const achievements = [];

  // Top Performer badge
  if (tasksCompleted >= 40) {
    achievements.push({
      id: 'top_performer',
      title: 'Top Performer',
      description: 'Hoàn thành 40+ tasks',
      icon: '🏆',
      earned: true,
      earnedDate: new Date()
    });
  }

  // Quality Master badge
  if (averageRating >= 4.5) {
    achievements.push({
      id: 'quality_master',
      title: 'Quality Master',
      description: 'Rating 4.5+ stars',
      icon: '🎯',
      earned: true,
      earnedDate: new Date()
    });
  }

  // Team Player badge
  if (projectsParticipated >= 5) {
    achievements.push({
      id: 'team_player',
      title: 'Team Player',
      description: 'Tham gia 5+ projects',
      icon: '🚀',
      earned: true,
      earnedDate: new Date()
    });
  }

  // Veteran badge
  if (totalWorkingDays >= 100) {
    achievements.push({
      id: 'veteran',
      title: 'Veteran',
      description: '100+ ngày làm việc',
      icon: '💎',
      earned: true,
      earnedDate: new Date()
    });
  }

  // Early Bird badge
  if (tasksCompleted >= 10) {
    achievements.push({
      id: 'early_bird',
      title: 'Early Bird',
      description: 'Hoàn thành 10+ tasks',
      icon: '🌅',
      earned: true,
      earnedDate: new Date()
    });
  }

  // Consistent Worker badge
  if (totalWorkingDays >= 50 && averageRating >= 4.0) {
    achievements.push({
      id: 'consistent_worker',
      title: 'Consistent Worker',
      description: 'Làm việc ổn định với chất lượng cao',
      icon: '⚡',
      earned: true,
      earnedDate: new Date()
    });
  }

  return achievements;
}

// OPTIONS - Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-ID',
    },
  });
}