import { ObjectId } from "mongodb";
import { getProjectsCollection, getTasksCollection } from "@/lib/mongodb";
import { Project, ProjectStatus, TaskPriority } from "@/types";
import { UserModel } from "./User";
import { TeamModel } from "./Team";

export class ProjectModel {
  // Create a new project
  static async create(projectData: Omit<Project, '_id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const collection = await getProjectsCollection();
    
    const newProject: Omit<Project, '_id'> = {
      ...projectData,
      assignedTo: projectData.assignedTo || [],
      progress: projectData.progress || 0,
      tags: projectData.tags || [],
      attachments: projectData.attachments || [],
      isActive: projectData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await collection.insertOne(newProject);
    const createdProject = await collection.findOne({ _id: result.insertedId });
    
    if (!createdProject) {
      throw new Error("Failed to create project");
    }
    
    // Add project to team
    await TeamModel.addProject(createdProject.team, createdProject._id!);
    
    // Add project to assigned users
    for (const userId of createdProject.assignedTo) {
      await UserModel.addProject(userId, createdProject._id!);
    }
    
    // Log activity
    await UserModel.logActivity(createdProject.createdBy, 'create', 'project', createdProject._id!, {
      name: createdProject.name,
      status: createdProject.status,
      priority: createdProject.priority
    });
    
    return createdProject;
  }
  
  // Find project by ID
  static async findById(id: string | ObjectId): Promise<Project | null> {
    const collection = await getProjectsCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return await collection.findOne({ _id: objectId });
  }
  
  // Find project by name
  static async findByName(name: string): Promise<Project | null> {
    const collection = await getProjectsCollection();
    return await collection.findOne({ name });
  }
  
  // Update project
  static async update(id: string | ObjectId, updateData: Partial<Project>): Promise<Project | null> {
    const collection = await getProjectsCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const currentProject = await this.findById(objectId);
    if (!currentProject) return null;
    
    const updateDoc = {
      ...updateData,
      updatedAt: new Date(),
    };
    
    await collection.updateOne(
      { _id: objectId },
      { $set: updateDoc }
    );
    
    const updatedProject = await collection.findOne({ _id: objectId });
    
    if (updatedProject) {
      // If team changed, update associations
      if (updateData.team && !updateData.team.equals(currentProject.team)) {
        await TeamModel.removeProject(currentProject.team, objectId);
        await TeamModel.addProject(updateData.team, objectId);
      }
      
      // If assigned users changed, update associations
      if (updateData.assignedTo) {
        // Remove project from old assigned users
        const usersToRemove = currentProject.assignedTo.filter(
          userId => !updateData.assignedTo!.some(newUserId => newUserId.equals(userId))
        );
        for (const userId of usersToRemove) {
          await UserModel.removeProject(userId, objectId);
        }
        
        // Add project to new assigned users
        const usersToAdd = updateData.assignedTo.filter(
          userId => !currentProject.assignedTo.some(oldUserId => oldUserId.equals(userId))
        );
        for (const userId of usersToAdd) {
          await UserModel.addProject(userId, objectId);
        }
      }
      
      // Log activity
      await UserModel.logActivity(updatedProject.createdBy, 'update', 'project', objectId, updateData);
    }
    
    return updatedProject;
  }
  
  // Delete project (soft delete)
  static async delete(id: string | ObjectId): Promise<boolean> {
    const collection = await getProjectsCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const project = await this.findById(objectId);
    if (!project) return false;
    
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
      // Remove project from team
      await TeamModel.removeProject(project.team, objectId);
      
      // Remove project from all assigned users
      for (const userId of project.assignedTo) {
        await UserModel.removeProject(userId, objectId);
      }
      
      // Log activity
      await UserModel.logActivity(project.createdBy, 'delete', 'project', objectId, {});
    }
    
    return result.modifiedCount > 0;
  }
  
  // Permanently delete project from database (for rejected projects only)
  static async permanentDelete(id: string | ObjectId, deletedBy: string | ObjectId): Promise<boolean> {
    const collection = await getProjectsCollection();
    const tasksCollection = await getTasksCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    const deletedByObjectId = typeof deletedBy === 'string' ? new ObjectId(deletedBy) : deletedBy;
    
    const project = await this.findById(objectId);
    if (!project) return false;
    
    // Only allow permanent deletion of rejected projects
    if (!(project as any).rejectedAt) {
      throw new Error("Only rejected projects can be permanently deleted");
    }
    
    // First, permanently delete all tasks associated with this project
    const deleteTasksResult = await tasksCollection.deleteMany({
      project: objectId
    });
    
    // Remove project from team associations
    await TeamModel.removeProject(project.team, objectId);
    
    // Remove project from all assigned users
    for (const userId of project.assignedTo) {
      await UserModel.removeProject(userId, objectId);
    }
    
    // Then permanently delete the project itself
    const result = await collection.deleteOne({ _id: objectId });
    
    if (result.deletedCount > 0) {
      // Log permanent deletion activity
      await UserModel.logActivity(deletedByObjectId, 'permanent_delete', 'project', objectId, {
        projectName: project.name,
        tasksDeleted: deleteTasksResult.deletedCount,
        reason: 'Rejected project permanently deleted'
      });
    }
    
    return result.deletedCount > 0;
  }
  
