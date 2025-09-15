"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { apiRequest } from "@/lib/client-utils";

interface Project {
  id: string;
  name: string;
  description: string;
  status:
    | "planning"
    | "in_progress"
    | "testing"
    | "completed"
    | "on_hold"
    | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  progress: number;
  startDate: string;
  endDate?: string;
  team: string;
  teamName: string;
  assignedMembers: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  tags: string[];
  coins: number;
  totalTasks: number;
  completedTasks: number;
  isAssigned: boolean;
  manager?: string;
  managerName?: string;
  assignedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
}

interface Team {
  id: string;
  name: string;
  leader: string;
}

// Priority Badge Component
const PriorityBadge: React.FC<{
  priority: "low" | "medium" | "high" | "urgent";
}> = ({ priority }) => {
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200/60";
      case "medium":
        return "bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200/60";
      case "high":
        return "bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 border-orange-200/60";
      case "urgent":
        return "bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200/60";
      default:
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200/60";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "low":
        return "🟢";
      case "medium":
        return "🟡";
      case "high":
        return "🟠";
      case "urgent":
        return "�";
      default:
        return "⚪";
    }
  };

  return (
    <span
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1 ${getPriorityStyle(
        priority
      )}`}
    >
      <span className="text-xs">{getPriorityIcon(priority)}</span>
    </span>
  );
};

// Status Badge Component
const StatusBadge: React.FC<{
  status:
    | "planning"
    | "in_progress"
    | "testing"
    | "completed"
    | "on_hold"
    | "cancelled";
}> = ({ status }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200/60";
      case "in_progress":
        return "bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200/60";
      case "testing":
        return "bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border-purple-200/60";
      case "completed":
        return "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200/60";
      case "on_hold":
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200/60";
      case "cancelled":
        return "bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200/60";
      default:
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200/60";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "planning":
        return "Lên kế hoạch";
      case "in_progress":
        return "Đang thực hiện";
      case "testing":
        return "Đang kiểm thử";
      case "completed":
        return "Hoàn thành";
      case "on_hold":
        return "Tạm dừng";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "planning":
        return "📋";
      case "in_progress":
        return "⚡";
      case "testing":
        return "🧪";
      case "completed":
        return "✅";
      case "on_hold":
        return "⏸️";
      case "cancelled":
        return "❌";
      default:
        return "📄";
    }
  };

  return (
    <span
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusStyle(
        status
      )}`}
    >
      <span className="text-xs">{getStatusIcon(status)}</span>
      {getStatusText(status)}
    </span>
  );
};

