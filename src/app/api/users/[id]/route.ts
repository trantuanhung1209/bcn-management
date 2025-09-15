import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/models/User';
import { TeamModel } from '@/models/Team';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const user = await UserModel.findById(id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updateData = { ...body };

    // Get current user data to compare teams
    const currentUser = await UserModel.findById(id);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Handle team changes if teams array is provided
    if (updateData.teams !== undefined) {
      const newTeamIds = updateData.teams.map((teamId: string) => new ObjectId(teamId));
      const currentTeamIds = currentUser.teams || [];

      // Find teams to remove (in current but not in new)
      const teamsToRemove = currentTeamIds.filter(
        (currentTeamId: ObjectId) => 
          !newTeamIds.some((newTeamId: ObjectId) => newTeamId.equals(currentTeamId))
      );

      // Find teams to add (in new but not in current)
      const teamsToAdd = newTeamIds.filter(
        (newTeamId: ObjectId) => 
          !currentTeamIds.some((currentTeamId: ObjectId) => currentTeamId.equals(newTeamId))
      );

      // Remove user from old teams
      for (const teamId of teamsToRemove) {
        await TeamModel.removeMember(teamId, id);
      }

      // Add user to new teams - always as member regardless of role
      // Team leadership is handled separately by updating the teamLeader field directly in the team
      for (const teamId of teamsToAdd) {
        await TeamModel.addMember(teamId, id);
      }

      // Remove teams from updateData since it's already handled by TeamModel methods
      delete updateData.teams;
    }

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Update other user fields (role, etc.) if any remaining
    let updatedUser = currentUser;
    if (Object.keys(updateData).length > 0) {
      const userUpdateResult = await UserModel.update(id, updateData);
      if (!userUpdateResult) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      updatedUser = userUpdateResult;
    } else {
      // If only teams were updated, refresh user data to get updated teams
      const refreshedUser = await UserModel.findById(id);
      if (!refreshedUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      updatedUser = refreshedUser;
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const success = await UserModel.delete(id);

    if (!success) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
