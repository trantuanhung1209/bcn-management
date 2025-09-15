import { ObjectId } from "mongodb";
import { getTasksCollection } from "@/lib/mongodb";
import { Task, TaskStatus, TaskPriority } from "@/types";
import { UserModel } from "./User";
import { ProjectModel } from "./Project";

export class TaskModel {
  // Create a new task (Manager tạo cho Member)
  static async create(taskData: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const collection = await getTasksCollection();
    
    const newTask: Omit<Task, '_id'> = {
      ...taskData,
      progress: taskData.progress || 0,
      tags: taskData.tags || [],
      comments: taskData.comments || [],
      attachments: taskData.attachments || [],
      dependencies: taskData.dependencies || [],
      isActive: taskData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await collection.insertOne(newTask);
    const createdTask = await collection.findOne({ _id: result.insertedId });
    
    if (!createdTask) {
      throw new Error("Failed to create task");
    }
    
    // Update project progress when new task is added
    await ProjectModel.updateProgress(createdTask.project);
    
    // Log activity
    await UserModel.logActivity(createdTask.createdBy, 'create', 'task', createdTask._id!, {
      title: createdTask.title,
      assignedTo: createdTask.assignedTo.toString(),
      project: createdTask.project.toString()
    });
    
    return createdTask;
  }
  
  // Find task by ID
  static async findById(id: string | ObjectId): Promise<Task | null> {
    const collection = await getTasksCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return await collection.findOne({ _id: objectId });
  }
  
  // Update task (Member cập nhật progress, status)
  static async update(id: string | ObjectId, updateData: Partial<Task>): Promise<Task | null> {
    const collection = await getTasksCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const currentTask = await this.findById(objectId);
    if (!currentTask) return null;
    
    const updateDoc = {
      ...updateData,
      updatedAt: new Date(),
    };
    
    // Auto-complete task when progress reaches 100%
    if (updateData.progress === 100 && currentTask.status !== 'done') {
      updateDoc.status = 'done' as TaskStatus;
      updateDoc.completedAt = new Date();
    }
    
    // Auto-set progress to 100% when status is done
    if (updateData.status === 'done' && currentTask.progress !== 100) {
      updateDoc.progress = 100;
      updateDoc.completedAt = new Date();
    }
    
    await collection.updateOne(
      { _id: objectId },
      { $set: updateDoc }
    );
    
    const updatedTask = await collection.findOne({ _id: objectId });
    
    if (updatedTask) {
      // Update project progress when task is updated
      await ProjectModel.updateProgress(updatedTask.project);
      
      // Log activity
      await UserModel.logActivity(updatedTask.assignedTo, 'update', 'task', objectId, updateData);
    }
    
    return updatedTask;
  }
  
  // Delete task (soft delete)
  static async delete(id: string | ObjectId, deletedBy?: string | ObjectId): Promise<boolean> {
    const collection = await getTasksCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const task = await this.findById(objectId);
    if (!task) return false;
    
    const updateData: any = { 
      isActive: false,
      deletedAt: new Date(),
      updatedAt: new Date() 
    };
    
    if (deletedBy) {
      updateData.deletedBy = typeof deletedBy === 'string' ? new ObjectId(deletedBy) : deletedBy;
    }
    
    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updateData }
    );
    
    if (result.modifiedCount > 0) {
      // Update project progress when task is deleted
      await ProjectModel.updateProgress(task.project);
      
      // Log activity
      const userId = deletedBy || task.createdBy;
      const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
      await UserModel.logActivity(userIdObj, 'delete', 'task', objectId, {});
    }
    
