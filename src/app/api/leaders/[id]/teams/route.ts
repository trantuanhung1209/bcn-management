import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getTeamsCollection } from '@/lib/mongodb';

// GET - Lấy danh sách teams của leader
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID không hợp lệ' 
        },
        { status: 400 }
      );
    }

    const teamsCollection = await getTeamsCollection();
    const leaderId = new ObjectId(id);

    // Tìm tất cả teams mà leader này quản lý
    const teams = await teamsCollection.find({ 
      teamLeader: leaderId,
      isActive: true 
    }).toArray();

    return NextResponse.json({
      success: true,
      data: {
        teams,
        total: teams.length
      }
    });

  } catch (error: any) {
    console.error('Error fetching leader teams:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Lỗi khi lấy danh sách teams của leader' 
      },
      { status: 500 }
    );
  }
}
