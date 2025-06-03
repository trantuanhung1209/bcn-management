import { useEffect, useState } from "react";
import { FormCreateTask } from "./FormCreateTask";
import Swal from "sweetalert2";
import { TaskItem } from "./TaskItem";

type FormCreateProjectProps = {
  cancelClick: () => void;
  projectId: string | null;
};

interface Task {
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

export const FormEditProject = ({
  cancelClick,
  projectId,
}: FormCreateProjectProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (projectId) {
      const projects = JSON.parse(localStorage.getItem("projects") || "[]");
      const foundProject = projects.find(
        (p: Project) => p.projectId === projectId
      );
      if (foundProject) {
        setProject(foundProject);
        setTasks(foundProject.tasks);
      }
    }
  }, [projectId]);

  // Hàm nhận task mới từ con
  const handleCreateTask = (task: Task) => {
    setTasks((prevTasks) => [...prevTasks, task]);
    setProject((prev: Project | null) => {
      if (prev) {
        return {
          ...prev,
          tasks: [...(prev.tasks || []), task],
        };
      }
      return null;
    });
    const modal = document.getElementById(
      "my_modal_1"
    ) as HTMLDialogElement | null;
    if (modal) modal.close();
  };

  // Hàm để reload tasks sau khi xóa
  const reloadTasks = () => {
    // Lấy lại project từ localStorage và setTasks lại
    if (projectId) {
      const projects = JSON.parse(localStorage.getItem("projects") || "[]");
      const found = projects.find((p: Project) => p.projectId === projectId);
      if (found) setTasks(found.tasks || []);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const projectName = (
      form.elements.namedItem("projectName") as HTMLInputElement
    ).value;
    const projectType = (
      form.elements.namedItem("projectType") as HTMLSelectElement
    ).value;
    const projectLevel = (
      form.elements.namedItem("projectLevel") as HTMLSelectElement
    ).value;
    const projectDeadline = (
      form.elements.namedItem("projectDeadline") as HTMLInputElement
    ).value;
    const projectDescription = (
      form.elements.namedItem("projectDescription") as HTMLTextAreaElement
    ).value;
    const projectFileInput = form.elements.namedItem(
      "projectFile"
    ) as HTMLInputElement;
    const projectFile = projectFileInput.files && projectFileInput.files[0];

    // Tạo URL cho file nếu có
    let fileUrl = "";
    let fileName = "";
    if (projectFile) {
      fileUrl = URL.createObjectURL(projectFile);
      fileName = projectFile.name;
    }

    const updatedProject = {
      ...project,
      projectName,
      projectType,
      projectLevel,
      projectDeadline,
      projectDescription,
      fileName,
      fileUrl,
      tasks,
    };

    // Cập nhật vào localStorage
    const oldProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    const newProjects = oldProjects.map((p: Project) =>
      p.projectId === projectId ? updatedProject : p
    );
    localStorage.setItem("projects", JSON.stringify(newProjects));

    Swal.fire({
      title: "Thành công!",
      text: "Bạn đã cập nhật dự án thành công.",
      icon: "success",
      confirmButtonText: "OK",
    });

    cancelClick();
  };

  return (
    <>
      <div className="p-[60px] text-center">
        <form
          className="inner-form px-[32px] py-[16px] bg-white rounded-lg shadow-md border border-gray-300"
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Sửa dự án
          </h2>
          <div className="mb-4 flex gap-[40px] items-center">
            <label
              className="block w-[200px] text-end text-black font-[600]"
              htmlFor="projectName"
            >
              Tên dự án
            </label>
            <input
              type="text"
              id="projectName"
              name="projectName"
              className="flex-1 px-3 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ccc] text-black "
              placeholder="Nhập tên dự án"
              defaultValue={project ? project.projectName : ""}
              required
              onChange={(e) =>
                setProject((prev) =>
                  prev ? { ...prev, projectName: e.target.value } : null
                )
              }
            />
          </div>

          <div className="mb-4 flex gap-[40px] items-center">
            <label
              className="block w-[200px] text-end text-black font-[600]"
              htmlFor="projectType"
            >
              Chọn loại dự án
            </label>
            <select
              id="projectType"
              name="projectType"
              className="flex-1 px-3 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ccc] text-black"
              defaultValue={project ? project.projectType : ""}
              onChange={(e) =>
                setProject((prev) =>
                  prev ? { ...prev, projectType: e.target.value } : null
                )
              }
            >
              <option value="" disabled>
                Chọn loại dự án
              </option>
              <option value="web">Web</option>
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div className="mb-4 flex gap-[40px] items-center">
            <label
              className="block w-[200px] text-end text-black font-[600]"
              htmlFor="projectLevel"
            >
              Chọn cấp độ dự án
            </label>
            <select
              id="projectLevel"
              name="projectLevel"
              className="flex-1 px-3 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ccc] text-black"
              defaultValue={project ? project.projectLevel : ""}
              onChange={(e) =>
                setProject((prev) =>
                  prev ? { ...prev, projectLevel: e.target.value } : null
                )
              }
            >
              <option value="" disabled>
                Chọn cấp độ dự án
              </option>
              <option value="low">Thấp</option>
              <option value="medium">Trung bình</option>
              <option value="high">Cao</option>
              <option value="other">Cấp thần</option>
            </select>
          </div>

          <div className="mb-4 flex gap-[40px] items-center">
            <label
              className="block w-[200px] text-end text-black font-[600]"
              htmlFor="projectDeadline"
            >
              Thời hạn dự án
            </label>
            <input
              type="text"
              id="projectDeadline"
              name="projectDeadline"
              className="flex-1 px-3 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ccc] text-black"
              placeholder="Nhập thời hạn dự án"
              defaultValue={project ? project.projectDeadline : ""}
              required
              onChange={(e) =>
                setProject((prev) =>
                  prev ? { ...prev, projectDeadline: e.target.value } : null
                )
              }
            />
          </div>

          <div className="mb-4 flex gap-[40px] items-center">
            <label
              className="block w-[200px] text-end text-black font-[600]"
              htmlFor="projectDescription"
            >
              Mô tả dự án
            </label>
            <textarea
              id="projectDescription"
              name="projectDescription"
              className="flex-1 px-3 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ccc] text-black"
              placeholder="Nhập mô tả dự án"
              rows={4}
              defaultValue={project ? project.projectDescription : ""}
              required
              onChange={(e) =>
                setProject((prev) =>
                  prev ? { ...prev, projectDescription: e.target.value } : null
                )
              }
            ></textarea>
          </div>

          <div className="mb-4 flex gap-[40px] items-center">
            <label
              className="block w-[200px] text-end text-black font-[600]"
              htmlFor="projectFile"
            >
              Thêm tệp đính kèm
            </label>
            <input
              type="file"
              id="projectFile"
              name="projectFile"
              className="flex-1 px-3 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ccc] text-black "
              placeholder="Thêm tên tệp đính kèm"
              accept=".pdf,.doc,.docx,.txt,.jpg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setProject((prev) =>
                    prev ? { ...prev, projectFile: file } : null
                  );
                }
              }}
            />
          </div>

          <div className="mb-4 flex gap-[40px] items-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Danh sách nhiệm vụ
            </h3>
            <button
              type="button"
              className="py-[10px] px-[20px] bg-[#424242] text-white text-[16px] rounded-lg shadow-md hover:bg-[#1a1a1a] transition-colors duration-300 cursor-pointer transform hover:scale-105 active:scale-95 ease-in-out"
              onClick={() => {
                const modal = document.getElementById(
                  "my_modal_1"
                ) as HTMLDialogElement | null;
                if (modal) {
                  modal.showModal();
                }
              }}
            >
              Thêm nhiệm vụ
            </button>
          </div>

          <div className="task-list mb-4">
            <div className="overflow-x-auto">
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                <table className="table text-black border border-gray-300 w-full">
                  <thead className="bg-gray-200 text-black">
                    <tr>
                      <th>ID</th>
                      <th>Mô tả </th>
                      <th>Thời hạn</th>
                      <th>Nội dung yêu cầu</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-300 text-gray-700">
                    {tasks.map((task, index) => (
                      <TaskItem
                        key={index}
                        task={task}
                        index={index}
                        projectId={projectId}
                        onTaskDeleted={reloadTasks}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="text-center flex justify-center gap-[20px]">
            <button
              type="button"
              className="py-[14px] px-[20px] bg-[#8c8b8b] text-white text-[16px] rounded-lg shadow-md hover:bg-[#4d4949] transition-colors duration-300 cursor-pointer transform hover:scale-105 active:scale-95 ease-in-out"
              onClick={cancelClick}
            >
              Huỷ bỏ
            </button>
            <button
              type="submit"
              className="py-[14px] px-[20px] bg-[#424242] text-white text-[16px] rounded-lg shadow-md hover:bg-[#1a1a1a] transition-colors duration-300 cursor-pointer transform hover:scale-105 active:scale-95 ease-in-out"
            >
              Sửa dự án
            </button>
          </div>
        </form>
      </div>

      <FormCreateTask onCreateTask={handleCreateTask} />
    </>
  );
};
