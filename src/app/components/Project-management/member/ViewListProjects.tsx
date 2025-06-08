import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "react-loading-skeleton/dist/skeleton.css";
import Skeleton from "react-loading-skeleton";
import { ProjectItem } from './ProjectItem';

type ViewListTaskProps = {
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


  const handleViewDetail = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (projectId) {
      router.push(`/projects/${projectId}`);
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
                  
                />
              ))}
        </div>

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
