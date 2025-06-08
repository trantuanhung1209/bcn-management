import { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import Swal from "sweetalert2";

export const JoinTeam = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [checkId, setCheckId] = useState(false);
  const handleOpenModal = () => {
    const modal = document.getElementById(
      "my_modal_3"
    ) as HTMLDialogElement | null;
    if (modal) {
      modal.showModal();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const teamId = (
      form.elements.namedItem("teamId") as HTMLInputElement
    ).value.trim();

    setCheckId(false);

    if (!teamId) {
      setCheckId(true);
      return;
    }

    const user = localStorage.getItem("user");
    if (!user) {
      Swal.fire("Lỗi!", "Bạn cần đăng nhập để tham gia nhóm.", "error");
      return;
    }
    const userData = JSON.parse(user);
    const memberId = userData.userId;
    const memberName = userData.fullName || userData.userName || "";
    const email = userData.email || "";
    const role = userData.role || "member";

    try {
      // Lấy danh sách thành viên hiện tại
      const res = await fetch(`/api/teams/${teamId}/members`);
      if (!res.ok) {
        setCheckId(true);
        Swal.fire("Lỗi!", "ID nhóm không tồn tại.", "error");
        const modal = document.getElementById(
          "my_modal_3"
        ) as HTMLDialogElement | null;
        if (modal) {
          modal.close();
          form.reset();
          setCheckId(false);
        }
        return;
      }
      const data = await res.json();
      const existed = (data.members || []).some(
        (m: any) => m.memberId === memberId
      );
      if (existed) {
        Swal.fire("Thông báo", "Bạn đã là thành viên của nhóm này.", "info");
        const modal = document.getElementById(
          "my_modal_3"
        ) as HTMLDialogElement | null;
        if (modal) modal.close();
        form.reset();
        setCheckId(false);
        return;
      }

      // Lấy thông tin nhóm để kiểm tra memberQuantity
      const teamRes = await fetch(`/api/teams/${teamId}`);
      const teamData = await teamRes.json();
      const memberQuantity = teamData.team?.memberQuantity || 0;
      if ((data.members?.length || 0) >= memberQuantity) {
        Swal.fire("Lỗi!", "Nhóm đã đủ số lượng thành viên.", "error");
        const modal = document.getElementById(
          "my_modal_3"
        ) as HTMLDialogElement | null;
        if (modal) modal.close();
        form.reset();
        setCheckId(false);
        return;
      }

      // Gửi yêu cầu thêm thành viên mới
      const addRes = await fetch(`/api/teams/${teamId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          memberName,
          email,
          role,
        }),
      });

      const addData = await addRes.json();
      if (addRes.ok && addData.success) {
        Swal.fire("Thành công!", "Bạn đã tham gia nhóm thành công.", "success");
        if (onSuccess) onSuccess();
      } else {
        Swal.fire(
          "Lỗi!",
          addData.message || "Không thể tham gia nhóm.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error joining team:", error);
      Swal.fire("Lỗi!", "Có lỗi xảy ra khi tham gia nhóm.", "error");
    }

    // Reset form và đóng modal
    form.reset();
    const modal = document.getElementById(
      "my_modal_3"
    ) as HTMLDialogElement | null;
    if (modal) modal.close();
  };

  return (
    <>
      <div className="flex justify-end mt-[20px]">
        <button
          className="py-[14px] px-[20px] bg-[#424242] text-white text-[16px] rounded-lg shadow-md hover:bg-[#1a1a1a] transition-colors duration-300 cursor-pointer transform hover:scale-105 active:scale-95 ease-in-out flex items-center"
          onClick={handleOpenModal}
        >
          <FaPlus className="text-[20px] mr-2" />
          Tham gia nhóm
        </button>
      </div>

      <dialog id="my_modal_3" className="modal">
        <div className="modal-box bg-white text-black">
          <div className="modal-heading">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Tham gia nhóm
            </h2>
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={() => {
                const modal = document.getElementById(
                  "my_modal_3"
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
                  htmlFor="teamId"
                >
                  Nhập ID nhóm
                </label>
                <input
                  type="text"
                  id="teamId"
                  name="teamId"
                  className="flex-1 px-3 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ccc] text-black"
                  placeholder="nhập ID nhóm"
                />
              </div>
              {checkId ? (
                <div className="text-red-500 text-sm mb-2">
                  ID nhóm không được để trống hoặc không hợp lệ
                </div>
              ) : (
                ""
              )}

              <div className="text-center">
                <button
                  type="submit"
                  className="btn py-[14px] px-[20px] bg-[#8c8b8b] text-white text-[16px] rounded-lg shadow-md hover:bg-[#1a1a1a] transition-colors duration-300 cursor-pointer transform hover:scale-105 active:scale-95 ease-in-out"
                >
                  Tham gia
                </button>
              </div>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};
