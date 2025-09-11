import { NextRequest, NextResponse } from 'next/server';
import { ProjectModel } from '@/models/Project';
import { ObjectId } from 'mongodb';

// GET: Get project statistics
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

    const stats = await ProjectModel.getProjectStats(id);
    
    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching project stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project statistics' },
      { status: 500 }
    );
  }
}