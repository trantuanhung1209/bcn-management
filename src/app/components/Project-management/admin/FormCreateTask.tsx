import { useState } from "react";

interface Task {
  id: string;
  description: string;
  deadline: string;
  content: string;
}

type FormCreateTaskProps = {
  onCreateTask: (task: Task) => void;
};

export const FormCreateTask = ({ onCreateTask }: FormCreateTaskProps) => {
  const [checkDesc, setCheckDesc] = useState(false);
  const [checkDeadline, setCheckDeadline] = useState(false);
  const [checkContent, setCheckContent] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const projectDescription = (
      form.elements.namedItem("projectDescription") as HTMLInputElement
    ).value;
    const projectDeadline = (
      form.elements.namedItem("projectDeadline") as HTMLInputElement
    ).value;
    const projectContent = (
      form.elements.namedItem("projectContent") as HTMLInputElement
    ).value;

    if (projectDescription.trim() === "") {
      setCheckDesc(true);
      return;
    } else {
      setCheckDesc(false);
    }

    if (projectDeadline.trim() === "") {
      setCheckDeadline(true);
      return;
    } else {
      setCheckDeadline(false);
    }

    if (projectContent.trim() === "") {
      setCheckContent(true);
      return;
    } else {
      setCheckContent(false);
    }

    // Handle form submission logic here
    const task = {
      id: Date.now().toString(),
      description: projectDescription,
      deadline: projectDeadline,
      content: projectContent,
    };

    onCreateTask(task);

    form.reset();
    const modal = document.getElementById(
      "my_modal_1"
    ) as HTMLDialogElement | null;
    if (modal) modal.close();
  };

  return (
    <>
      <dialog id="my_modal_1" className="modal">
        <div className="modal-box bg-white text-black">
          <div className="modal-heading">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Tạo nhiệm vụ mới
            </h2>
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={() => {
                const modal = document.getElementById(
                  "my_modal_1"
                ) as HTMLDialogElement | null;
                if (modal) modal.close();
              }}
            >
              ✕
            </button>
          </div>

          <div className="modal-action block">
            <form
              method="dialog"
              onSubmit={handleSubmit}
              className="inner-form px-[32px] py-[16px]"
            >
              <div className="mb-4 flex gap-[10px] items-center">
                <label
                  className="block w-[150px] text-end text-black font-[600]"
                  htmlFor="projectDescription"
                >
                  Mô tả dự án
                </label>
                <input
                  type="text"
                  id="projectDescription"
                  name="projectDescription"
                  className="flex-1 px-3 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ccc] text-black"
                  placeholder="nhập mô tả dự án"
                />
              </div>
              {checkDesc ? (
                <div className="text-red-500 text-sm mb-2">
                  Mô tả dự án không được để trống
                </div>
              ) : (
                ""
              )}

              <div className="mb-4 flex gap-[10px] items-center">
                <label
                  className="block w-[150px] text-end text-black font-[600]"
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
              {checkDeadline ? (
                <div className="text-red-500 text-sm mb-2">
                  Thời hạn dự án không được để trống
                </div>
              ) : (
                ""
              )}

              <div className="mb-4 flex gap-[10px] items-center">
                <label
                  className="block w-[150px] text-end text-black font-[600]"
                  htmlFor="projectContent"
                >
                  Nội dung yêu cầu
                </label>
                <input
                  type="text"
                  id="projectContent"
                  name="projectContent"
                  className="flex-1 px-3 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ccc] text-black"
                  placeholder="Nhập nội dung yêu cầu"
                />
              </div>
              {checkContent ? (
                <div className="text-red-500 text-sm mb-2">
                  Nội dung yêu cầu không được để trống
                </div>
              ) : (
                ""
              )}

              <div className="text-center">
                <button
                  type="submit"
                  className="btn py-[14px] px-[20px] bg-[#8c8b8b] text-white text-[16px] rounded-lg shadow-md hover:bg-[#1a1a1a] transition-colors duration-300 cursor-pointer transform hover:scale-105 active:scale-95 ease-in-out"
                >
                  Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};
