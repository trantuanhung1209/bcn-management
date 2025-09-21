import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth-utils';
import { TaskModel } from '@/models/Task';
import { ProjectModel } from '@/models/Project';
import { UserModel } from '@/models/User';
import { TeamModel } from '@/models/Team';
import { UserRole, TaskStatus } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only allow members to access this endpoint
    if (user.role !== UserRole.MEMBER) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only members can access this endpoint' },
        { status: 403 }
      );
    }

    // Get user details with team information
    const userDetails = await UserModel.findById(user.id);
    if (!userDetails) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get member's team information
    let teamInfo = null;
    if (userDetails.teams && userDetails.teams.length > 0) {
      teamInfo = await TeamModel.findById(userDetails.teams[0]);
    }

    // Get tasks assigned to this member
    const memberTasks = await TaskModel.findByUser(user.id);
    console.log('📋 Member tasks found:', {
      userId: user.id,
      totalTasks: memberTasks.length,
      taskTitles: memberTasks.map(t => t.title),
      taskStatuses: memberTasks.map(t => t.status)
    });
    
    // Get task statistics
    const taskStats = await TaskModel.getTaskStats({ assignedTo: user.id });
    console.log('📊 Task stats:', taskStats);
    
    // Get projects that the member is involved in
    // Instead of finding projects where user is assigned, 
    // find projects from tasks that are assigned to the user
    const projectIds = [...new Set(memberTasks.map(task => task.project).filter(Boolean))];
    
    let memberProjects: { projects: any[]; total: number } = { projects: [], total: 0 };
    if (projectIds.length > 0) {
      const projectsCollection = await ProjectModel.findAll({
        isActive: true,
        limit: 50  // Increased limit to get all relevant projects
      });
      
      // Filter projects that have tasks assigned to this member
      const relevantProjects = projectsCollection.projects.filter(project => 
        projectIds.some(taskProjectId => 
          project._id?.toString() === taskProjectId?.toString()
        )
      );
      
      memberProjects = {
        projects: relevantProjects,
        total: relevantProjects.length
      };
    }
    
    console.log('📊 Member projects found:', {
      projectIds: projectIds.map(id => id?.toString()),
      totalProjects: memberProjects.total,
      projectNames: memberProjects.projects.map(p => p.name)
    });

    // Get recent activity - tasks updated in last 7 days
    const recentTasks = memberTasks
      .filter(task => {
        const daysSinceUpdate = (Date.now() - task.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate <= 7;
      })
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 5);

    // Get today's tasks (due today or overdue)
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    // Get all uncompleted tasks instead of just today's tasks
    const uncompletedTasks = memberTasks
      .filter(task => {
        // Get all tasks that are not done
        return task.status !== TaskStatus.COMPLETED;
      })
      .sort((a, b) => {
        // Sort by priority (urgent > high > medium > low) then by due date
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority] || 0;
        const bPriority = priorityOrder[b.priority] || 0;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        // If no due date, put at end
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        
        return a.dueDate.getTime() - b.dueDate.getTime();
      });
    
    console.log('📝 Uncompleted tasks:', {
      total: uncompletedTasks.length,
      tasks: uncompletedTasks.map(t => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        progress: t.progress,
        dueDate: t.dueDate
      }))
    });

    // Calculate performance metrics
    const completedThisMonth = memberTasks.filter(task => {
      if (!task.completedAt) return false;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return task.completedAt >= startOfMonth && task.completedAt <= now;
    }).length;

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const completedLastMonth = memberTasks.filter(task => {
      if (!task.completedAt) return false;
      const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      const endOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
      return task.completedAt >= startOfLastMonth && task.completedAt <= endOfLastMonth;
    }).length;

    const monthlyGrowth = completedLastMonth > 0 
      ? Math.round(((completedThisMonth - completedLastMonth) / completedLastMonth) * 100)
      : completedThisMonth > 0 ? 100 : 0;

    // Calculate average completion time
    const completedTasksWithTime = memberTasks.filter(task => 
      task.completedAt && task.createdAt
    );
    
    const avgCompletionTime = completedTasksWithTime.length > 0
      ? completedTasksWithTime.reduce((sum, task) => {
          const days = (task.completedAt!.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / completedTasksWithTime.length
      : 0;

    // Prepare dashboard data
    const dashboardData = {
      user: {
        name: `${userDetails.firstName} ${userDetails.lastName}`,
        email: userDetails.email,
        role: userDetails.role,
        avatar: userDetails.avatar
      },
      team: teamInfo ? {
        name: teamInfo.name,
        description: teamInfo.description,
        memberCount: teamInfo.members.length,
        projectCount: teamInfo.projects.length
      } : null,
      stats: {
        assignedTasks: taskStats.total,
        completedTasks: taskStats.done,
        inProgressTasks: taskStats.inProgress,
        pendingTasks: taskStats.todo,
        overdueTasks: taskStats.overdue
      },
      performance: {
        completedThisMonth,
        monthlyGrowthPercentage: monthlyGrowth,
        averageCompletionDays: Math.round(avgCompletionTime * 10) / 10,
        averageRating: 4.8 // This could be calculated from actual ratings if implemented
      },
      todayTasks: uncompletedTasks.map(task => ({
        _id: task._id?.toString(),
        title: task.title,
        priority: task.priority,
        status: task.status,
        progress: task.progress,
        dueDate: task.dueDate,
        project: task.project?.toString()
      })),
      recentActivity: recentTasks.map(task => ({
        _id: task._id?.toString(),
        title: task.title,
        action: task.status === TaskStatus.COMPLETED ? 'completed' : 'updated',
        project: task.project?.toString(),
        updatedAt: task.updatedAt,
        progress: task.progress
      })),
      projects: memberProjects.projects.map(project => ({
        _id: project._id?.toString(),
        name: project.name,
        status: project.status,
        progress: project.progress,
        deadline: project.deadline,
        priority: project.priority
      }))
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Member dashboard error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}