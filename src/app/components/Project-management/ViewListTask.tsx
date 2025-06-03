import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { FaPen } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import Swal from "sweetalert2";

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
  projectTasks: Task[];
  projectStatus: string;
  projectId: string;
}
interface Task {
  description: string;
  deadline: string;
  content: string;
}

export const ViewListTask = ({ onCreateClick, onEditClick }: ViewListTaskProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const filterType = (type: string) => {
    switch (type) {
      case "Chưa triển khai":
        return projects.filter(
          (project) => project.projectStatus === "Chưa triển khai"
        );
      case "Đang triển khai":
        return projects.filter(
          (project) => project.projectStatus === "Đang triển khai"
        );
      case "Đã hoàn thành":
        return projects.filter(
          (project) => project.projectStatus === "Đã hoàn thành"
        );
      default:
        return projects;
    }
  };
  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    setProjects(savedProjects);
  }, []);

  const handleEdit = (projectId: string) => {
    if (projectId) {
      const projectToEdit = projects.find((p) => p.projectId === projectId);
      if (projectToEdit) {
        onEditClick?.(projectId);
        console.log("Editing project:", projectToEdit);
      }
    }
  };

  const handleDelete = (projectId: string) => {
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
          const updatedProjects = projects.filter(
            (p) => p.projectId !== projectId
          );
          setProjects(updatedProjects);
          localStorage.setItem("projects", JSON.stringify(updatedProjects));
          Swal.fire("Đã xoá!", "Dự án đã được xoá.", "success");
        }
      });
    }
  };

  return (
    <>
      <div className=" relative text-center py-[30px]">
        <div className="inner-header grid grid-cols-3 gap-4 mb-4 text-black">
          <h2 className="text-[16px] font-bold flex items-center justify-center">
            Chưa triển khai
            <span className="ml-2 border border-[#FF0000] rounded-full w-[24px] h-[24px] text-[#FF0000]">
              {filterType("Chưa triển khai").length}
            </span>
          </h2>
          <h2 className="text-[16px] font-bold flex items-center justify-center">
            Đang triển khai
            <span className="ml-2 border border-[#FFAA00] rounded-full w-[24px] h-[24px] text-[#FFAA00]">
              {filterType("Đang triển khai").length}
            </span>
          </h2>
          <h2 className="text-[16px] font-bold flex items-center justify-center">
            Đã hoàn thành
            <span className="ml-2 border border-[#30b930] rounded-full w-[24px] h-[24px] text-[#30b930]">
              {filterType("Đã hoàn thành").length}
            </span>
          </h2>
        </div>

        <div className="inner-wrap grid grid-cols-4 gap-[16px] p-[32px]">
          {projects.map((project, index) => (
            <div
              key={index}
              id={project.projectId}
              className="inner-item px-[16px] py-[8px] rounded-[8px] shadow-md bg-white mb-[16px] text-black border border-gray-300 text-start cursor-pointer hover:shadow-lg transition-shadow duration-300 hover:border-gray-500 trainsition-border"
            >
              <h2 className="text-[20px] font-bold mb-[8px]">
                {project.projectName}
              </h2>
              <p className="text-[16px] mb-[8px] text-[#A1A1A1]">
                Loai: {project.projectType}
              </p>
              <p
                className="text-[16px] mb-[8px] text-[#A1A1A1] line-clamp-1"
                title={project.projectDescription}
              >
                Nội dung yêu cầu: {project.projectDescription}
              </p>
              <p className="text-[16px] mb-[8px] text-[#A1A1A1]">
                Tình trạng:{" "}
                <span className={`text-[#FF0000]`}>
                  {project.projectStatus}
                </span>
              </p>

              <div className="inner-action flex justify-between items-center mt-[16px]">
                <div
                  className="inner-edit p-[8px] rounded-full bg-[#f0f0f0] hover:bg-[#e0e0e0] transition-colors duration-300"
                  onClick={() => handleEdit(project.projectId)}
                >
                  <FaPen className="text-[#424242] text-[20px] cursor-pointer hover:text-[#1a1a1a] transition-colors duration-300" />
                </div>
                <div
                  className="inner-delete p-[8px] rounded-full bg-[#f0f0f0] hover:bg-[#e0e0e0] transition-colors duration-300"
                  onClick={() => handleDelete(project.projectId)}
                >
                  <FaRegTrashCan className="text-[#424242] text-[20px] cursor-pointer hover:text-[#1a1a1a] transition-colors duration-300" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          className="absolute bottom-[10px] right-[40px] py-[14px] px-[20px] bg-[#424242] text-white text-[16px] rounded-lg shadow-md hover:bg-[#1a1a1a] transition-colors duration-300 cursor-pointer transform hover:scale-105 active:scale-95 ease-in-out flex items-center"
          onClick={onCreateClick}
        >
          <FiPlus className="mr-2 text-[26px] font-bold" />
          Tạo yêu cầu mới
        </button>

        <div className="inner-pagination">
          <div className="join">
            <button className="join-item btn bg-white text-black">1</button>
            <button className="join-item btn bg-white text-black">2</button>
            <button className="join-item btn bg-white text-black">3</button>
            <button className="join-item btn bg-white text-black">4</button>
          </div>
        </div>
      </div>

    </>
  );
};
