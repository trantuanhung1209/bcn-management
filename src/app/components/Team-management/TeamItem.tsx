import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaPen, FaRegTrashCan } from "react-icons/fa6";
import Swal from "sweetalert2";

interface Team {
  teamId: string;
  teamName: string;
  memberQuantity: number;
  createdAt: string;
  projectId?: string;
  deadline?: string;
}

interface Task {
  id?: string;
  description: string;
  deadline: string;
  content: string;
}

interface Project {
  projectId: string;
  projectName: string;
  projectDeadline?: string;
  task: Task[];
}

export const TeamItem = ({
  team,
  onDeleted,
  onEdited,
  isOwner,
}: {
  team: Team;
  onDeleted?: () => void;
  onEdited?: () => void;
  isOwner?: boolean;
}) => {
  const router = useRouter();
  const [editName, setEditName] = useState(team.teamName);
  const [editQuantity, setEditQuantity] = useState(String(team.memberQuantity));
  const [checkName, setCheckName] = useState(false);
  const [checkQuantity, setCheckQuantity] = useState(false);
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (team.projectId) {
      fetch(`/api/projects/${team.projectId}`)
        .then((res) => res.json())
        .then((data) => setProject(data.project));
    }
  }, [team.projectId]);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(team.teamName);
    setEditQuantity(String(team.memberQuantity));
    const modal = document.getElementById(
      "my_modal_2"
    ) as HTMLDialogElement | null;
    if (modal) modal.showModal();
  };

  const handleDelete = async (teamId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn xóa nhóm này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });
    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/teams/${teamId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete team");
        }
        Swal.fire("Thành công!", "Xóa nhóm thành công!", "success");
        if (onDeleted) onDeleted();
      } catch (error) {
        console.error("Error deleting team:", error);
        Swal.fire("Lỗi!", "Xóa nhóm thất bại. Vui lòng thử lại sau.", "error");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCheckName(false);
    setCheckQuantity(false);

    let valid = true;
    if (!editName.trim()) {
      setCheckName(true);
      valid = false;
    }
    if (
      !editQuantity.trim() ||
      isNaN(Number(editQuantity)) ||
      Number(editQuantity) <= 0
    ) {
      setCheckQuantity(true);
      valid = false;
    }
    if (!valid) return;

    try {
      const response = await fetch(`/api/teams/${team.teamId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: editName.trim(),
          memberQuantity: Number(editQuantity),
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update team");
      }
      Swal.fire("Thành công!", "Cập nhật nhóm thành công!", "success");
      const modal = document.getElementById(
        "my_modal_1"
      ) as HTMLDialogElement | null;
      if (modal) modal.close();
      if (onEdited) onEdited();
    } catch (error) {
      console.error("Error updating team:", error);
      Swal.fire("Lỗi!", "Cập nhật nhóm thất bại.", "error");
    }
  };

  return (
    <>
      <div
        onClick={() => {
          router.push(`/team-management/${team.teamId}`);
        }}
        className="inner-item"
      >
        <div className="px-[16px] py-[8px] rounded-[8px] shadow-md bg-white mb-[16px] text-black border border-gray-300 text-start cursor-pointer hover:shadow-lg transition-shadow duration-300 hover:border-gray-500 trainsition-border">
          <p className="inner-name text-[20px] font-bold text-center mb-3">{team.teamName}</p>
          <p className="inner-quantity">
            <strong className="text-gray-500">Số lượng tối đa:</strong>{" "}
            {team.memberQuantity}
          </p>
          <p className="inner-date">
            <strong className="text-gray-500">Ngày tạo:</strong>{" "}
            {team.createdAt
              ? new Date(team.createdAt).toLocaleDateString()
              : ""}
          </p>
          <p className="inner-project">
            {project?.projectName ? (
              <>
                <strong className="text-gray-500">
                  Dự án đang triển khai:
                </strong>{" "}
                {project.projectName}
              </>
            ) : (
              <strong className="text-gray-500">Chưa có dự án nào</strong>
            )}
          </p>
          <p className="inner-deadline">
            {project?.projectDeadline ? (
              <>
                <strong className="text-gray-500">Ngày hết hạn dự án:</strong>{" "}
                {project.projectDeadline
                  ? project.projectDeadline
                  : "Chưa có ngày hết hạn"}
              </>
            ) : (
              <strong className="text-gray-500">Chưa có ngày hết hạn</strong>
            )}
          </p>

          {isOwner ? (
            <div className="inner-action flex justify-between items-center mt-[16px]">
              <div
                className="inner-edit p-[8px] rounded-full bg-[#f0f0f0] hover:bg-[#e0e0e0] transition-colors duration-300"
                onClick={(e) => handleEdit(e)}
              >
                <FaPen className="text-[#424242] text-[20px] cursor-pointer hover:text-[#1a1a1a] transition-colors duration-300" />
              </div>
              <div
                className="inner-delete p-[8px] rounded-full bg-[#f0f0f0] hover:bg-[#e0e0e0] transition-colors duration-300"
                onClick={(e) => handleDelete(team.teamId, e)}
              >
                <FaRegTrashCan className="text-[#424242] text-[20px] cursor-pointer hover:text-[#1a1a1a] transition-colors duration-300" />
              </div>
            </div>
          ) : (
            <div className="inner-action flex justify-between items-center mt-[16px]">
              <div className="inner-edit p-[8px] rounded-full">
                <FaPen className="text-[#a2a2a2] text-[20px]" />
              </div>
              <div className="inner-delete p-[8px] rounded-full">
                <FaRegTrashCan className="text-[#a2a2a2] text-[20px]" />
              </div>
            </div>
          )}
        </div>
      </div>

      <dialog id="my_modal_2" className="modal">
        <div className="modal-box bg-white text-black">
          <div className="modal-heading">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Chỉnh sửa nhóm
            </h2>
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={() => {
                const modal = document.getElementById(
                  "my_modal_2"
                ) as HTMLDialogElement | null;
                if (modal) modal.close();
              }}
            >
              ✕
            </button>
          </div>

          <div className="modal-action block">
            <form
              id="editTeamForm"
              onSubmit={handleSubmit}
              className="inner-form px-[32px] py-[16px]"
            >
              <div className="mb-4 flex gap-[10px] items-center">
                <label
                  className="block w-[150px] text-end text-black font-[600]"
                  htmlFor="teamName"
                >
                  Tên nhóm
                </label>
                <input
                  type="text"
                  id="teamName"
                  name="teamName"
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ccc] text-black"
                  placeholder="nhập tên nhóm"
                />
              </div>
              {checkName ? (
                <div className="text-red-500 text-sm mb-2">
                  Tên nhóm không được để trống hoặc đã tồn tại
                </div>
              ) : (
                ""
              )}

              <div className="mb-4 flex gap-[10px] items-center">
                <label
                  className="block w-[150px] text-end text-black font-[600]"
                  htmlFor="memberQuantity"
                >
                  Số lượng thành viên
                </label>
                <input
                  type="text"
                  id="memberQuantity"
                  name="memberQuantity"
                  onChange={(e) => setEditQuantity(e.target.value)}
                  className="flex-1 px-3 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ccc] text-black"
                  placeholder="Nhập số lượng thành viên"
                />
              </div>
              {checkQuantity ? (
                <div className="text-red-500 text-sm mb-2">
                  Số lượng thành viên phải là số nguyên dương
                </div>
              ) : (
                ""
              )}

              <div className="text-center">
                <button
                  type="submit"
                  className="btn py-[14px] px-[20px] bg-[#8c8b8b] text-white text-[16px] rounded-lg shadow-md hover:bg-[#1a1a1a] transition-colors duration-300 cursor-pointer transform hover:scale-105 active:scale-95 ease-in-out"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};
