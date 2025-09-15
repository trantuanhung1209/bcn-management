import { UserModel } from '@/models/User';
import { TeamModel } from '@/models/Team';
import { getProjectsCollection } from '@/lib/mongodb';
import { UserRole, ProjectStatus, TaskPriority } from '@/types';

export async function seedSampleData() {
  try {
    console.log('Seeding sample data...');

    // Create sample users với nhiều teams khác nhau
    const sampleUsers = [
      // Admin
      {
        email: 'admin@example.com',
        password: 'hashed_password',
        firstName: 'Admin',
        lastName: 'System',
        role: UserRole.ADMIN,
        phone: '0123456888',
        department: 'IT',
        gender: 'Nam' as const,
        birthday: '1985-01-01',
        studentId: 'AD001',
        academicYear: 'K18',
        field: 'Web' as const,
        teams: [],
        projects: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Manager Web Development
      {
        email: 'manager.web@example.com',
        password: 'hashed_password',
        firstName: 'Nguyễn',
        lastName: 'Quản Lý Web',
        role: UserRole.MANAGER,
        phone: '0123456789',
        department: 'Web Development',
        gender: 'Nam' as const,
        birthday: '1990-01-01',
        studentId: 'MG001',
        academicYear: 'K20',
        field: 'Web' as const,
        teams: [],
        projects: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Manager App Development  
      {
        email: 'manager.app@example.com',
        password: 'hashed_password',
        firstName: 'Trần',
        lastName: 'Quản Lý App',
        role: UserRole.MANAGER,
        phone: '0123456799',
        department: 'App Development',
        gender: 'Nữ' as const,
        birthday: '1991-01-01',
        studentId: 'MG002',
        academicYear: 'K20',
        field: 'App' as const,
        teams: [],
        projects: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Web Team Members
      {
        email: 'dev1.web@example.com',
        password: 'hashed_password',
        firstName: 'Lê',
        lastName: 'Văn Web1',
        role: UserRole.MEMBER,
        phone: '0123456790',
        department: 'Web Development',
        gender: 'Nam' as const,
        birthday: '1995-01-01',
        studentId: 'SV001',
        academicYear: 'K21',
        field: 'Web' as const,
        teams: [],
        projects: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'dev2.web@example.com',
        password: 'hashed_password',
        firstName: 'Phạm',
        lastName: 'Thị Web2',
        role: UserRole.MEMBER,
        phone: '0123456791',
        department: 'Web Development',
        gender: 'Nữ' as const,
        birthday: '1996-01-01',
        studentId: 'SV002',
        academicYear: 'K21',
        field: 'Web' as const,
        teams: [],
        projects: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // App Team Members
      {
        email: 'dev1.app@example.com',
        password: 'hashed_password',
        firstName: 'Võ',
        lastName: 'Văn App1',
        role: UserRole.MEMBER,
        phone: '0123456792',
        department: 'App Development',
        gender: 'Nam' as const,
        birthday: '1995-01-01',
        studentId: 'SV003',
        academicYear: 'K21',
        field: 'App' as const,
        teams: [],
        projects: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'dev2.app@example.com',
        password: 'hashed_password',
        firstName: 'Hoàng',
        lastName: 'Thị App2',
        role: UserRole.MEMBER,
        phone: '0123456793',
        department: 'App Development',
        gender: 'Nữ' as const,
        birthday: '1996-01-01',
        studentId: 'SV004',
        academicYear: 'K21',
        field: 'App' as const,
        teams: [],
        projects: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Check if users already exist
    const existingManager = await UserModel.findByEmail('manager.web@example.com');
    if (existingManager) {
      console.log('Sample data already exists');
      return existingManager._id!.toString();
    }

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      try {
        const user = await UserModel.create(userData);
        createdUsers.push(user);
        console.log(`Created user: ${user.email}`);
      } catch (error) {
        console.error(`Error creating user ${userData.email}:`, error);
      }
    }

    if (createdUsers.length === 0) {
      throw new Error('No users were created');
    }

    const [_admin, webManager, appManager, webDev1, webDev2, appDev1, appDev2] = createdUsers;

    // Create Web Development Team
    const webTeamData = {
      name: 'Web Development Team',
      description: 'Đội phát triển web của BCN',
      teamLeader: webManager._id!,
      members: [webDev1._id!, webDev2._id!],
      projects: [],
      isActive: true
    };

    const webTeam = await TeamModel.create(webTeamData);
    console.log(`Created team: ${webTeam.name}`);

    // Create App Development Team
    const appTeamData = {
      name: 'App Development Team',
      description: 'Đội phát triển ứng dụng mobile của BCN',
      teamLeader: appManager._id!,
      members: [appDev1._id!, appDev2._id!],
      projects: [],
      isActive: true
    };

    const appTeam = await TeamModel.create(appTeamData);
    console.log(`Created team: ${appTeam.name}`);

    // Create sample projects cho Web Team
    const projectsCollection = await getProjectsCollection();
    const webProjects = [
      {
        name: 'E-commerce Platform',
        description: 'Xây dựng nền tảng thương mại điện tử',
        status: ProjectStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        team: webTeam._id!,
        assignedTo: [webDev1._id!, webDev2._id!],
        startDate: new Date(),
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        progress: 75,
        coins: 100,
        tags: ['web', 'ecommerce', 'react'],
        attachments: [],
        isActive: true,
        createdBy: webManager._id!,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Company Website Redesign',
        description: 'Thiết kế lại website công ty',
        status: ProjectStatus.PLANNING,
        priority: TaskPriority.MEDIUM,
        team: webTeam._id!,
        assignedTo: [webDev2._id!],
        startDate: new Date(),
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        progress: 15,
        coins: 80,
        tags: ['web', 'design', 'corporate'],
        attachments: [],
        isActive: true,
        createdBy: webManager._id!,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Create sample projects cho App Team
    const appProjects = [
      {
        name: 'BCN Mobile App',
        description: 'Ứng dụng mobile chính thức của BCN',
        status: ProjectStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        team: appTeam._id!,
        assignedTo: [appDev1._id!, appDev2._id!],
        startDate: new Date(),
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        progress: 40,
        coins: 150,
        tags: ['mobile', 'react-native', 'ios', 'android'],
        attachments: [],
        isActive: true,
        createdBy: appManager._id!,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Event Management App',
        description: 'Ứng dụng quản lý sự kiện',
        status: ProjectStatus.TESTING,
        priority: TaskPriority.MEDIUM,
        team: appTeam._id!,
        assignedTo: [appDev1._id!],
        startDate: new Date(),
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        progress: 85,
        coins: 90,
        tags: ['mobile', 'event', 'management'],
        attachments: [],
        isActive: true,
        createdBy: appManager._id!,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const allProjects = [...webProjects, ...appProjects];
    const createdProjects = await projectsCollection.insertMany(allProjects);
    console.log(`Created ${createdProjects.insertedCount} projects`);

    console.log('Multi-team sample data seeded successfully');
    console.log('Test accounts:');
    console.log('- Admin: admin@example.com');
    console.log('- Web Manager: manager.web@example.com');
    console.log('- App Manager: manager.app@example.com');
    
    return webManager._id!.toString();

  } catch (error) {
    console.error('Error seeding sample data:', error);
    throw error;
  }
}