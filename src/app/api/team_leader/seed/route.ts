import { NextResponse } from 'next/server';
import { UserModel } from '@/models/User';
import { TeamModel } from '@/models/Team';

export async function POST() {
  try {
    console.log('Creating seed data for team leader demo...');

    // Tạo team leader
    const teamLeaderData = {
      email: 'teamleader@test.com',
      password: 'password123',
      firstName: 'Nguyễn',
      lastName: 'Văn Leader',
      role: 'team_leader' as any,
      gender: 'Nam' as const,
      birthday: '1995-01-15',
      studentId: 'TL001',
      academicYear: 'K19',
      field: 'Web' as const,
      teams: [],
      projects: [],
      isActive: true
    };

    const teamLeader = await UserModel.create(teamLeaderData);
    console.log('Team leader created:', teamLeader._id);

    // Tạo một số members
    const membersData = [
      {
        email: 'member1@test.com',
        password: 'password123',
        firstName: 'Trần',
        lastName: 'Thị A',
        role: 'member' as any,
        gender: 'Nữ' as const,
        birthday: '2002-03-20',
        studentId: 'MB001',
        academicYear: 'K21',
        field: 'Web' as const,
        teams: [],
        projects: [],
        isActive: true
      },
      {
        email: 'member2@test.com',
        password: 'password123',
        firstName: 'Lê',
        lastName: 'Văn B',
        role: 'member' as any,
        gender: 'Nam' as const,
        birthday: '2003-07-12',
        studentId: 'MB002',
        academicYear: 'K22',
        field: 'Web' as const,
        teams: [],
        projects: [],
        isActive: true
      }
    ];

    const members = await Promise.all(
      membersData.map(data => UserModel.create(data))
    );
    console.log('Members created:', members.map(m => m._id));

    // Tạo team
    const teamData = {
      name: 'Team Web Development',
      description: 'Nhóm phát triển ứng dụng web và website của BCN',
      teamLeader: teamLeader._id!,
      members: members.map(m => m._id!),
      projects: [],
      isActive: true
    };

    const team = await TeamModel.create(teamData);
    console.log('Team created:', team._id);

    return NextResponse.json({
      success: true,
      message: 'Seed data created successfully',
      data: {
        teamLeader: {
          id: teamLeader._id,
          email: teamLeader.email,
          name: `${teamLeader.firstName} ${teamLeader.lastName}`
        },
        team: {
          id: team._id,
          name: team.name,
          memberCount: team.members.length + 1 // +1 for team leader
        },
        members: members.map(m => ({
          id: m._id,
          email: m.email,
          name: `${m.firstName} ${m.lastName}`
        }))
      }
    });

  } catch (error) {
    console.error('Error creating seed data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create seed data' },
      { status: 500 }
    );
  }
}