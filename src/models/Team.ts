import { ObjectId } from "mongodb";
import { getTeamsCollection, getUsersCollection, getProjectsCollection } from "@/lib/mongodb";
import { Team } from "@/types";
import { UserModel } from "./User";

export class TeamModel {
  // Create a new team
  static async create(teamData: Omit<Team, '_id' | 'createdAt' | 'updatedAt'>): Promise<Team> {
    const collection = await getTeamsCollection();
    
    const newTeam: Omit<Team, '_id'> = {
      ...teamData,
      members: teamData.members || [],
      projects: teamData.projects || [],
      isActive: teamData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await collection.insertOne(newTeam);
    const createdTeam = await collection.findOne({ _id: result.insertedId });
    
    if (!createdTeam) {
      throw new Error("Failed to create team");
    }
    
    // Add team to team leader
    await UserModel.addTeam(createdTeam.teamLeader, createdTeam._id!);
    
    // Add team to all members
    for (const memberId of createdTeam.members) {
      await UserModel.addTeam(memberId, createdTeam._id!);
    }
    
    // Log activity
    await UserModel.logActivity(createdTeam.teamLeader, 'create', 'team', createdTeam._id!, {
      name: createdTeam.name,
      memberCount: createdTeam.members.length
    });
    
    return createdTeam;
  }
  
  // Find team by ID
  static async findById(id: string | ObjectId): Promise<Team | null> {
    const collection = await getTeamsCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return await collection.findOne({ _id: objectId });
  }
  
  // Find team by name
  static async findByName(name: string): Promise<Team | null> {
    const collection = await getTeamsCollection();
    return await collection.findOne({ name });
  }
  
  // Update team
  static async update(id: string | ObjectId, updateData: Partial<Team>): Promise<Team | null> {
    const collection = await getTeamsCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const currentTeam = await this.findById(objectId);
    if (!currentTeam) return null;
    
    const updateDoc = {
      ...updateData,
      updatedAt: new Date(),
    };
    
    await collection.updateOne(
      { _id: objectId },
      { $set: updateDoc }
    );
    
    const updatedTeam = await collection.findOne({ _id: objectId });
    
    if (updatedTeam) {
      // If team leader changed, update user associations
      if (updateData.teamLeader && !updateData.teamLeader.equals(currentTeam.teamLeader)) {
        await UserModel.removeTeam(currentTeam.teamLeader, objectId);
        await UserModel.addTeam(updateData.teamLeader, objectId);
      }
      
      // Log activity
      await UserModel.logActivity(updatedTeam.teamLeader, 'update', 'team', objectId, updateData);
    }
    
    return updatedTeam;
  }
  
  // Delete team (soft delete)
  static async delete(id: string | ObjectId): Promise<boolean> {
    const collection = await getTeamsCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const team = await this.findById(objectId);
    if (!team) return false;
    
    const result = await collection.updateOne(
      { _id: objectId },
      { 
        $set: { 
          isActive: false,
          updatedAt: new Date() 
        } 
      }
    );
    
    if (result.modifiedCount > 0) {
      // Remove team from all members
      for (const memberId of team.members) {
        await UserModel.removeTeam(memberId, objectId);
      }
      
      // Remove team from team leader
      await UserModel.removeTeam(team.teamLeader, objectId);
      
      // Log activity
      await UserModel.logActivity(team.teamLeader, 'delete', 'team', objectId, {});
    }
    
    return result.modifiedCount > 0;
  }
  
  // Restore team (undo soft delete)
  static async restore(id: string | ObjectId): Promise<boolean> {
    const collection = await getTeamsCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const team = await this.findById(objectId);
    if (!team) return false;
    
    // Check if team is already active
    if (team.isActive !== false) return false;
    
    const result = await collection.updateOne(
      { _id: objectId },
      { 
        $set: { 
          isActive: true,
          updatedAt: new Date() 
        } 
      }
    );
    
    if (result.modifiedCount > 0) {
      // Add team back to all members
      for (const memberId of team.members) {
        await UserModel.addTeam(memberId, objectId);
      }
      
      // Add team back to team leader
      await UserModel.addTeam(team.teamLeader, objectId);
      
      // Log activity
      await UserModel.logActivity(team.teamLeader, 'restore', 'team', objectId, {});
    }
    
    return result.modifiedCount > 0;
  }
  
  // Get deleted teams (for restore functionality)
  static async findDeleted(filters: {
    teamLeader?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ teams: Team[]; total: number }> {
    const collection = await getTeamsCollection();
    
    const query: any = { isActive: false };
    
    if (filters.teamLeader) query.teamLeader = new ObjectId(filters.teamLeader);
    
    if (filters.search) {
      query.$and = [
        { isActive: false },
        {
          $or: [
            { name: { $regex: filters.search, $options: 'i' } },
            { description: { $regex: filters.search, $options: 'i' } },
          ]
        }
      ];
      delete query.isActive; // Remove duplicate isActive
    }
    
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
    
    const [teams, total] = await Promise.all([
      collection.find(query)
        .sort({ updatedAt: -1 }) // Sort by when they were deleted
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query)
    ]);
    
    return { teams, total };
  }
  
  // Get all teams with filters
  static async findAll(filters: {
    teamLeader?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ teams: Team[]; total: number }> {
    const collection = await getTeamsCollection();
    
    const query: any = {};
    
    if (filters.teamLeader) query.teamLeader = new ObjectId(filters.teamLeader);
    
    // Handle isActive filter - bao gồm cả teams cũ không có field isActive
    if (filters.isActive !== undefined) {
      if (filters.isActive) {
        // Hiển thị teams active hoặc không có field isActive (teams cũ)
        query.$or = [
          { isActive: true },
          { isActive: { $exists: false } }
        ];
      } else {
        // Chỉ hiển thị teams bị deactive
        query.isActive = false;
      }
    }
    
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }
    
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
    
    const [teams, total] = await Promise.all([
      collection.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query)
    ]);
    
    return { teams, total };
  }
  