    return result.modifiedCount > 0;
  }
  
  // Permanently delete task from database
  static async permanentDelete(id: string | ObjectId): Promise<boolean> {
    const collection = await getTasksCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const task = await this.findById(objectId);
    if (!task) return false;
    
    const result = await collection.deleteOne({ _id: objectId });
    
    if (result.deletedCount > 0) {
      // Update project progress when task is permanently deleted
      await ProjectModel.updateProgress(task.project);
    }
    
    return result.deletedCount > 0;
  }
  
  // Restore soft deleted task
  static async restore(id: string | ObjectId): Promise<boolean> {
    const collection = await getTasksCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await collection.updateOne(
      { _id: objectId },
      { 
        $set: { 
          isActive: true,
          updatedAt: new Date() 
        },
        $unset: {
          deletedAt: "",
          deletedBy: ""
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      const task = await this.findById(objectId);
      if (task) {
        // Update project progress when task is restored
        await ProjectModel.updateProgress(task.project);
      }
    }
    
    return result.modifiedCount > 0;
  }
  
  // Get task history with all changes
  static async getTaskHistory(filters: {
    project?: string;
    taskId?: string;
    includeDeleted?: boolean;
  } = {}): Promise<Task[]> {
    const collection = await getTasksCollection();
    
    const query: any = {};
    
    if (filters.project) query.project = new ObjectId(filters.project);
    if (filters.taskId) query._id = new ObjectId(filters.taskId);
    
    // Include deleted tasks if specified
    if (!filters.includeDeleted) {
      query.isActive = true;
    }
    
    return await collection.find(query)
      .sort({ updatedAt: -1, createdAt: -1 })
      .toArray();
  }
  
  // Get all tasks with filters
  static async findAll(filters: {
    project?: string;
    assignedTo?: string;
    createdBy?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ tasks: Task[]; total: number }> {
    const collection = await getTasksCollection();
    
    const query: any = {};
    
    if (filters.project) query.project = new ObjectId(filters.project);
    if (filters.assignedTo) query.assignedTo = new ObjectId(filters.assignedTo);
    if (filters.createdBy) query.createdBy = new ObjectId(filters.createdBy);
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    
    // Default to only active tasks unless explicitly specified
    query.isActive = filters.isActive !== undefined ? filters.isActive : true;
    
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { tags: { $in: [new RegExp(filters.search, 'i')] } },
      ];
    }
    
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
    
    // Use aggregation to populate assignedTo user information
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'assignedUser'
        }
      },
      {
        $addFields: {
          assignedToName: {
            $cond: {
              if: { $gt: [{ $size: '$assignedUser' }, 0] },
              then: {
                $concat: [
                  { $arrayElemAt: ['$assignedUser.firstName', 0] },
                  ' ',
                  { $arrayElemAt: ['$assignedUser.lastName', 0] }
                ]
              },
              else: 'Chưa gán'
            }
          }
        }
      },
      { $project: { assignedUser: 0 } }, // Remove the joined user data
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];
    
    const [tasksResult, total] = await Promise.all([
      collection.aggregate(pipeline).toArray(),
      collection.countDocuments(query)
    ]);
    
    // Cast the result to Task[] since we know the structure
    const tasks = tasksResult as Task[];
    
    return { tasks, total };
  }
  
  // Get tasks by project
  static async findByProject(projectId: string | ObjectId): Promise<Task[]> {
    const collection = await getTasksCollection();
    const projectObjectId = typeof projectId === 'string' ? new ObjectId(projectId) : projectId;
    
    return await collection.find({
      project: projectObjectId,
      isActive: true
    }).sort({ createdAt: -1 }).toArray();
  }
  
  // Get tasks by user (Member's tasks)
  static async findByUser(userId: string | ObjectId): Promise<Task[]> {
    const collection = await getTasksCollection();
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    return await collection.find({
      assignedTo: userObjectId,
      isActive: true
    }).sort({ dueDate: 1, createdAt: -1 }).toArray();
  }
  
  // Get tasks created by manager
  static async findByCreator(creatorId: string | ObjectId): Promise<Task[]> {
    const collection = await getTasksCollection();
    const creatorObjectId = typeof creatorId === 'string' ? new ObjectId(creatorId) : creatorId;
    
    return await collection.find({
      createdBy: creatorObjectId,
      isActive: true
    }).sort({ createdAt: -1 }).toArray();
  }
  
  // Update task progress (Member tự cập nhật)
  static async updateProgress(taskId: string | ObjectId, progress: number, userId: string | ObjectId): Promise<boolean> {
    const collection = await getTasksCollection();
    const taskObjectId = typeof taskId === 'string' ? new ObjectId(taskId) : taskId;
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    const task = await this.findById(taskObjectId);
    if (!task) return false;
    
    // Chỉ cho phép Member được assign cập nhật progress
    if (!task.assignedTo.equals(userObjectId)) {
      throw new Error("Unauthorized: Only assigned member can update progress");
    }
    
    const updateData: Partial<Task> = {
      progress: Math.max(0, Math.min(100, progress)),
      updatedAt: new Date()
    };
    
    // Auto-complete task when progress reaches 100%
    if (progress >= 100) {
      updateData.status = 'done' as TaskStatus;
      updateData.completedAt = new Date();
      updateData.progress = 100;
    } else if (progress > 0 && task.status === 'todo') {
      updateData.status = 'in_progress' as TaskStatus;
    }
    
    const result = await collection.updateOne(
      { _id: taskObjectId },
      { $set: updateData }
    );
    
    if (result.modifiedCount > 0) {
      // Update project progress
      await ProjectModel.updateProgress(task.project);
      
      // Log activity
      await UserModel.logActivity(userObjectId, 'update_progress', 'task', taskObjectId, {
        progress: updateData.progress,
        oldProgress: task.progress
      });
    }
    
    return result.modifiedCount > 0;
  }
  
  // Update task status (Member cập nhật trạng thái)
  static async updateStatus(taskId: string | ObjectId, status: TaskStatus, userId: string | ObjectId): Promise<boolean> {
    const collection = await getTasksCollection();
    const taskObjectId = typeof taskId === 'string' ? new ObjectId(taskId) : taskId;
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    const task = await this.findById(taskObjectId);
    if (!task) return false;
    
    // Chỉ cho phép Member được assign cập nhật status
    if (!task.assignedTo.equals(userObjectId)) {
      throw new Error("Unauthorized: Only assigned member can update status");
    }
    
    const updateData: Partial<Task> = {
      status,
      updatedAt: new Date()
    };
    
    // Auto-set progress based on status
    if (status === 'done') {
      updateData.progress = 100;
      updateData.completedAt = new Date();
    } else if (status === 'in_progress' && task.progress === 0) {
      updateData.progress = 1; // Start with minimal progress
    }
    
    const result = await collection.updateOne(
      { _id: taskObjectId },
      { $set: updateData }
    );
    
    if (result.modifiedCount > 0) {
      // Update project progress
      await ProjectModel.updateProgress(task.project);
      
      // Log activity
      await UserModel.logActivity(userObjectId, 'update_status', 'task', taskObjectId, {
        newStatus: status,
        oldStatus: task.status
      });
    }
    
    return result.modifiedCount > 0;
  }
  
  // Get task statistics
  static async getTaskStats(filters: {
    project?: string;
    assignedTo?: string;
    createdBy?: string;
  } = {}): Promise<{
    total: number;
    todo: number;
    inProgress: number;
    review: number;
    done: number;
    overdue: number;
    averageProgress: number;
  }> {
    const collection = await getTasksCollection();
    
    const query: any = { isActive: true };
    if (filters.project) query.project = new ObjectId(filters.project);
    if (filters.assignedTo) query.assignedTo = new ObjectId(filters.assignedTo);
    if (filters.createdBy) query.createdBy = new ObjectId(filters.createdBy);
    
    const [
      total,
      todo,
      inProgress,
      review,
      done,
      overdue,
      allTasks
    ] = await Promise.all([
      collection.countDocuments(query),
      collection.countDocuments({ ...query, status: 'todo' }),
      collection.countDocuments({ ...query, status: 'in_progress' }),
      collection.countDocuments({ ...query, status: 'review' }),
      collection.countDocuments({ ...query, status: 'done' }),
      collection.countDocuments({
        ...query,
        dueDate: { $lt: new Date() },
        status: { $ne: 'done' as TaskStatus }
      }),
      collection.find(query, { projection: { progress: 1 } }).toArray()
    ]);
    
    const averageProgress = allTasks.length > 0 
      ? Math.round(allTasks.reduce((sum, task) => sum + task.progress, 0) / allTasks.length)
      : 0;
    
    return {
      total,
      todo,
      inProgress,
      review,
      done,
      overdue,
      averageProgress
    };
  }
  
  // Add comment to task
  static async addComment(taskId: string | ObjectId, content: string, authorId: string | ObjectId): Promise<boolean> {
    const collection = await getTasksCollection();
    const taskObjectId = typeof taskId === 'string' ? new ObjectId(taskId) : taskId;
    const authorObjectId = typeof authorId === 'string' ? new ObjectId(authorId) : authorId;
    
    const comment = {
      _id: new ObjectId(),
      content,
      author: authorObjectId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.updateOne(
      { _id: taskObjectId },
      { 
        $push: { comments: comment },
        $set: { updatedAt: new Date() }
      }
    );
    
    if (result.modifiedCount > 0) {
      // Log activity
      await UserModel.logActivity(authorObjectId, 'add_comment', 'task', taskObjectId, {
        comment: content
      });
    }
    
    return result.modifiedCount > 0;
  }
  
  // Get overdue tasks
  static async getOverdueTasks(): Promise<Task[]> {
    const collection = await getTasksCollection();
    
    return await collection.find({
      isActive: true,
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' as TaskStatus }
    }).sort({ dueDate: 1 }).toArray();
  }
}