  // Get all projects with filters
  static async findAll(filters: {
    status?: ProjectStatus;
    priority?: TaskPriority;
    team?: string;
    createdBy?: string;
    assignedTo?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ projects: Project[]; total: number }> {
    const collection = await getProjectsCollection();
    
    const query: any = {};
    
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.team) query.team = new ObjectId(filters.team);
    if (filters.createdBy) query.createdBy = new ObjectId(filters.createdBy);
    if (filters.assignedTo) query.assignedTo = new ObjectId(filters.assignedTo);
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { tags: { $in: [new RegExp(filters.search, 'i')] } },
      ];
    }
    
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
    
    const [projects, total] = await Promise.all([
      collection.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query)
    ]);
    
    return { projects, total };
  }
  
  // Add user to project
  static async addUser(projectId: string | ObjectId, userId: string | ObjectId): Promise<boolean> {
    const collection = await getProjectsCollection();
    const projectObjectId = typeof projectId === 'string' ? new ObjectId(projectId) : projectId;
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    const result = await collection.updateOne(
      { _id: projectObjectId },
      { 
        $addToSet: { assignedTo: userObjectId },
        $set: { updatedAt: new Date() }
      }
    );
    
    if (result.modifiedCount > 0) {
      // Add project to user
      await UserModel.addProject(userObjectId, projectObjectId);
      
      // Log activity
      const project = await this.findById(projectObjectId);
      if (project) {
        await UserModel.logActivity(project.createdBy, 'add_user', 'project', projectObjectId, {
          userId: userObjectId.toString()
        });
      }
    }
    
    return result.modifiedCount > 0;
  }
  
  // Admin assigns project to team (Manager needs to accept)
  static async assignToTeam(projectId: string | ObjectId, teamId: string | ObjectId, managerId: string | ObjectId): Promise<boolean> {
    const collection = await getProjectsCollection();
    const projectObjectId = typeof projectId === 'string' ? new ObjectId(projectId) : projectId;
    const teamObjectId = typeof teamId === 'string' ? new ObjectId(teamId) : teamId;
    const managerObjectId = typeof managerId === 'string' ? new ObjectId(managerId) : managerId;
    
    const result = await collection.updateOne(
      { _id: projectObjectId },
      { 
        $set: { 
          team: teamObjectId,
          manager: managerObjectId,
          isAssigned: true,
          assignedAt: new Date(),
          updatedAt: new Date() 
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      // Add project to team
      await TeamModel.addProject(teamObjectId, projectObjectId);
      
      // Log activity
      const project = await this.findById(projectObjectId);
      if (project) {
        await UserModel.logActivity(project.createdBy, 'assign_project', 'project', projectObjectId, {
          teamId: teamObjectId.toString(),
          managerId: managerObjectId.toString()
        });
      }
    }
    
    return result.modifiedCount > 0;
  }
  
  // Manager accepts assigned project
  static async acceptProject(projectId: string | ObjectId, managerId: string | ObjectId): Promise<boolean> {
    const collection = await getProjectsCollection();
    const projectObjectId = typeof projectId === 'string' ? new ObjectId(projectId) : projectId;
    const managerObjectId = typeof managerId === 'string' ? new ObjectId(managerId) : managerId;
    
    const project = await this.findById(projectObjectId);
    if (!project) return false;
    
    // Check if manager is assigned to this project
    if (!project.manager || !project.manager.equals(managerObjectId)) {
      throw new Error("Unauthorized: This project is not assigned to you");
    }
    
    const result = await collection.updateOne(
      { _id: projectObjectId },
      { 
        $set: { 
          acceptedAt: new Date(),
          status: 'planning' as any, // Start with planning status
          updatedAt: new Date() 
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      // Log activity
      await UserModel.logActivity(managerObjectId, 'accept_project', 'project', projectObjectId, {
        projectName: project.name
      });
    }
    
    return result.modifiedCount > 0;
  }
  
  // Get projects assigned to manager but not yet accepted
  static async getPendingProjects(managerId: string | ObjectId): Promise<Project[]> {
    const collection = await getProjectsCollection();
    const managerObjectId = typeof managerId === 'string' ? new ObjectId(managerId) : managerId;
    
    return await collection.find({
      manager: managerObjectId,
      isAssigned: true,
      acceptedAt: { $exists: false },
      isActive: true
    }).toArray();
  }
  
  // Get projects managed by manager (accepted)
  static async getManagedProjects(managerId: string | ObjectId): Promise<Project[]> {
    const collection = await getProjectsCollection();
    const managerObjectId = typeof managerId === 'string' ? new ObjectId(managerId) : managerId;
    
    return await collection.find({
      manager: managerObjectId,
      acceptedAt: { $exists: true },
      isActive: true
    }).toArray();
  }
  
  // Remove user from project
  static async removeUser(projectId: string | ObjectId, userId: string | ObjectId): Promise<boolean> {
    const collection = await getProjectsCollection();
    const projectObjectId = typeof projectId === 'string' ? new ObjectId(projectId) : projectId;
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    const result = await collection.updateOne(
      { _id: projectObjectId },
      { 
        $pull: { assignedTo: userObjectId },
        $set: { updatedAt: new Date() }
      }
    );
    
    if (result.modifiedCount > 0) {
      // Remove project from user
      await UserModel.removeProject(userObjectId, projectObjectId);
      
      // Log activity
      const project = await this.findById(projectObjectId);
      if (project) {
        await UserModel.logActivity(project.createdBy, 'remove_user', 'project', projectObjectId, {
          userId: userObjectId.toString()
        });
      }
    }
    
    return result.modifiedCount > 0;
  }
  
  // Update project progress
  static async updateProgress(projectId: string | ObjectId): Promise<void> {
    const tasksCollection = await getTasksCollection();
    const projectObjectId = typeof projectId === 'string' ? new ObjectId(projectId) : projectId;
    
    const [totalTasks, completedTasks] = await Promise.all([
      tasksCollection.countDocuments({ project: projectObjectId }),
      tasksCollection.countDocuments({ project: projectObjectId, status: 'completed' as any })
    ]);
    
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    await this.update(projectObjectId, { progress });
  }
  
  // Get projects by team
  static async findByTeam(teamId: string | ObjectId): Promise<Project[]> {
    const collection = await getProjectsCollection();
    const teamObjectId = typeof teamId === 'string' ? new ObjectId(teamId) : teamId;
    
    return await collection.find({
      team: teamObjectId,
      isActive: true
    }).toArray();
  }
  
  // Get projects by user
  static async findByUser(userId: string | ObjectId): Promise<Project[]> {
    const collection = await getProjectsCollection();
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    return await collection.find({
      $or: [
        { createdBy: userObjectId },
        { assignedTo: userObjectId }
      ],
      isActive: true
    }).toArray();
  }
  
  // Get project statistics
  static async getProjectStats(projectId: string | ObjectId): Promise<{
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    progress: number;
  }> {
    const tasksCollection = await getTasksCollection();
    const projectObjectId = typeof projectId === 'string' ? new ObjectId(projectId) : projectId;
    
    const [totalTasks, completedTasks, inProgressTasks, overdueTasks] = await Promise.all([
      tasksCollection.countDocuments({ project: projectObjectId }),
      tasksCollection.countDocuments({ project: projectObjectId, status: 'done' as any }),
      tasksCollection.countDocuments({ project: projectObjectId, status: 'in_progress' as any }),
      tasksCollection.countDocuments({
        project: projectObjectId,
        dueDate: { $lt: new Date() },
        status: { $ne: 'done' as any }
      })
    ]);
    
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      progress
    };
  }
  
  // Get dashboard statistics
  static async getDashboardStats(): Promise<{
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    onHoldProjects: number;
    averageProgress: number;
  }> {
    const collection = await getProjectsCollection();
    
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      allProjects
    ] = await Promise.all([
      collection.countDocuments({ isActive: true }),
      collection.countDocuments({ 
        isActive: true, 
        status: { $in: ['planning', 'in_progress', 'testing'] as any }
      }),
      collection.countDocuments({ isActive: true, status: 'completed' as any }),
      collection.countDocuments({ isActive: true, status: 'on_hold' as any }),
      collection.find({ isActive: true }, { projection: { progress: 1 } }).toArray()
    ]);
    
    const averageProgress = allProjects.length > 0 
      ? Math.round(allProjects.reduce((sum, project) => sum + project.progress, 0) / allProjects.length)
      : 0;
    
    return {
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      averageProgress
    };
  }
}
