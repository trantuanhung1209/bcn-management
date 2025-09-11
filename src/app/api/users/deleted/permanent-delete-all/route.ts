import { NextResponse } from 'next/server';
import { UserModel } from '@/models/User';
import { TeamModel } from '@/models/Team';

export async function DELETE() {
  try {
    // Get all deleted users (isActive: false)
    const { users } = await UserModel.findAll({ isActive: false, limit: 1000 });
    
    if (users.length === 0) {
      return NextResponse.json(
        { message: 'No deleted users found to permanently delete' },
        { status: 200 }
      );
    }

    // Filter out admin users for safety
    const nonAdminUsers = users.filter(user => user.role !== 'admin');
    
    if (nonAdminUsers.length === 0) {
      return NextResponse.json(
        { message: 'No non-admin deleted users found to permanently delete' },
        { status: 200 }
      );
    }

    const deletedUserIds: string[] = [];
    const errors: string[] = [];

    // Remove users from all teams and permanently delete them
    for (const user of nonAdminUsers) {
      try {
        // Remove user from all teams
        await TeamModel.removeUserFromAllTeams(user._id!);
        
        // Permanently delete the user
        const deleted = await UserModel.permanentDelete(user._id!);
        
        if (deleted) {
          deletedUserIds.push(user._id!.toString());
        } else {
          errors.push(`Failed to delete user: ${user.email}`);
        }
      } catch (error) {
        console.error(`Error deleting user ${user.email}:`, error);
        errors.push(`Error deleting user: ${user.email}`);
      }
    }

    return NextResponse.json({
      message: `Successfully deleted ${deletedUserIds.length} users permanently`,
      deletedCount: deletedUserIds.length,
      deletedUserIds,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error permanently deleting all users:', error);
    return NextResponse.json(
      { error: 'Failed to permanently delete all users' },
      { status: 500 }
    );
  }
}