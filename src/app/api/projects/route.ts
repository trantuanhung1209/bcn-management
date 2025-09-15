import { NextRequest, NextResponse } from 'next/server';
import { ProjectModel } from '@/models/Project';
import { ObjectId } from 'mongodb';
import { ProjectStatus, TaskPriority } from '@/types';
import { filterProjectsForManager } from '@/lib/server-utils';

// GET: Get all projects with filters và phân quyền theo team
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Lấy thông tin user để xác định quyền truy cập
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');
    
    const filters = {
      status: searchParams.get('status') as ProjectStatus || undefined,
      priority: searchParams.get('priority') as TaskPriority || undefined,
      team: searchParams.get('team') || undefined,
      createdBy: searchParams.get('createdBy') || undefined,
      assignedTo: searchParams.get('assignedTo') || undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : true,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    };

    let result = await ProjectModel.findAll(filters);
    
    // Áp dụng phân quyền theo team cho manager
    if (userId && userRole && userRole === 'manager') {
      const filteredProjects = await filterProjectsForManager(userId, userRole, result.projects);
      result = {
        projects: filteredProjects,
        total: filteredProjects.length
      };
    }
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST: Create new project
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.description || !data.team || !data.createdBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Helper function to handle team ID mapping
    const getTeamObjectId = (teamId: string) => {
      // For now, create new ObjectIds for team "1" and "2"
      // In a real app, you would fetch actual team ObjectIds from database
      const teamMapping: { [key: string]: string } = {
        '1': '507f1f77bcf86cd799439011', // Example ObjectId for Team Web
        '2': '507f1f77bcf86cd799439012', // Example ObjectId for Team App
      };
      
      const mappedId = teamMapping[teamId];
      if (mappedId) {
        return new ObjectId(mappedId);
      }
      
      // If it's already a valid ObjectId
      if (ObjectId.isValid(teamId)) {
        return new ObjectId(teamId);
      }
      
      // Fallback: create new ObjectId
      return new ObjectId();
    };

    // Helper function to handle user ID
    const getUserObjectId = (userId: string) => {
      // For now, create a default user ObjectId
      // In a real app, you would get this from authentication
      if (userId === 'current-user-id') {
        return new ObjectId('507f1f77bcf86cd799439013'); // Example admin user ObjectId
      }
      
      if (ObjectId.isValid(userId)) {
        return new ObjectId(userId);
      }
      
      return new ObjectId();
    };

    // Convert and validate data
    const projectData = {
      ...data,
      team: getTeamObjectId(data.team),
      createdBy: getUserObjectId(data.createdBy),
      assignedTo: data.assignedTo?.map((id: string) => 
        ObjectId.isValid(id) ? new ObjectId(id) : new ObjectId()
      ) || [],
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
    };

    const project = await ProjectModel.create(projectData);
    
    return NextResponse.json({
      success: true,
      data: project,
      message: 'Project created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}