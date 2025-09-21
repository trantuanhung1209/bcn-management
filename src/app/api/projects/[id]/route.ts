import { NextRequest, NextResponse } from 'next/server';
import { ProjectModel } from '@/models/Project';
import { TaskModel } from '@/models/Task';
import { ObjectId } from 'mongodb';
import { TaskStatus } from '@/types';
import { 
  createProjectUpdatedNotification, 
  createProjectDeletedNotification,
  getTeamLeaderIdFromTeam 
} from '@/lib/notification-utils';

// GET: Get project by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const project = await ProjectModel.findById(id);
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get task statistics for this project
    try {
      const tasks = await TaskModel.findByProject(id);
      const totalTasks = tasks.length;
      // Check for 'done' status from database
      const completedTasks = tasks.filter(task => 
        task.status === TaskStatus.COMPLETED
      ).length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      console.log(`📊 Project ${id} task stats:`, {
        totalTasks,
        completedTasks,
        progress,
        taskStatuses: tasks.map(t => ({ title: t.title, status: t.status }))
      });

      // Add task statistics to project data
      const projectWithStats = {
        ...project,
        totalTasks,
        completedTasks,
        progress
      };

      return NextResponse.json({
        success: true,
        data: projectWithStats
      });
    } catch (taskError) {
      console.warn('Error fetching task statistics:', taskError);
      // Return project without task stats if task fetching fails
      return NextResponse.json({
        success: true,
        data: {
          ...project,
          totalTasks: 0,
          completedTasks: 0,
          progress: 0
        }
      });
    }
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT: Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // Helper function to handle team ID mapping (same as in POST)
    const getTeamObjectId = (teamId: string) => {
      const teamMapping: { [key: string]: string } = {
        '1': '507f1f77bcf86cd799439011', // Example ObjectId for Team Web
        '2': '507f1f77bcf86cd799439012', // Example ObjectId for Team App
      };
      
      const mappedId = teamMapping[teamId];
      if (mappedId) {
        return new ObjectId(mappedId);
      }
      
      if (ObjectId.isValid(teamId)) {
        return new ObjectId(teamId);
      }
      
      return new ObjectId();
    };

    // Get original project để so sánh thay đổi
    const originalProject = await ProjectModel.findById(id);
    if (!originalProject) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Convert string IDs to ObjectIds if present
    const updateData = { ...data };
    if (updateData.team) updateData.team = getTeamObjectId(updateData.team);
    if (updateData.assignedTo) {
      updateData.assignedTo = updateData.assignedTo.map((userId: string) => 
        ObjectId.isValid(userId) ? new ObjectId(userId) : new ObjectId()
      );
    }
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
    if (updateData.deadline) updateData.deadline = new Date(updateData.deadline);

    const project = await ProjectModel.update(id, updateData);
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Gửi notification nếu có team được assign và có thay đổi quan trọng
    if (project.team) {
      try {
        const teamLeaderId = await getTeamLeaderIdFromTeam(project.team);
        if (teamLeaderId) {
          // Kiểm tra các thay đổi quan trọng
          const changes: string[] = [];
          if (data.name && data.name !== originalProject.name) changes.push('tên dự án');
          if (data.description && data.description !== originalProject.description) changes.push('mô tả');
          if (data.priority && data.priority !== originalProject.priority) changes.push('độ ưu tiên');
          if (data.status && data.status !== originalProject.status) changes.push('trạng thái');
          if (data.deadline && data.deadline !== originalProject.deadline?.toISOString()) changes.push('deadline');
          if (data.endDate && data.endDate !== originalProject.endDate?.toISOString()) changes.push('ngày kết thúc');

          // Chỉ gửi notification nếu có thay đổi quan trọng
          if (changes.length > 0) {
            await createProjectUpdatedNotification(
              project._id!.toString(),
              project.name,
              'current-admin-id', // Thay bằng ID admin thực từ auth
              teamLeaderId,
              changes
            );
          }
        }
      } catch (notificationError) {
        console.warn('Failed to send notification for project update:', notificationError);
        // Không throw error vì project đã được update thành công
      }
    }

    return NextResponse.json({
      success: true,
      data: project,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE: Delete project (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // Lấy thông tin project trước khi xóa để gửi notification
    const project = await ProjectModel.findById(id);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const success = await ProjectModel.delete(id);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete project' },
        { status: 500 }
      );
    }

    // Gửi notification cho team leader nếu project có team
    if (project.team) {
      try {
        const teamLeaderId = await getTeamLeaderIdFromTeam(project.team);
        if (teamLeaderId) {
          await createProjectDeletedNotification(
            project._id!.toString(),
            project.name,
            'current-admin-id', // Thay bằng ID admin thực từ auth
            teamLeaderId
          );
        }
      } catch (notificationError) {
        console.warn('Failed to send notification for project deletion:', notificationError);
        // Không throw error vì project đã được xóa thành công
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}