import { FaRegTrashCan } from "react-icons/fa6";
import Swal from "sweetalert2";

interface Task {
  id?: string;
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
  projectTasks: Task[];
  projectStatus: string;
  projectId: string;
}

export const TaskItem = (props: {
  task: Task;
  index: number;
  projectId: string | null;
  onTaskDeleted?: () => void;
}) => {
  const { task, index, projectId, onTaskDeleted } = props;

  const deleteTask = (taskId?: string) => {
    if (taskId) {
      Swal.fire({
        title: "Xóa nhiệm vụ",
        text: "Bạn có chắc chắn muốn xóa nhiệm vụ này?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      }).then((result) => {
        if (result.isConfirmed) {
          const projects = localStorage.getItem("projects");
          const projectJson = projects ? JSON.parse(projects) : [];
          const projectFilter = projectJson.filter(
            (project: Project) => project.projectId === projectId
          );
          const projectUpdate = projectFilter[0];
          if (projectUpdate) {
            projectUpdate.tasks = projectUpdate.tasks.filter(
              (task: Task) => task.id !== taskId
            );
            const updatedProjects = projectJson.map((project: Project) =>
              project.projectId === projectId ? projectUpdate : project
            );
            localStorage.setItem("projects", JSON.stringify(updatedProjects));
          }
          Swal.fire("Đã xoá!", "Nhiệm vụ đã được xoá.", "success");
          if (onTaskDeleted) {
            onTaskDeleted();
          }
        }
      });
    }
  };

  return (
    <>
      <tr
        key={index}
        className="hover:bg-gray-100 transition-colors duration-200 border-b border-gray-300"
      >
        <td>{index + 1}</td>
        <td>{task.description}</td>
        <td>{task.deadline}</td>
        <td>{task.content}</td>
        <td>Chưa hoàn thành</td>
        <td>
          <button
            type="button"
            className="inner-delete p-[8px] rounded-full bg-[#f0f0f0] hover:bg-[#e0e0e0] transition-colors duration-300"
            onClick={() => deleteTask(task.id)}
          >
            <FaRegTrashCan className="text-[#424242] text-[20px] cursor-pointer hover:text-[#1a1a1a] transition-colors duration-300" />
          </button>
        </td>
      </tr>
    </>
  );
};
