import { ObjectId } from "mongodb";
import { getUsersCollection, getActivityLogsCollection } from "@/lib/mongodb";
import { User, UserRole, ActivityLog } from "@/types";
import { hashPassword, comparePassword } from "@/lib/utils";

export class UserModel {
  // Create a new user
  static async create(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const collection = await getUsersCollection();
    
    // Hash password before saving
    const hashedPassword = await hashPassword(userData.password);
    
    const newUser: Omit<User, '_id'> = {
      ...userData,
      password: hashedPassword,
      teams: userData.teams || [],
      projects: userData.projects || [],
      isActive: userData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await collection.insertOne(newUser);
    const createdUser = await collection.findOne({ _id: result.insertedId });
    
    if (!createdUser) {
      throw new Error("Failed to create user");
    }
    
    // Log activity
    await this.logActivity(createdUser._id!, 'create', 'user', createdUser._id!, {
      email: createdUser.email,
      role: createdUser.role
    });
    
    return createdUser;
  }
  
  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const collection = await getUsersCollection();
    return await collection.findOne({ email });
  }
  
  // Find user by ID
  static async findById(id: string | ObjectId): Promise<User | null> {
    const collection = await getUsersCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return await collection.findOne({ _id: objectId });
  }
  
  // Authenticate user
  static async authenticate(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;
    
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) return null;
    
    // Update last login
    await this.updateLastLogin(user._id!);
    
    return user;
  }
  
  // Update user
  static async update(id: string | ObjectId, updateData: Partial<User>): Promise<User | null> {
    const collection = await getUsersCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    // Hash password if being updated
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }
    
    const updateDoc = {
      ...updateData,
      updatedAt: new Date(),
    };
    
    await collection.updateOne(
      { _id: objectId },
      { $set: updateDoc }
    );
    
    const updatedUser = await collection.findOne({ _id: objectId });
    
    if (updatedUser) {
      // Log activity
      await this.logActivity(objectId, 'update', 'user', objectId, updateData);
    }
    
    return updatedUser;
  }
  
  // Delete user (soft delete)
  static async delete(id: string | ObjectId): Promise<boolean> {
    const collection = await getUsersCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
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
      // Log activity
      await this.logActivity(objectId, 'delete', 'user', objectId, {});
    }
    
    return result.modifiedCount > 0;
  }
  
  // Permanently delete user (hard delete)
  static async permanentDelete(id: string | ObjectId): Promise<boolean> {
    const collection = await getUsersCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    // Log activity before deletion
    await this.logActivity(objectId, 'permanent_delete', 'user', objectId, {});
    
    const result = await collection.deleteOne({ _id: objectId });
    
    return result.deletedCount > 0;
  }
  
  // Get all users with filters
  static async findAll(filters: {
    role?: UserRole;
    department?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ users: User[]; total: number }> {
    const collection = await getUsersCollection();
    
    const query: any = {};
    
    if (filters.role) query.role = filters.role;
    if (filters.department) query.department = filters.department;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    
    if (filters.search) {
      query.$or = [
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
      ];
    }
    
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      collection.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query)
    ]);
    
    return { users, total };
  }
  
  // Update last login
  static async updateLastLogin(id: ObjectId): Promise<void> {
    const collection = await getUsersCollection();
    await collection.updateOne(
      { _id: id },
      { $set: { lastLogin: new Date(), updatedAt: new Date() } }
    );
  }
  
  // Add team to user
  static async addTeam(userId: string | ObjectId, teamId: ObjectId): Promise<void> {
    const collection = await getUsersCollection();
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    await collection.updateOne(
      { _id: userObjectId },
      { 
        $addToSet: { teams: teamId },
        $set: { updatedAt: new Date() }
      }
    );
  }
  
  // Remove team from user
  static async removeTeam(userId: string | ObjectId, teamId: ObjectId): Promise<void> {
    const collection = await getUsersCollection();
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    await collection.updateOne(
      { _id: userObjectId },
      { 
        $pull: { teams: teamId },
        $set: { updatedAt: new Date() }
      }
    );
  }
  
  // Add project to user
  static async addProject(userId: string | ObjectId, projectId: ObjectId): Promise<void> {
    const collection = await getUsersCollection();
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    await collection.updateOne(
      { _id: userObjectId },
      { 
        $addToSet: { projects: projectId },
        $set: { updatedAt: new Date() }
      }
    );
  }
  
  // Remove project from user
  static async removeProject(userId: string | ObjectId, projectId: ObjectId): Promise<void> {
    const collection = await getUsersCollection();
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    await collection.updateOne(
      { _id: userObjectId },
      { 
        $pull: { projects: projectId },
        $set: { updatedAt: new Date() }
      }
    );
  }
  
  // Get users by team
  static async findByTeam(teamId: string | ObjectId): Promise<User[]> {
    const collection = await getUsersCollection();
    const teamObjectId = typeof teamId === 'string' ? new ObjectId(teamId) : teamId;
    
    return await collection.find({ 
      teams: teamObjectId,
      isActive: true 
    }).toArray();
  }
  
  // Get users by role
  static async findByRole(role: UserRole): Promise<User[]> {
    const collection = await getUsersCollection();
    return await collection.find({ 
      role,
      isActive: true 
    }).toArray();
  }
  
  // Log user activity
  static async logActivity(
    userId: ObjectId,
    action: string,
    target: string,
    targetId: ObjectId,
    details: Record<string, any>
  ): Promise<void> {
    const activityCollection = await getActivityLogsCollection();
    
    const activityLog: Omit<ActivityLog, '_id'> = {
      user: userId,
      action,
      target,
      targetId,
      details,
      createdAt: new Date(),
    };
    
    await activityCollection.insertOne(activityLog);
  }
}
