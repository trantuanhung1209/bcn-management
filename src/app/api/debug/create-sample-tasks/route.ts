import { NextResponse } from 'next/server';
import { TaskModel } from '@/models/Task';
import { UserModel } from '@/models/User';
import { ProjectModel } from '@/models/Project';
import { TeamModel } from '@/models/Team';
import { TaskStatus, TaskPriority, UserRole } from '@/types';

export async function POST() {
  try {
    console.log('🚀 Creating sample tasks for testing...');

    // Find all members
    const members = await UserModel.findByRole(UserRole.MEMBER);
    console.log('👥 Found members:', members.length);

    if (members.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No members found. Please create some members first.'
      });
    }

    // Get first member
    const member = members[0];
    console.log('👤 Using member:', member.email);

    // Find or create a project for this member
    let projects = await ProjectModel.findAll({ assignedTo: member._id!.toString(), limit: 1 });
    
    if (projects.projects.length === 0) {
      // Create a sample project if none exists
      const teams = await TeamModel.findAll({ limit: 1 });
      if (teams.teams.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No teams found. Please create a team first.'
        });
      }

      const sampleProject = await ProjectModel.create({
        name: 'Sample Project for Testing',
        description: 'A project created for testing member dashboard',
        status: 'in_progress' as any,
        priority: TaskPriority.MEDIUM,
        team: teams.teams[0]._id!,
        assignedTo: [member._id!],
        startDate: new Date(),
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        progress: 0,
        tags: ['test'],
        attachments: [],
        isActive: true,
        isAssigned: true,
        createdBy: member._id!
      });
      projects = { projects: [sampleProject], total: 1 };
    }

    const project = projects.projects[0];

    // Create sample tasks with different statuses
    const sampleTasks = [
      {
        title: 'Setup Authentication System',
        description: 'Implement user login and registration',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        progress: 0
      },
      {
        title: 'Design Database Schema',
        description: 'Create database tables and relationships',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.URGENT,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
        progress: 45
      },
      {
        title: 'Create API Endpoints',
        description: 'Build REST API for the application',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        progress: 0
      },
      {
        title: 'Implement Frontend Components',
        description: 'Build React components for UI',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.LOW,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
        progress: 20
      },
      {
        title: 'Write Unit Tests',
        description: 'Create comprehensive test suite',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
        progress: 0
      }
    ];

    const createdTasks = [];

    for (const taskData of sampleTasks) {
      const task = await TaskModel.create({
        ...taskData,
        project: project._id!,
        assignedTo: member._id!,
        createdBy: member._id!, // In real scenario, this would be team leader
        tags: ['sample', 'test'],
        comments: [],
        attachments: [],
        dependencies: [],
        isActive: true
      });
      
      createdTasks.push(task);
      console.log('✅ Created task:', task.title);
    }

    console.log('🎉 Sample tasks created successfully!');

    return NextResponse.json({
      success: true,
      data: {
        member: {
          id: member._id?.toString(),
          email: member.email,
          name: `${member.firstName} ${member.lastName}`
        },
        project: {
          id: project._id?.toString(),
          name: project.name
        },
        tasks: createdTasks.map(task => ({
          id: task._id?.toString(),
          title: task.title,
          status: task.status,
          priority: task.priority,
          progress: task.progress,
          dueDate: task.dueDate
        }))
      },
      message: `Successfully created ${createdTasks.length} sample tasks for testing!`
    });

  } catch (error) {
    console.error('❌ Error creating sample tasks:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create sample tasks' 
      },
      { status: 500 }
    );
  }
}