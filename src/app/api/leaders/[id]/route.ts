import { NextResponse } from 'next/server';
import { UserModel } from '@/models/User';
import { ObjectId } from 'mongodb';

// GET - Lấy thông tin leader theo ID
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

    const leader = await UserModel.findById(id);

    if (!leader) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Không tìm thấy leader' 
        },
        { status: 404 }
      );
    }

    // Loại bỏ password khỏi response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...leaderResponse } = leader;

    return NextResponse.json({
      success: true,
      data: leaderResponse
    });

  } catch (error: any) {
    console.error('Error fetching leader:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Lỗi khi lấy thông tin leader' 
      },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật thông tin leader
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID không hợp lệ' 
        },
        { status: 400 }
      );
    }

    // Kiểm tra leader có tồn tại không
    const existingLeader = await UserModel.findById(id);
    if (!existingLeader) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Không tìm thấy leader' 
        },
        { status: 404 }
      );
    }

    // Loại bỏ các trường không được phép cập nhật
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, role, _id, createdAt, updatedAt, ...updateData } = body;

    // Nếu có email mới, kiểm tra xem đã tồn tại chưa
    if (updateData.email && updateData.email !== existingLeader.email) {
      const emailExists = await UserModel.findByEmail(updateData.email);
      if (emailExists) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Email đã được sử dụng' 
          },
          { status: 400 }
        );
      }
    }

    // Cập nhật leader
    const updatedLeader = await UserModel.update(id, updateData);

    if (!updatedLeader) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Lỗi khi cập nhật leader' 
        },
        { status: 500 }
      );
    }

    // Loại bỏ password khỏi response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...leaderResponse } = updatedLeader;

    return NextResponse.json({
      success: true,
      data: leaderResponse,
      message: 'Cập nhật leader thành công'
    });

  } catch (error: any) {
    console.error('Error updating leader:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Lỗi khi cập nhật leader' 
      },
      { status: 500 }
    );
  }
}

// DELETE - Xóa leader (soft delete)
export async function DELETE(
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

    // Kiểm tra leader có tồn tại không
    const existingLeader = await UserModel.findById(id);
    if (!existingLeader) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Không tìm thấy leader' 
        },
        { status: 404 }
      );
    }

    // Xóa leader (soft delete)
    const deleted = await UserModel.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Lỗi khi xóa leader' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa leader thành công'
    });

  } catch (error: any) {
    console.error('Error deleting leader:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Lỗi khi xóa leader' 
      },
      { status: 500 }
    );
  }
}
