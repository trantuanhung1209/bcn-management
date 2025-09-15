import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // 1. Database Health Check
    let databaseHealth: any = {
      status: 'unknown',
      uptime: 0,
      responseTime: 0
    };
    
    try {
      const db = await getDb();
      const dbStartTime = Date.now();
      
      // Test database connection by running a simple command
      await db.admin().ping();
      
      const dbResponseTime = Date.now() - dbStartTime;
      
      // Get database stats
      const stats = await db.stats();
      
      databaseHealth = {
        status: 'healthy',
        uptime: 99.9, // This would ideally come from MongoDB monitoring
        responseTime: dbResponseTime,
        collections: stats.collections || 0,
        dataSize: Math.round((stats.dataSize || 0) / (1024 * 1024)), // Convert to MB
        indexSize: Math.round((stats.indexSize || 0) / (1024 * 1024)) // Convert to MB
      };
    } catch (error) {
      console.error('Database health check failed:', error);
      databaseHealth = {
        status: 'unhealthy',
        uptime: 0,
        responseTime: 0,
        error: 'Connection failed'
      };
    }

    // 2. API Server Health Check
    const apiResponseTime = Date.now() - startTime;
    const apiHealth = {
      status: 'healthy',
      uptime: 100, // Since we're responding, API is up
      responseTime: apiResponseTime,
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    };

    // 3. Storage Health Check (simulated)
    // In a real application, this would check actual disk usage
    const storageHealth = {
      status: 'warning', // Could be 'healthy', 'warning', or 'critical'
      used: 78, // Percentage used
      total: 100, // GB
      available: 22, // GB
      warning: 'Storage usage above 75%'
    };

    // 4. Overall System Status
    const allStatuses = [databaseHealth.status, apiHealth.status, storageHealth.status];
    let overallStatus = 'healthy';
    
    if (allStatuses.includes('unhealthy')) {
      overallStatus = 'unhealthy';
    } else if (allStatuses.includes('warning')) {
      overallStatus = 'warning';
    }

    const systemHealth = {
      overall: {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime() // Server uptime in seconds
      },
      database: databaseHealth,
      api: apiHealth,
      storage: storageHealth
    };

    return NextResponse.json({
      success: true,
      data: systemHealth
    });

  } catch (error) {
    console.error('System health check failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Không thể kiểm tra tình trạng hệ thống',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}