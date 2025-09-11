import { NextResponse } from 'next/server';
import { ProjectModel } from '@/models/Project';

// GET: Get dashboard statistics for projects
export async function GET() {
  try {
    const stats = await ProjectModel.getDashboardStats();
    
    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}