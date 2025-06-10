import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaPen, FaRegTrashCan } from "react-icons/fa6";
import Swal from "sweetalert2";
import { InviteMember } from "./InviteMember";

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

interface User {
  userId: string;
  fullName: string;
  userName: string;
  email: string;
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
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<{
    [userId: string]: boolean;
  }>({});

  const userLogin = localStorage.getItem("user");
  const user = userLogin ? JSON.parse(userLogin) : null;
  const inviterId = user ? user.userId : "";
  const inviterName = user ? user.fullName : "";

  useEffect(() => {
    if (team.projectId) {
      fetch(`/api/projects/${team.projectId}`)
        .then((res) => res.json())
        .then((data) => setProject(data.project));
    }
  }, [team.projectId]);

  useEffect(() => {
    fetch("/api/users?role=member")
      .then((res) => res.json())
      .then((data) => {
        setAllUsers(
          (data.users || []).filter((user: User) => user.userId !== inviterId)
        );
      });
  }, [inviterId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    const filteredUsers = allUsers.filter((user) =>
      user.fullName.toLowerCase().includes(query)
    );
    setSuggestedUsers(filteredUsers);
  };

  const invite = async (
    user: User,
    teamId: string,
    inviterId: string,
    inviterName: string
  ) => {
    try {
      // Gửi lời mời lên server
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationId: new Date().getTime().toString(),
          invitationId: new Date().getTime().toString(),
          teamId: teamId,
          teamName: team.teamName,
          inviterId: inviterId,
          inviterName: inviterName,
          inviteeId: user.userId,
          inviteeName: user.fullName,
          inviteeEmail: user.email,
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
          type: "team-invitation",
          message: `đã mời bạn tham gia nhóm`,
        }),
      });

      if (res.status === 409) {
      Swal.fire("Thông báo", "Đã gửi lời mời và đang chờ xác nhận.", "info");
      const modal = document.getElementById(
        team.teamId
      ) as HTMLDialogElement | null;
      if (modal) modal.close();
      return;
    }

      if (!res.ok) {
        throw new Error("Gửi lời mời thất bại");
      }

      setInvitedUsers((prev) => ({ ...prev, [user.userId]: true }));
      setTimeout(() => {
        setInvitedUsers((prev) => {
          const newState = { ...prev };
          delete newState[user.userId];
          return newState;
        });
      }, 10000);

      const modal = document.getElementById(
        team.teamId
      ) as HTMLDialogElement | null;
      if (modal) modal.close();
      Swal.fire("Thành công!", "Mời thành viên thành công!", "success");
    } catch (error) {
      Swal.fire("Lỗi!", "Không thể gửi lời mời. Vui lòng thử lại.", "error");
      const modal = document.getElementById(
        team.teamId
      ) as HTMLDialogElement | null;
      if (modal) modal.close();
      console.error(error);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(team.teamName);
    setEditQuantity(String(team.memberQuantity));
    const modal = document.getElementById(
      "editTeamForm" + team.teamId
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

    // Kiểm tra tên nhóm đã tồn tại (trừ nhóm hiện tại)
    const res = await fetch("/api/teams");
    const data = await res.json();
    const existed = data.teams.some(
      (t: any) =>
        t.teamName.trim().toLowerCase() === editName.trim().toLowerCase() &&
        t.teamId !== team.teamId
    );
    if (existed) {
      setCheckName(true);
      Swal.fire(
        "Lỗi!",
        "Tên nhóm đã tồn tại, vui lòng chọn tên khác.",
        "error"
      );
      const modal = document.getElementById(
        "editTeamForm" + team.teamId
      ) as HTMLDialogElement | null;
      if (modal) modal.close();
      valid = false;
      return;
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
        <div className="px-[16px] py-[8px] rounded-[8px] shadow-md bg-white mb-[16px] text-black border border-gray-300 text-start cursor-pointer hover:shadow-lg transition-shadow duration-300 hover:border-gray-500 trainsition-border relative">
          <InviteMember teamId={team.teamId} />
          <p className="inner-name text-[20px] font-bold text-center mb-3">
            {team.teamName}
          </p>
          <p className="inner-quantity">
            <strong className="text-gray-500">ID :</strong>{" "}
            {team.teamId}
          </p>
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

      <dialog id={"editTeamForm" + team.teamId} className="modal">
        <div className="modal-box bg-white text-black">
          <div className="modal-heading">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Chỉnh sửa nhóm
            </h2>
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={() => {
                const modal = document.getElementById(
                  "editTeamForm" + team.teamId
                ) as HTMLDialogElement | null;
                if (modal) modal.close();
              }}
            >
              ✕
            </button>
          </div>

          <div className="modal-action block">
            <form
              id={"editTeamForm" + team.teamId}
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

      <dialog id={team.teamId} className="modal">
        <div className="modal-box bg-white text-black">
          <div className="modal-heading">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Mời thành viên vào nhóm
            </h2>
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={(e) => {
                e.stopPropagation();
                const modal = document.getElementById(
                  team.teamId
                ) as HTMLDialogElement | null;
                if (modal) modal.close();
              }}
            >
              ✕
            </button>
          </div>

          <div className="modal-action block">
            <form id="editTeamForm" className="inner-form px-[32px] py-[16px]">
              <input
                type="text"
                placeholder="Tìm kiếm thành viên..."
                onChange={handleChange}
                className="mb-4 px-3 py-2 border border-black rounded-lg w-full"
              />
              <div className="overflow-x-auto">
                <table className="table-auto w-full border border-gray-300 text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 border-b">Họ tên</th>
                      <th className="px-4 py-2 border-b">Tên đăng nhập</th>
                      <th className="px-4 py-2 border-b">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suggestedUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="text-center py-4 text-gray-400"
                        >
                          Không tìm thấy thành viên nào
                        </td>
                      </tr>
                    ) : (
                      suggestedUsers.map((user, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border-b">
                            {user.fullName}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {user.userName}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {invitedUsers[user.userId] ? (
                              <span className="text-green-600 font-semibold">
                                Đã mời
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="py-[10px] px-[20px] bg-[#424242] text-white text-[16px] rounded-lg shadow-md hover:bg-[#1a1a1a] transition-colors duration-300 cursor-pointer transform hover:scale-105 active:scale-95 ease-in-out"
                                onClick={() =>
                                  invite(
                                    user,
                                    team.teamId,
                                    inviterId,
                                    inviterName
                                  )
                                }
                              >
                                Mời
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};
