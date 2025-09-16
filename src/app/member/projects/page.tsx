'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ProjectStatus, TaskPriority, Project } from '@/types';
import MainLayout from '@/components/layout/MainLayout';

interface FilterState {
  search: string;
  status: ProjectStatus | '';
  priority: TaskPriority | '';
  page: number;
}

export default function MemberProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    priority: '',
    page: 1
  });

  // Temporary filters for real-time input
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: ProjectStatus.PLANNING, label: 'Đang lên kế hoạch' },
    { value: ProjectStatus.IN_PROGRESS, label: 'Đang thực hiện' },
    { value: ProjectStatus.TESTING, label: 'Đang kiểm thử' },
    { value: ProjectStatus.COMPLETED, label: 'Đã hoàn thành' },
    { value: ProjectStatus.ON_HOLD, label: 'Tạm dừng' },
    { value: ProjectStatus.CANCELLED, label: 'Đã hủy' }
  ];

  const priorityOptions = [
    { value: '', label: 'Tất cả mức độ' },
    { value: TaskPriority.LOW, label: 'Thấp' },
    { value: TaskPriority.MEDIUM, label: 'Trung bình' },
    { value: TaskPriority.HIGH, label: 'Cao' },
    { value: TaskPriority.URGENT, label: 'Khẩn cấp' }
  ];

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      params.append('page', filters.page.toString());
      params.append('limit', '12');
      params.append('isActive', 'true');

      const response = await fetch(`/api/projects?${params}`);
      const data = await response.json();

      if (data.success) {
        setProjects(data.data.projects);
        setTotal(data.data.total);
      } else {
        setError(data.error || 'Không thể tải danh sách dự án');
      }
    } catch (err) {
      setError('Lỗi kết nối mạng');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProjects();
  }, [filters, fetchProjects]);

  const handleSearch = () => {
    setFilters({ ...tempFilters, page: 1 });
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      status: '' as ProjectStatus | '',
      priority: '' as TaskPriority | '',
      page: 1
    };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
  };

  const getStatusBadge = (status: ProjectStatus) => {
    const statusConfig = {
      [ProjectStatus.PLANNING]: { 
        label: 'Đang lên kế hoạch', 
        className: 'bg-blue-100 text-blue-800' 
      },
      [ProjectStatus.IN_PROGRESS]: { 
        label: 'Đang thực hiện', 
        className: 'bg-yellow-100 text-yellow-800' 
      },
      [ProjectStatus.TESTING]: { 
        label: 'Đang kiểm thử', 
        className: 'bg-purple-100 text-purple-800' 
      },
      [ProjectStatus.COMPLETED]: { 
        label: 'Đã hoàn thành', 
        className: 'bg-green-100 text-green-800' 
      },
      [ProjectStatus.ON_HOLD]: { 
        label: 'Tạm dừng', 
        className: 'bg-orange-100 text-orange-800' 
      },
      [ProjectStatus.CANCELLED]: { 
        label: 'Đã hủy', 
        className: 'bg-red-100 text-red-800' 
      }
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    const priorityConfig = {
      [TaskPriority.LOW]: { 
        label: 'Thấp', 
        className: 'bg-gray-100 text-gray-800' 
      },
      [TaskPriority.MEDIUM]: { 
        label: 'Trung bình', 
        className: 'bg-blue-100 text-blue-800' 
      },
      [TaskPriority.HIGH]: { 
        label: 'Cao', 
        className: 'bg-orange-100 text-orange-800' 
      },
      [TaskPriority.URGENT]: { 
        label: 'Khẩn cấp', 
        className: 'bg-red-100 text-red-800' 
      }
    };

    const config = priorityConfig[priority];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Chưa có';
    try {
      return new Date(date).toLocaleDateString('vi-VN');
    } catch {
      return 'Không hợp lệ';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <MainLayout userRole="member">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
              Dự án của tôi
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-1">
              Xem tất cả dự án mà bạn tham gia
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Tổng: {total} dự án
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Tìm kiếm dự án..."
                value={tempFilters.search}
                onChange={(e) => setTempFilters(prev => ({ ...prev, search: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              
              <Select
                options={statusOptions}
                value={tempFilters.status}
                onChange={(e) => setTempFilters(prev => ({ ...prev, status: e.target.value as ProjectStatus | '' }))}
              />
              
              <Select
                options={priorityOptions}
                value={tempFilters.priority}
                onChange={(e) => setTempFilters(prev => ({ ...prev, priority: e.target.value as TaskPriority | '' }))}
              />
              
              <div className="flex gap-2">
                <Button onClick={handleSearch} className="flex-1">
                  Tìm kiếm
                </Button>
                <Button variant="secondary" onClick={handleReset}>
                  Đặt lại
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Đang tải...</span>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && !error && (
          <>
            {projects.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">📁</div>
                  <p className="text-gray-600">Không tìm thấy dự án nào</p>
                  <Button variant="secondary" onClick={handleReset} className="mt-4">
                    Xem tất cả dự án
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <Card key={project._id?.toString()} hover className="h-full">
                    <CardContent className="p-6 h-full flex flex-col">
                      {/* Project Header */}
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-lg text-gray-800 line-clamp-2 flex-1">
                          {project.name}
                        </h3>
                      </div>

                      {/* Status and Priority */}
                      <div className="flex gap-2 mb-3">
                        {getStatusBadge(project.status)}
                        {getPriorityBadge(project.priority)}
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                        {project.description}
                      </p>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Tiến độ</span>
                          <span className="text-sm font-medium text-gray-800">
                            {project.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Bắt đầu:</span>
                          <span className="text-gray-700">
                            {formatDate(project.startDate)}
                          </span>
                        </div>
                        {project.deadline && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Deadline:</span>
                            <span className={`font-medium ${
                              new Date(project.deadline) < new Date() 
                                ? 'text-red-600' 
                                : 'text-gray-700'
                            }`}>
                              {formatDate(project.deadline)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      {project.tags && project.tags.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex flex-wrap gap-1">
                            {project.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                              >
                                {tag}
                              </span>
                            ))}
                            {project.tags.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                                +{project.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Card>
                <CardContent className="flex justify-center items-center space-x-2 py-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                  >
                    Trước
                  </Button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === totalPages || 
                        Math.abs(page - filters.page) <= 2
                      )
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <Button
                            variant={page === filters.page ? "primary" : "secondary"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="min-w-[40px]"
                          >
                            {page}
                          </Button>
                        </div>
                      ))
                    }
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page === totalPages}
                  >
                    Sau
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
