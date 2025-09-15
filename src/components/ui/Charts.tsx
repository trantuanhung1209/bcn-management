'use client';

import React from 'react';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
}

export function ProgressRing({ 
  progress, 
  size = 100, 
  strokeWidth = 8, 
  color = '#3B82F6',
  backgroundColor = '#E5E7EB',
  label 
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800">{progress}%</div>
          {label && <div className="text-xs text-gray-600">{label}</div>}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export function StatCard({ title, value, icon, trend, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    red: 'border-red-200 bg-red-50',
    purple: 'border-purple-200 bg-purple-50'
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${colorClasses[color as keyof typeof colorClasses]} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className={`flex items-center mt-1 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <span>{trend.isPositive ? '↗️' : '↘️'}</span>
              <span className="ml-1">{trend.value}%</span>
            </div>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

interface ProjectStatusChartProps {
  data: {
    planning: number;
    in_progress: number;
    testing: number;
    completed: number;
    on_hold: number;
    cancelled: number;
  };
}

export function ProjectStatusChart({ data }: ProjectStatusChartProps) {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);
  
  const statusConfig = [
    { key: 'completed', label: 'Hoàn thành', color: '#10B981', icon: '✅' },
    { key: 'in_progress', label: 'Đang thực hiện', color: '#3B82F6', icon: '🚀' },
    { key: 'testing', label: 'Đang test', color: '#8B5CF6', icon: '🧪' },
    { key: 'planning', label: 'Lên kế hoạch', color: '#F59E0B', icon: '📋' },
    { key: 'on_hold', label: 'Tạm dừng', color: '#6B7280', icon: '⏸️' },
    { key: 'cancelled', label: 'Đã hủy', color: '#EF4444', icon: '❌' }
  ];

  return (
    <div className="space-y-4">
      {/* Bar Chart */}
      <div className="space-y-3">
        {statusConfig.map(status => {
          const count = data[status.key as keyof typeof data];
          const percentage = total > 0 ? (count / total) * 100 : 0;
          
          return (
            <div key={status.key} className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 w-32">
                <span>{status.icon}</span>
                <span className="text-sm text-gray-600">{status.label}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: status.color
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="w-12 text-right">
                <span className="text-sm font-medium text-gray-800">{count}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {total === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-500">Chưa có dự án nào</p>
        </div>
      )}
    </div>
  );
}

interface TeamPerformanceProps {
  teamStats: {
    memberCount: number;
    projectCount: number;
    completedProjects: number;
    activeProjects: number;
    projectProgress: number;
  };
}

export function TeamPerformance({ teamStats }: TeamPerformanceProps) {
  const completionRate = teamStats.projectCount > 0 
    ? Math.round((teamStats.completedProjects / teamStats.projectCount) * 100)
    : 0;

  const activeRate = teamStats.projectCount > 0 
    ? Math.round((teamStats.activeProjects / teamStats.projectCount) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Overall Progress */}
      <div className="text-center">
        <ProgressRing 
          progress={teamStats.projectProgress} 
          size={120}
          color="#10B981"
          label="Tiến độ chung"
        />
        <p className="mt-2 text-sm text-gray-600">Tiến độ trung bình các dự án</p>
      </div>
      
      {/* Completion Rate */}
      <div className="text-center">
        <ProgressRing 
          progress={completionRate} 
          size={120}
          color="#3B82F6"
          label="Tỷ lệ hoàn thành"
        />
        <p className="mt-2 text-sm text-gray-600">
          {teamStats.completedProjects}/{teamStats.projectCount} dự án
        </p>
      </div>
      
      {/* Active Projects Rate */}
      <div className="text-center">
        <ProgressRing 
          progress={activeRate} 
          size={120}
          color="#F59E0B"
          label="Dự án đang chạy"
        />
        <p className="mt-2 text-sm text-gray-600">
          {teamStats.activeProjects} dự án đang hoạt động
        </p>
      </div>
    </div>
  );
}