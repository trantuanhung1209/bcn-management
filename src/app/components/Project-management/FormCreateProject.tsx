import { useState } from "react";
import { FormCreateTask } from "./FormCreateTask";
import Swal from "sweetalert2";

type FormCreateProjectProps = {
  cancelClick: () => void;
};

interface Task {
  description: string;
  deadline: string;
  content: string;
}

export const FormCreateProject = ({ cancelClick }: FormCreateProjectProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Hàm nhận task mới từ con
  const handleCreateTask = (task: Task) => {
    setTasks((prevTasks) => [...prevTasks, task]);
    const modal = document.getElementById(
      "my_modal_1"
    ) as HTMLDialogElement | null;
    if (modal) {
      modal.close();
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

    // Lấy danh sách task hiện tại từ state
    const projectTasks = tasks; 

    // Tạo object dự án
    const projectData = {
      projectId: Date.now().toString(), 
      projectName,
      projectType,
      projectLevel,
      projectDeadline,
      projectDescription,
      fileName,
      fileUrl,
      tasks: projectTasks,
      projectStatus: "Chưa triển khai", 
    };

    // Lưu vào localStorage (danh sách dự án)
    const oldProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    const newProjects = [...oldProjects, projectData];
    localStorage.setItem("projects", JSON.stringify(newProjects));

    // Reset form và tasks nếu muốn
    form.reset();
    setTasks([]);
    console.log("Dự án đã được tạo:", projectData);
    Swal.fire({
      title: "Thành công!",
      text: "Bạn đã tạo dự án thành công.",
      icon: "success",
      confirmButtonText: "OK",
    });

    // Đóng modal nếu cần
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
            Tạo yêu cầu triển khai mới
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
              defaultValue=""
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
              defaultValue=""
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-300 text-gray-700">
                    {tasks.map((task, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-100 transition-colors duration-200 border-b border-gray-300"
                      >
                        <td>{index + 1}</td>
                        <td>{task.description}</td>
                        <td>{task.deadline}</td>
                        <td>{task.content}</td>
                        <td>Chưa hoàn thành</td>
                      </tr>
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
              Tạo dự án
            </button>
          </div>
        </form>
      </div>

      <FormCreateTask onCreateTask={handleCreateTask} />
    </>
  );
};
