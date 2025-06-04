import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import "react-loading-skeleton/dist/skeleton.css";
import { ProjectItem } from "./ProjectItem";
import Skeleton from "react-loading-skeleton";

type ViewListTaskProps = {
  onCreateClick: () => void;
  onEditClick?: (projectId: string) => void;
};

interface Project {
  projectName: string;
  projectType: string;
  projectLevel: string;
  projectDeadline: string;
  projectDescription: string;
  fileName: string;
  fileUrl: string;
  tasks: Task[];
  projectStatus: string;
  projectId: string;
}
interface Task {
  id: string;
  description: string;
  deadline: string;
  content: string;
}

export const ViewListTask = ({
  onCreateClick,
  onEditClick,
}: ViewListTaskProps) => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("Tất cả");

  const filteredProjects =
    selectedStatus === "Tất cả"
      ? projects
      : projects.filter((project) => project.projectStatus === selectedStatus);

  // Pagination trên danh sách đã lọc
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const totalPages = Math.ceil(filteredProjects.length / pageSize);

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data.projects || []))
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (projectId) {
      const projectToEdit = projects.find((p) => p.projectId === projectId);
      if (projectToEdit) {
        onEditClick?.(projectId);
        console.log("Editing project:", projectToEdit);
      }
    }
  };

  const handleDelete = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (projectId) {
      Swal.fire({
        title: "Bạn có chắc muốn xoá dự án này?",
        text: "Hành động này không thể hoàn tác!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Xoá",
        cancelButtonText: "Huỷ",
      }).then((result) => {
        if (result.isConfirmed) {
          fetch(`/api/projects/${projectId}`, { method: "DELETE" }).then(
            (res) => {
              if (res.ok) {
                setProjects((prev) =>
                  prev.filter((p) => p.projectId !== projectId)
                );
                Swal.fire("Đã xoá!", "Dự án đã được xoá.", "success");
              } else {
                Swal.fire("Lỗi!", "Không thể xoá dự án.", "error");
              }
            }
          );
        }
      });
    }
  };

  const handleViewDetail = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (projectId) {
      router.push(`/projects/admin/${projectId}`);
    }
  };

  return (
    <>
      <div className=" relative text-center py-[30px]">
        <div className="inner-header grid grid-cols-4 gap-4 mb-4 text-black">
          {[
            "Tất cả",
            "Chưa triển khai",
            "Đang triển khai",
            "Đã hoàn thành",
          ].map((status) => (
            <h2
              key={status}
              className={`text-[16px] font-bold flex items-center justify-center cursor-pointer hover:bg-[#f0f0f0] transition-colors duration-300 py-[20px] rounded-lg ${
                selectedStatus === status ? "bg-gray-200" : ""
              }`}
              onClick={() => {
                setSelectedStatus(status);
                setCurrentPage(1); // Reset về trang 1 khi đổi filter
              }}
            >
              {status}
              {status !== "Tất cả" && (
                <span
                  className={`ml-2 border rounded-full w-[24px] h-[24px] flex items-center justify-center ${
                    status === "Chưa triển khai"
                      ? "border-[#FF0000] text-[#FF0000]"
                      : status === "Đang triển khai"
                      ? "border-[#FFAA00] text-[#FFAA00]"
                      : "border-[#30b930] text-[#30b930]"
                  }`}
                >
                  {
                    projects.filter(
                      (project) => project.projectStatus === status
                    ).length
                  }
                </span>
              )}
            </h2>
          ))}
        </div>

        <div className="inner-wrap grid grid-cols-4 gap-[16px] p-[32px]">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white p-[20px] rounded-lg shadow-md flex flex-col items-center justify-center"
                >
                  <Skeleton height={40} width={200} className="mb-4" />
                  <Skeleton height={20} width={150} className="mb-2" />
                  <Skeleton height={20} width={100} className="mb-2" />
                  <Skeleton height={20} width={80} />
                </div>
              ))
            : paginatedProjects.map((project) => (
                <ProjectItem
                  key={project.projectId}
                  project={project}
                  handleViewDetail={handleViewDetail}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                />
              ))}
        </div>

        <button
          className="absolute bottom-[10px] right-[40px] py-[14px] px-[20px] bg-[#424242] text-white text-[16px] rounded-lg shadow-md hover:bg-[#1a1a1a] transition-colors duration-300 cursor-pointer transform hover:scale-105 active:scale-95 ease-in-out flex items-center"
          onClick={onCreateClick}
        >
          <FiPlus className="mr-2 text-[26px] font-bold" />
          Tạo yêu cầu mới
        </button>

        <div className="inner-pagination mt-4 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              className={`join-item btn ${
                currentPage === idx + 1
                  ? "bg-gray-700 text-white font-bold border border-gray-700"
                  : "bg-white text-black"
              }`}
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