  // Add member to team
  static async addMember(teamId: string | ObjectId, memberId: string | ObjectId): Promise<boolean> {
    const collection = await getTeamsCollection();
    const teamObjectId = typeof teamId === 'string' ? new ObjectId(teamId) : teamId;
    const memberObjectId = typeof memberId === 'string' ? new ObjectId(memberId) : memberId;
    
    const result = await collection.updateOne(
      { _id: teamObjectId },
      { 
        $addToSet: { members: memberObjectId },
        $set: { updatedAt: new Date() }
      }
    );
    
    if (result.modifiedCount > 0) {
      // Add team to user
      await UserModel.addTeam(memberObjectId, teamObjectId);
      
      // Log activity
      const team = await this.findById(teamObjectId);
      if (team) {
        await UserModel.logActivity(team.teamLeader, 'add_member', 'team', teamObjectId, {
          memberId: memberObjectId.toString()
        });
      }
    }
    
    return result.modifiedCount > 0;
  }
  
  // Remove member from team
  static async removeMember(teamId: string | ObjectId, memberId: string | ObjectId): Promise<boolean> {
    const collection = await getTeamsCollection();
    const teamObjectId = typeof teamId === 'string' ? new ObjectId(teamId) : teamId;
    const memberObjectId = typeof memberId === 'string' ? new ObjectId(memberId) : memberId;
    
    const result = await collection.updateOne(
      { _id: teamObjectId },
      { 
        $pull: { members: memberObjectId },
        $set: { updatedAt: new Date() }
      }
    );
    
    if (result.modifiedCount > 0) {
      // Remove team from user
      await UserModel.removeTeam(memberObjectId, teamObjectId);
      
      // Log activity
      const team = await this.findById(teamObjectId);
      if (team) {
        await UserModel.logActivity(team.teamLeader, 'remove_member', 'team', teamObjectId, {
          memberId: memberObjectId.toString()
        });
      }
    }
    
    return result.modifiedCount > 0;
  }
  
