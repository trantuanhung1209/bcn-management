import { NextRequest, NextResponse } from 'next/server';
import { ProjectModel } from '@/models/Project';
import { ObjectId } from 'mongodb';
import { ProjectStatus, TaskPriority } from '@/types';

// GET: Get all projects with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
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

    const result = await ProjectModel.findAll(filters);
    
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

    // Convert string IDs to ObjectIds
    const projectData = {
      ...data,
      team: new ObjectId(data.team),
      createdBy: new ObjectId(data.createdBy),
      assignedTo: data.assignedTo?.map((id: string) => new ObjectId(id)) || [],
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