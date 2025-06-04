import { FaPen, FaRegTrashCan } from "react-icons/fa6";

interface Task {
  id: string;
  description: string;
  deadline: string;
  content: string;
}

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

export const ProjectItem = (props: {
  project: Project;
  handleViewDetail: (projectId: string, e: React.MouseEvent) => void;
  handleEdit: (projectId: string, e: React.MouseEvent) => void;
  handleDelete: (projectId: string, e: React.MouseEvent) => void;
}) => {
  const { project, handleViewDetail, handleEdit, handleDelete } = props;
  return (
    <>
      <div
        id={project.projectId}
        className="inner-item px-[16px] py-[8px] rounded-[8px] shadow-md bg-white mb-[16px] text-black border border-gray-300 text-start cursor-pointer hover:shadow-lg transition-shadow duration-300 hover:border-gray-500 trainsition-border"
        onClick={(e) => handleViewDetail(project.projectId, e)}
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
          <span className={`text-[#FF0000]`}>{project.projectStatus}</span>
        </p>

        <div className="inner-action flex justify-between items-center mt-[16px]">
          <div
            className="inner-edit p-[8px] rounded-full bg-[#f0f0f0] hover:bg-[#e0e0e0] transition-colors duration-300"
            onClick={(e) => handleEdit(project.projectId, e)}
          >
            <FaPen className="text-[#424242] text-[20px] cursor-pointer hover:text-[#1a1a1a] transition-colors duration-300" />
          </div>
          <div
            className="inner-delete p-[8px] rounded-full bg-[#f0f0f0] hover:bg-[#e0e0e0] transition-colors duration-300"
            onClick={(e) => handleDelete(project.projectId, e)}
          >
            <FaRegTrashCan className="text-[#424242] text-[20px] cursor-pointer hover:text-[#1a1a1a] transition-colors duration-300" />
          </div>
        </div>
      </div>
    </>
  );
};