  // Add project to team
  static async addProject(teamId: string | ObjectId, projectId: ObjectId): Promise<void> {
    const collection = await getTeamsCollection();
    const teamObjectId = typeof teamId === 'string' ? new ObjectId(teamId) : teamId;
    
    await collection.updateOne(
      { _id: teamObjectId },
      { 
        $addToSet: { projects: projectId },
        $set: { updatedAt: new Date() }
      }
    );
  }
  
  // Remove project from team
  static async removeProject(teamId: string | ObjectId, projectId: ObjectId): Promise<void> {
    const collection = await getTeamsCollection();
    const teamObjectId = typeof teamId === 'string' ? new ObjectId(teamId) : teamId;
    
    await collection.updateOne(
      { _id: teamObjectId },
      { 
        $pull: { projects: projectId },
        $set: { updatedAt: new Date() }
      }
    );
  }
  
  // Get team members with details
  static async getTeamMembers(teamId: string | ObjectId): Promise<any[]> {
    const collection = await getTeamsCollection();
    const usersCollection = await getUsersCollection();
    const teamObjectId = typeof teamId === 'string' ? new ObjectId(teamId) : teamId;
    
    const team = await collection.findOne({ _id: teamObjectId });
    if (!team) return [];
    
    // Get team leader
    const teamLeader = await usersCollection.findOne({ _id: team.teamLeader });
    
    // Get all members
    const members = await usersCollection.find({
      _id: { $in: team.members }
    }).toArray();
    
    return [
      { ...teamLeader, isTeamLeader: true },
      ...members.map(member => ({ ...member, isTeamLeader: false }))
    ];
  }
  
  // Get teams by user
  static async findByUser(userId: string | ObjectId): Promise<Team[]> {
    const collection = await getTeamsCollection();
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    return await collection.find({
      $or: [
        { teamLeader: userObjectId },
        { members: userObjectId }
      ],
      $and: [
        {
          $or: [
            { isActive: true },
            { isActive: { $exists: false } }
          ]
        }
      ]
    }).toArray();
  }
  
  // Remove user from all teams (for permanent user deletion)
  static async removeUserFromAllTeams(userId: string | ObjectId): Promise<void> {
    const collection = await getTeamsCollection();
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    // Remove user from all teams where they are a member
    await collection.updateMany(
      { members: userObjectId },
      { 
        $pull: { members: userObjectId },
        $set: { updatedAt: new Date() }
      }
    );
    
    // For teams where this user is the team leader, we need to handle this differently
    // You might want to either:
    // 1. Delete the team
    // 2. Transfer leadership to another member
    // 3. Mark team as inactive
    // For now, we'll mark teams as inactive if their leader is deleted
    await collection.updateMany(
      { teamLeader: userObjectId },
      { 
        $set: { 
          isActive: false,
          updatedAt: new Date()
        }
      }
    );
  }
  
  // Get team statistics
  static async getTeamStats(teamId: string | ObjectId): Promise<{
    memberCount: number;
    projectCount: number;
    completedProjects: number;
    activeProjects: number;
  }> {
    const team = await this.findById(teamId);
    if (!team) {
      return {
        memberCount: 0,
        projectCount: 0,
        completedProjects: 0,
        activeProjects: 0
      };
    }
    
    const projectsCollection = await getProjectsCollection();
    
    const [projectCount, completedProjects, activeProjects] = await Promise.all([
      projectsCollection.countDocuments({ team: team._id }),
      projectsCollection.countDocuments({ team: team._id, status: 'completed' as any }),
      projectsCollection.countDocuments({ 
        team: team._id, 
        status: { $in: ['planning', 'in_progress', 'testing'] as any }
      })
    ]);
    
    return {
      memberCount: team.members.length + 1, // +1 for team leader
      projectCount,
      completedProjects,
      activeProjects
    };
  }
}
