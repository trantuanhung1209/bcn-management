import { NextResponse } from 'next/server';
import { UserModel } from '@/models/User';
import { TeamModel } from '@/models/Team';
import { UserRole } from '@/types';

export async function POST() {
  try {
    // Tạo users mẫu
    const users = [
      {
        email: 'leader.web@bcn.com',
        password: 'leader123',
        firstName: 'Nguyễn',
        lastName: 'Văn A',
        role: UserRole.TEAM_LEADER,
        department: 'Web Development',
        gender: 'Nam' as const,
        birthday: '2001-03-15',
        studentId: 'SV001',
        academicYear: 'K20',
        field: 'Web' as const,
        teams: [],
        projects: [],
        isActive: true,
        isUP: true
      },
      {
        email: 'leader.app@bcn.com',
        password: 'leader123',
        firstName: 'Phạm',
        lastName: 'Thị D',
        role: UserRole.TEAM_LEADER,
        department: 'Mobile Development',
        gender: 'Nữ' as const,
        birthday: '2000-12-05',
        studentId: 'SV004',
        academicYear: 'K19',
        field: 'App' as const,
        teams: [],
        projects: [],
        isActive: true
      },
      {
        email: 'member1@bcn.com',
        password: 'member123',
        firstName: 'Trần',
        lastName: 'Thị B',
        role: UserRole.MEMBER,
        department: 'Web Development',
        gender: 'Nữ' as const,
        birthday: '2002-07-22',
        studentId: 'SV002',
        academicYear: 'K21',
        field: 'Web' as const,
        teams: [],
        projects: [],
        isActive: true
      },
      {
        email: 'member2@bcn.com',
        password: 'member123',
        firstName: 'Lê',
        lastName: 'Văn C',
        role: UserRole.MEMBER,
        department: 'Web Development',
        gender: 'Nam' as const,
        birthday: '2001-11-08',
        studentId: 'SV003',
        academicYear: 'K20',
        field: 'Web' as const,
        teams: [],
        projects: [],
        isActive: true
      },
      {
        email: 'member3@bcn.com',
        password: 'member123',
        firstName: 'Hoàng',
        lastName: 'Văn E',
        role: UserRole.MEMBER,
        department: 'Mobile Development',
        gender: 'Nam' as const,
        birthday: '2002-04-18',
        studentId: 'SV005',
        academicYear: 'K21',
        field: 'App' as const,
        teams: [],
        projects: [],
        isActive: true
      }
    ];

    // Tạo users
    const createdUsers = [];
    for (const userData of users) {
      try {
        // Kiểm tra user đã tồn tại chưa
        const existingUser = await UserModel.findByEmail(userData.email);
        if (!existingUser) {
          const newUser = await UserModel.create(userData);
          createdUsers.push(newUser);
        } else {
          createdUsers.push(existingUser);
        }
      } catch (error) {
        console.error(`Error creating user ${userData.email}:`, error);
      }
    }

    // Tìm users để tạo teams
    const webLeader = createdUsers.find(u => u.email === 'leader.web@bcn.com');
    const appLeader = createdUsers.find(u => u.email === 'leader.app@bcn.com');
    const webMember1 = createdUsers.find(u => u.email === 'member1@bcn.com');
    const webMember2 = createdUsers.find(u => u.email === 'member2@bcn.com');
    const appMember = createdUsers.find(u => u.email === 'member3@bcn.com');

    // Tạo teams
    const teams = [];
    
    if (webLeader && webMember1 && webMember2) {
      // Kiểm tra team Web đã tồn tại chưa
      const existingWebTeam = await TeamModel.findByName('Team Web Development');
      if (!existingWebTeam) {
        const webTeam = await TeamModel.create({
          name: 'Team Web Development',
          description: 'Nhóm phát triển ứng dụng web và website',
          teamLeader: webLeader._id!,
          members: [webMember1._id!, webMember2._id!],
          projects: [],
          isActive: true
        });
        teams.push(webTeam);
      }
    }

    if (appLeader && appMember) {
      // Kiểm tra team App đã tồn tại chưa
      const existingAppTeam = await TeamModel.findByName('Team Mobile Development');
      if (!existingAppTeam) {
        const appTeam = await TeamModel.create({
          name: 'Team Mobile Development',
          description: 'Nhóm phát triển ứng dụng di động iOS và Android',
          teamLeader: appLeader._id!,
          members: [appMember._id!],
          projects: [],
          isActive: true
        });
        teams.push(appTeam);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sample data created successfully',
      data: {
        usersCreated: createdUsers.length,
        teamsCreated: teams.length
      }
    });

  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to seed data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}