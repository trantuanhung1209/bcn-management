import { NextResponse } from 'next/server';
import { UserModel } from '@/models/User';
import { TeamModel } from '@/models/Team';
import { ProjectModel } from '@/models/Project';
import { UserRole } from '@/types';
import { getActivityLogsCollection, getUsersCollection } from '@/lib/mongodb';

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  } else if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  } else {
    return `${diffInDays} ngày trước`;
  }
}

export async function GET() {
  try {
    // Get counts for all entities
    const [
      usersData,
      teamsData,
      projectsData
    ] = await Promise.all([
      UserModel.findAll({ isActive: true }),
      TeamModel.findAll({ isActive: true }),
      ProjectModel.findAll({ isActive: true })
    ]);

    // Calculate basic stats - exclude admin users from totalUsers count
    const totalUsers = usersData.users.filter(user => user.role !== UserRole.ADMIN).length;
    const totalTeams = teamsData.total;
    const totalProjects = projectsData.total;

    // Get team leaders count
    const teamLeaders = await UserModel.findByRole(UserRole.TEAM_LEADER);
    const totalLeaders = teamLeaders.length;

    // Get active users (users who have logged in recently or are part of active teams/projects) - exclude admin
    const activeUsers = usersData.users.filter(user => 
      user.role !== UserRole.ADMIN && (
        user.teams && user.teams.length > 0 || 
        user.projects && user.projects.length > 0
      )
    ).length;

    // Count teams by department/type
    const webTeams = teamsData.teams.filter(team => 
      team.name.toLowerCase().includes('web') || 
      team.description?.toLowerCase().includes('web')
    ).length;

    const appTeams = teamsData.teams.filter(team => 
      team.name.toLowerCase().includes('app') || 
      team.name.toLowerCase().includes('mobile') ||
      team.description?.toLowerCase().includes('app') ||
      team.description?.toLowerCase().includes('mobile')
    ).length;

    // Count completed projects
    const completedProjects = projectsData.projects.filter(project => 
      project.status === 'completed'
    ).length;

    // Get recent activities from activity_logs collection
    const activityLogsCollection = await getActivityLogsCollection();
    const usersCollection = await getUsersCollection();
    
    // Get latest 5 activities for dashboard
    const recentActivityLogs = await activityLogsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    // Map activities to display format with user names
    const recentActivities = await Promise.all(
      recentActivityLogs.map(async (log) => {
        const user = await usersCollection.findOne({ _id: log.user });
        const userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
        
        // Format activity based on action type
        let actionText = '';
        let icon = '📝';
        let details = '';
        
        switch (log.action) {
          case 'create':
            if (log.target === 'user') {
              actionText = 'Tạo user mới';
              icon = '👤';
              details = `Thêm ${log.details?.email || 'user'} vào hệ thống`;
            } else if (log.target === 'team') {
              actionText = 'Tạo team mới';
              icon = '🏢';
              details = `Tạo team ${log.details?.name || 'mới'}`;
            } else if (log.target === 'project') {
              actionText = 'Tạo project mới';
              icon = '📊';
              details = `Dự án ${log.details?.name || 'mới'} được tạo`;
            }
            break;
          case 'update':
            if (log.target === 'user') {
              actionText = 'Cập nhật thông tin user';
              icon = '👤';
              details = `Cập nhật thông tin của ${userName}`;
            } else if (log.target === 'team') {
              actionText = 'Cập nhật team';
              icon = '🔧';
              details = `Thay đổi cấu trúc team`;
            } else if (log.target === 'project') {
              actionText = 'Cập nhật project';
              icon = '📝';
              details = `Cập nhật thông tin project`;
            }
            break;
          case 'delete':
            actionText = 'Xóa ' + log.target;
            icon = '🗑️';
            details = `Đã xóa ${log.target}`;
            break;
          case 'add_member':
            actionText = 'Thêm thành viên vào team';
            icon = '👥';
            details = `${userName} thêm thành viên mới`;
            break;
          case 'remove_member':
            actionText = 'Xóa thành viên khỏi team';
            icon = '👥';
            details = `${userName} xóa thành viên`;
            break;
          default:
            actionText = log.action;
            icon = '📝';
            details = `Hoạt động ${log.action} bởi ${userName}`;
        }
        
        // Calculate time ago
        const timeAgo = getTimeAgo(log.createdAt);
        
        return {
          action: actionText,
          details: details,
          time: timeAgo,
          icon: icon,
          type: log.target
        };
      })
    );

    const stats = {
      totalUsers,
      totalTeams,
      totalProjects,
      totalLeaders,
      activeUsers,
      webTeams,
      appTeams,
      completedProjects,
      recentActivities
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Không thể lấy dữ liệu thống kê' 
      },
      { status: 500 }
    );
  }
}