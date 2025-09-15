import { NextRequest, NextResponse } from 'next/server';
import { getUsersCollection, getTeamsCollection, getProjectsCollection, getActivityLogsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    // Get user info from cookie or header (assuming you have auth middleware)
    // For now, we'll get from localStorage equivalent or request
    const searchParams = request.nextUrl.searchParams;
    const userIdParam = searchParams.get('userId');
    
    if (!userIdParam) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy thông tin user' },
        { status: 401 }
      );
    }

    const managerId = new ObjectId(userIdParam);
    
    // Get collections
    const usersCollection = await getUsersCollection();
    const teamsCollection = await getTeamsCollection();
    const projectsCollection = await getProjectsCollection();
    const activityLogsCollection = await getActivityLogsCollection();

    // Get manager's teams (teams where manager is team leader)
    const managerTeams = await teamsCollection.find({
      teamLeader: managerId,
      $or: [
        { isActive: true },
        { isActive: { $exists: false } }
      ]
    }).toArray();

    const teamIds = managerTeams.map(team => team._id);

    // Calculate statistics for manager's teams
    const [
      totalMembers,
      totalProjects,
      completedProjects,
      activeProjects,
      recentActivities
    ] = await Promise.all([
      // Count total members across all manager's teams
      usersCollection.countDocuments({
        teams: { $in: teamIds },
        isActive: true
      }),
      
      // Count total projects across all manager's teams
      projectsCollection.countDocuments({
        team: { $in: teamIds }
      }),
      
      // Count completed projects
      projectsCollection.countDocuments({
        team: { $in: teamIds },
        status: 'completed' as any
      }),
      
      // Count active projects  
      projectsCollection.countDocuments({
        team: { $in: teamIds },
        status: { $in: ['planning', 'in_progress', 'testing'] as any }
      }),
      
      // Get recent activities for manager's teams
      activityLogsCollection.find({
        $or: [
          { user: managerId },
          { target: 'team', targetId: { $in: teamIds } },
          { target: 'project', targetId: { $in: (await projectsCollection.find({ team: { $in: teamIds } }).toArray()).map(p => p._id) } }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()
    ]);

    // Get team type breakdown
    const webTeams = managerTeams.filter(team => 
      team.name.toLowerCase().includes('web')
    ).length;
    
    const appTeams = managerTeams.filter(team => 
      team.name.toLowerCase().includes('app')
    ).length;

    // Format recent activities for display
    const formattedActivities = recentActivities.map(activity => {
      let actionText = '';
      let icon = '📝';
      
      switch (activity.action) {
        case 'create':
          actionText = `Tạo ${activity.target === 'team' ? 'team' : activity.target === 'project' ? 'project' : activity.target} mới`;
          icon = activity.target === 'team' ? '🏢' : activity.target === 'project' ? '📊' : '✨';
          break;
        case 'update':
          actionText = `Cập nhật ${activity.target === 'team' ? 'team' : activity.target === 'project' ? 'project' : activity.target}`;
          icon = '🔧';
          break;
        case 'delete':
          actionText = `Xóa ${activity.target === 'team' ? 'team' : activity.target === 'project' ? 'project' : activity.target}`;
          icon = '🗑️';
          break;
        case 'add_member':
          actionText = 'Thêm thành viên vào team';
          icon = '👥';
          break;
        case 'remove_member':
          actionText = 'Loại bỏ thành viên khỏi team';
          icon = '👤';
          break;
        default:
          actionText = activity.action;
          icon = '📝';
      }

      const timeDiff = Date.now() - new Date(activity.createdAt).getTime();
      let timeText = '';
      
      if (timeDiff < 60000) {
        timeText = 'Vài giây trước';
      } else if (timeDiff < 3600000) {
        const minutes = Math.floor(timeDiff / 60000);
        timeText = `${minutes} phút trước`;
      } else if (timeDiff < 86400000) {
        const hours = Math.floor(timeDiff / 3600000);
        timeText = `${hours} giờ trước`;
      } else {
        const days = Math.floor(timeDiff / 86400000);
        timeText = `${days} ngày trước`;
      }

      return {
        action: actionText,
        details: activity.details?.name || activity.details?.memberCount ? 
          `${activity.details.name || 'Không rõ'}${activity.details.memberCount ? ` (${activity.details.memberCount} thành viên)` : ''}` :
          'Chi tiết hoạt động',
        time: timeText,
        icon: icon,
        type: activity.target
      };
    });

    // Prepare detailed team information
    const teamDetails = await Promise.all(managerTeams.map(async (team) => {
      const teamProjects = await projectsCollection.find({ team: team._id }).toArray();
      const activeProjects = teamProjects.filter(p => ['planning', 'in_progress', 'testing'].includes(p.status as any)).length;
      const completedProjects = teamProjects.filter(p => p.status === 'completed').length;
      
      // Calculate average progress
      const totalProgress = teamProjects.reduce((sum, project) => sum + (project.progress || 0), 0);
      const avgProgress = teamProjects.length > 0 ? Math.round(totalProgress / teamProjects.length) : 0;
      
      return {
        _id: team._id.toString(),
        name: team.name,
        memberCount: team.members.length + 1, // +1 for team leader
        projectCount: teamProjects.length,
        activeProjects,
        completedProjects,
        progress: avgProgress
      };
    }));

    // Prepare response data
    const stats = {
      totalTeams: managerTeams.length,
      totalMembers,
      totalProjects,
      activeProjects,
      completedProjects,
      webTeams,
      appTeams,
      teams: teamDetails,
      recentActivities: formattedActivities
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching manager dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi server khi lấy thống kê' },
      { status: 500 }
    );
  }
}
