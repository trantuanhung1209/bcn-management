import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const role = searchParams.get('role') || 'member';

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    const db = await getDb();
    const searchResults: any[] = [];

    const searchRegex = new RegExp(query, 'i');

    // Search tasks only
    const tasks = await db.collection('tasks').find({
      $or: [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } }
      ]
    }).limit(20).toArray();

    searchResults.push(...tasks.map(task => ({
      id: task._id,
      type: 'task',
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority
    })));

    // Sort results by relevance (exact title match first)
    searchResults.sort((a, b) => {
      const aExactMatch = a.title.toLowerCase() === query.toLowerCase();
      const bExactMatch = b.title.toLowerCase() === query.toLowerCase();
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      const aStartsWith = a.title.toLowerCase().startsWith(query.toLowerCase());
      const bStartsWith = b.title.toLowerCase().startsWith(query.toLowerCase());
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      return 0;
    });

    // Search in Projects (if role allows)
    if (role === 'admin' || role === 'team_leader') {
      try {
        const projects = await db.collection('projects')
          .find({
            $or: [
              { name: searchRegex },
              { description: searchRegex }
            ]
          })
          .limit(10)
          .toArray();

        for (const project of projects) {
          searchResults.push({
            id: project._id.toString(),
            type: 'project',
            title: project.name,
            name: project.name,
            description: project.description,
            status: project.status
          });
        }
      } catch (error) {
        console.error('Error searching projects:', error);
      }
    }

    // Search in Users (if role allows)
    if (role === 'admin' || role === 'team_leader') {
      try {
        const users = await db.collection('users')
          .find({
            $or: [
              { name: searchRegex },
              { email: searchRegex }
            ]
          })
          .limit(10)
          .toArray();

        for (const user of users) {
          searchResults.push({
            id: user._id.toString(),
            type: 'user',
            title: user.name,
            name: user.name,
            description: user.email,
            status: user.role
          });
        }
      } catch (error) {
        console.error('Error searching users:', error);
      }
    }

    // Search in Teams (if role allows)
    if (role === 'admin' || role === 'team_leader') {
      try {
        const teams = await db.collection('teams')
          .find({
            $or: [
              { name: searchRegex },
              { description: searchRegex }
            ]
          })
          .limit(10)
          .toArray();

        for (const team of teams) {
          searchResults.push({
            id: team._id.toString(),
            type: 'team',
            title: team.name,
            name: team.name,
            description: team.description,
            status: `${team.members?.length || 0} members`
          });
        }
      } catch (error) {
        console.error('Error searching teams:', error);
      }
    }

    // Sort results by relevance (exact matches first, then partial matches)
    const sortedResults = searchResults.sort((a, b) => {
      const aTitle = (a.title || '').toLowerCase();
      const bTitle = (b.title || '').toLowerCase();
      const queryLower = query.toLowerCase();
      
      // Exact matches first
      if (aTitle === queryLower && bTitle !== queryLower) return -1;
      if (bTitle === queryLower && aTitle !== queryLower) return 1;
      
      // Starts with query
      if (aTitle.startsWith(queryLower) && !bTitle.startsWith(queryLower)) return -1;
      if (bTitle.startsWith(queryLower) && !aTitle.startsWith(queryLower)) return 1;
      
      // Alphabetical order
      return aTitle.localeCompare(bTitle);
    });

    return NextResponse.json({
      success: true,
      data: sortedResults.slice(0, 20) // Limit to 20 results
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}