// Assignment Status Badge
const AssignmentStatusBadge = ({ project }: { project: Project }) => {
  const getAssignmentStatus = () => {
    if (project.rejectedAt) {
      return {
        status: "rejected",
        text: "Đã từ chối",
        color:
          "bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200/60",
        icon: "❌",
      };
    }
    if (project.acceptedAt) {
      return {
        status: "accepted",
        text: "Đã chấp nhận",
        color:
          "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200/60",
        icon: "✅",
      };
    }
    if (project.assignedAt || !project.isAssigned) {
      return {
        status: "pending",
        text: "Chờ phê duyệt",
        color:
          "bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200/60",
        icon: "⏳",
      };
    }
    return {
      status: "unknown",
      text: "Không rõ",
      color:
        "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200/60",
      icon: "❓",
    };
  };

  const assignmentStatus = getAssignmentStatus();

  return (
    <span
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1 ${assignmentStatus.color}`}
    >
      <span className="text-xs">{assignmentStatus.icon}</span>
      {assignmentStatus.text}
    </span>
  );
};

export default function TeamLeaderProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNoTeam, setHasNoTeam] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAssignment, setFilterAssignment] = useState("all");

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 9; // 3x3 grid

  // Fetch team leader's projects
  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();

      if (filterAssignment !== "all") params.append("status", filterAssignment);
      if (searchTerm) params.append("search", searchTerm);

      console.log(
        "Fetching projects with URL:",
        `/api/team_leader/projects?${params.toString()}`
      );
      const response = await apiRequest(
        `/api/team_leader/projects?${params.toString()}`
      );
      const result = await response.json();

      console.log("API Response:", result);

      if (result.success) {
        // Transform API data to match component interface
        const transformedProjects = result.data.projects.map(
          (project: any) => ({
            id: project._id,
            name: project.name,
            description: project.description,
            status: project.status,
            priority: project.priority,
            progress: project.progress || 0,
            startDate: project.startDate.split("T")[0],
            endDate: project.endDate?.split("T")[0] || "",
            team: project.team,
            teamName: result.data.team.name,
            assignedMembers:
              project.assignedTo?.map((userId: string, index: number) => ({
                id: userId,
                name: `User ${index + 1}`,
                role: "Member",
              })) || [],
            tags: project.tags || [],
            coins: project.coins,
            totalTasks: 0,
            completedTasks: 0,
            isAssigned: project.isAssigned || false,
            manager: project.manager,
            managerName: project.manager ? "Manager Name" : undefined,
            assignedAt: project.assignedAt,
            acceptedAt: project.acceptedAt,
            rejectedAt: project.rejectedAt,
          })
        );

        console.log("Transformed projects:", transformedProjects);
        setProjects(transformedProjects);
        setTeam(result.data.team);
        setHasNoTeam(false);
      } else {
        console.error("API Error:", result.error);
        // Handle specific error for no team assigned
        if (result.code === "NO_TEAM_ASSIGNED") {
          setHasNoTeam(true);
          setProjects([]);
          setTeam(null);
        } else {
          alert(result.error || "Failed to fetch projects");
        }
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filterAssignment, searchTerm]);

  // Handle project accept/reject
  const handleProjectAction = async (
    projectId: string,
    action: "accept" | "reject"
  ) => {
    try {
      const response = await apiRequest(
        `/api/team_leader/projects/${projectId}`,
        {
          method: "PUT",
          body: JSON.stringify({ action }),
        }
      );

      const result = await response.json();

      if (result.success) {
        // Refresh projects list
        fetchProjects();
      } else {
        alert(result.error || "Failed to update project");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update project");
    }
  };

  // Handle project permanent delete
  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  // Confirm project permanent delete
  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      const response = await apiRequest(
        `/api/team_leader/projects/${projectToDelete.id}/permanent-delete`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        setIsDeleteModalOpen(false);
        setProjectToDelete(null);

        // Refresh projects list
        fetchProjects();
        alert(
          `Project "${projectToDelete.name}" đã được xóa vĩnh viễn khỏi database!`
        );
      } else {
        alert(result.error || "Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project");
    }
  };

  // Filter projects client-side
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesStatus =
        filterStatus === "all" || project.status === filterStatus;
      const matchesAssignment =
        filterAssignment === "all" ||
        (filterAssignment === "pending" &&
          !project.acceptedAt &&
          !project.rejectedAt) ||
        (filterAssignment === "accepted" && project.acceptedAt) ||
        (filterAssignment === "rejected" && project.rejectedAt);
      const matchesSearch =
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

      return matchesStatus && matchesAssignment && matchesSearch;
    });
  }, [projects, filterStatus, filterAssignment, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterAssignment, searchTerm]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Show no team assigned message
  if (hasNoTeam) {
    return (
      <MainLayout userRole="team_leader">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-md w-full mx-auto text-center">
            <div className="section-neumorphic bg-white rounded-3xl p-8 border border-blue-100/50">
              {/* Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Chưa được phân công Team
              </h2>

              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                Bạn chưa được gán làm team leader của team nào. Để có thể quản
                lý projects, bạn cần được admin phân công vào một team.
              </p>

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/team_leader/dashboard")}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Về Dashboard
                </button>

                <button
                  onClick={() =>
                    (window.location.href =
                      "mailto:admin@company.com?subject=Yêu cầu phân công Team Leader")
                  }
                  className="w-full py-3 px-6 rounded-xl bg-white border-2 border-blue-200 text-blue-700 font-medium hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Liên hệ Admin
                </button>
              </div>

              {/* Info note */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">
                      Lưu ý:
                    </p>
                    <p className="text-sm text-blue-700">
                      Sau khi được phân công, bạn sẽ có thể xem và quản lý tất
                      cả projects được gán cho team của mình.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout userRole="team_leader">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="team_leader">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
              Quản lý Projects Team Mobile Development
            </h1>
            {team && (
              <p className="text-[var(--color-text-secondary)] mt-1">
                Quản lý các dự án được gán cho team{" "}
                <span className="font-semibold text-[var(--color-accent)]">
                  {team.name}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="section-neumorphic p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input text-sm"
                placeholder="Tìm theo tên, mô tả, tag..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Trạng thái Project
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="planning">Lên kế hoạch</option>
                <option value="in_progress">Đang thực hiện</option>
                <option value="testing">Đang kiểm thử</option>
                <option value="completed">Hoàn thành</option>
                <option value="on_hold">Tạm dừng</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Trạng thái phê duyệt
              </label>
              <select
                value={filterAssignment}
                onChange={(e) => setFilterAssignment(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 neumorphic-input"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ phê duyệt</option>
                <option value="accepted">Đã chấp nhận</option>
                <option value="rejected">Đã từ chối</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterStatus("all");
                  setFilterAssignment("all");
                  setSearchTerm("");
                }}
                className="w-full py-2 px-3 text-sm rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải projects...</p>
            </div>
          </div>
        ) : currentProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-gray-100/50 section-neumorphic">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không có project nào
            </h3>
            <p className="text-gray-500">
              {projects.length === 0
                ? "Chưa có project nào được gán cho team của bạn."
                : "Không có project nào phù hợp với bộ lọc hiện tại."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {currentProjects.map((project) => (
              <div key={project.id} className="relative group">
                {/* Main Card - Compact Version */}
                <div
                  className={`section-neumorphic bg-white rounded-2xl border border-gray-100/50 hover:border-blue-200/60 transition-all duration-500 overflow-hidden hover:shadow-xl hover:shadow-blue-100/20 transform hover:-translate-y-1 ${
                    project.acceptedAt ? "cursor-pointer" : "cursor-default"
                  }`}
                  onClick={() => {
                    // Only navigate if project is accepted
                    if (project.acceptedAt) {
                      router.push(`/team_leader/projects/${project.id}`);
                    }
                  }}
                >
                  {/* Small Delete Button for Rejected Projects - Top Right Corner */}
                  {project.rejectedAt && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        handleDeleteProject(project);
                      }}
                      className="absolute top-3 right-3 z-20 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                      title="Xóa vĩnh viễn project này khỏi database"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}

                  {/* Status Header - Smaller */}
                  <div className="relative">
                    <div
                      className={`h-1.5 w-full ${
                        project.status === "completed"
                          ? "bg-gradient-to-r from-green-400 to-emerald-500"
                          : project.status === "in_progress"
                          ? "bg-gradient-to-r from-blue-400 to-cyan-500"
                          : project.status === "testing"
                          ? "bg-gradient-to-r from-purple-400 to-indigo-500"
                          : project.status === "on_hold"
                          ? "bg-gradient-to-r from-gray-400 to-gray-500"
                          : project.status === "cancelled"
                          ? "bg-gradient-to-r from-red-400 to-red-500"
                          : "bg-gradient-to-r from-yellow-400 to-orange-500"
                      }`}
                    />

                    {/* Header Content - Compact */}
                    <div className="p-4 pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          {/* Project Title & Badges */}
                          <div className="flex items-start gap-2 mb-1.5">
                            <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors duration-300 flex-1 min-w-0 line-clamp-1">
                              {project.name}
                            </h3>
                            {project.rejectedAt ? (
                              " "
                            ) :
                            (
                              <div className="flex gap-1 flex-shrink-0">
                                <PriorityBadge priority={project.priority} />
                                {project.acceptedAt && (
                                  <span
                                    className="px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200/60 flex items-center gap-1"
                                    title="Click để quản lý tasks"
                                  >
                                    <svg
                                      className="w-3 h-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <span>Quản lý</span>
                                  </span>
                                )}
                              </div>
                            )  
                          }
                          </div>

                          {/* Team Info */}
                          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="font-medium truncate">
                              {project.teamName}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Body - Compact */}
                  <div className="px-4">
                    {/* Description */}
                    <p className="text-gray-600 text-xs mb-4 line-clamp-2 leading-relaxed">
                      Mô tả: {project.description}
                    </p>

                    {/* Assignment Status */}
                    <div className="flex items-center justify-between mb-4">
                      <AssignmentStatusBadge project={project} />
                      <StatusBadge status={project.status} />
                    </div>

                    {/* Progress Section */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                          <svg
                            className="w-3 h-3 text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Tiến độ
                        </span>
                        <span className="text-xs font-bold text-gray-800">
                          {project.progress}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative">
                        <div className="w-full bg-gray-100 rounded-full h-2 shadow-inner">
                          <div
                            className={`h-2 rounded-full transition-all duration-700 ease-out shadow-sm ${
                              project.progress >= 80
                                ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                : project.progress >= 50
                                ? "bg-gradient-to-r from-blue-400 to-cyan-500"
                                : project.progress >= 20
                                ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                                : "bg-gradient-to-r from-gray-300 to-gray-400"
                            }`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid - Compact */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="text-center p-2.5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100/50">
                        <div className="text-lg font-bold text-blue-600 mb-0.5">
                          {project.totalTasks}
                        </div>
                        <div className="text-xs text-blue-500 font-medium uppercase tracking-wide">
                          Tasks
                        </div>
                      </div>
                      <div className="text-center p-2.5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100/50">
                        <div className="text-lg font-bold text-green-600 mb-0.5">
                          {project.completedTasks}
                        </div>
                        <div className="text-xs text-green-500 font-medium uppercase tracking-wide">
                          Hoàn thành
                        </div>
                      </div>
                    </div>

                    {/* Tags - Compact */}
                    {project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {project.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-md text-xs font-semibold border border-blue-200/50"
                          >
                            #{tag}
                          </span>
                        ))}
                        {project.tags.length > 2 && (
                          <span className="px-2 py-1 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 rounded-md text-xs font-semibold border border-gray-200/50">
                            +{project.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {!project.acceptedAt && !project.rejectedAt && (
                    <div className="px-4 py-3 bg-gradient-to-r from-gray-50/50 to-gray-100/30 border-t border-gray-100/80">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleProjectAction(project.id, "accept")
                          }
                          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-1"
                        >
                          <span>✅</span>
                          <span>Chấp nhận</span>
                        </button>
                        <button
                          onClick={() =>
                            handleProjectAction(project.id, "reject")
                          }
                          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-1"
                        >
                          <span>❌</span>
                          <span>Từ chối</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Footer - Compact */}
                  <div className="px-4 py-3 bg-gradient-to-r from-gray-50/50 to-gray-100/30 border-t border-gray-100/80">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-xs font-medium">
                          {project.endDate
                            ? new Date(project.endDate).toLocaleDateString(
                                "vi-VN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                }
                              )
                            : "Chưa xác định"}
                        </span>
                      </div>

                      {project.coins && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-full border border-yellow-200/50">
                          <svg
                            className="w-3 h-3 text-yellow-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-xs font-bold text-yellow-700">
                            {project.coins}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Assignment Info */}
                    {(project.acceptedAt || project.rejectedAt) && (
                      <div className="mt-2 pt-2 border-t border-gray-200/50">
                        <p className="text-xs text-gray-500">
                          {project.acceptedAt &&
                            `Đã chấp nhận: ${new Date(
                              project.acceptedAt
                            ).toLocaleDateString("vi-VN")}`}
                          {project.rejectedAt &&
                            `Đã từ chối: ${new Date(
                              project.rejectedAt
                            ).toLocaleDateString("vi-VN")}`}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-8 space-x-3">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 shadow-sm"
              }`}
            >
              ← Trước
            </button>

            {/* Page Numbers */}
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  // Show first, last, current, and pages around current
                  const showPage =
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1);

                  const showEllipsis =
                    (page === 2 && currentPage > 4) ||
                    (page === totalPages - 1 && currentPage < totalPages - 3);

                  if (!showPage && !showEllipsis) return null;

                  if (showEllipsis) {
                    return (
                      <span
                        key={`ellipsis-${page}`}
                        className="px-3 py-2 text-gray-400 text-sm"
                      >
                        ...
                      </span>
                    );
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentPage === page
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-200/50 scale-105"
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 shadow-sm hover:scale-105"
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 shadow-sm"
              }`}
            >
              Tiếp →
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && projectToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                Xác nhận xóa vĩnh viễn
              </h3>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-red-800">
                    Project sẽ bị xóa vĩnh viễn
                  </h4>
                  <p className="text-sm text-red-600">
                    &ldquo;{projectToDelete.name}&rdquo;
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>
                    Project sẽ bị <strong>xóa hoàn toàn</strong> khỏi database
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>
                    Tất cả <strong>tasks liên quan</strong> cũng sẽ bị xóa
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>
                    Hành động này <strong>không thể hoàn tác</strong>
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-yellow-600 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-yellow-800 font-medium">
                    Chỉ project đã bị từ chối mới có thể xóa vĩnh viễn
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200"
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteProject}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
