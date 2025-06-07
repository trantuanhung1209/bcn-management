import { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import Swal from "sweetalert2";

export const CreateTeam = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [checkName, setCheckName] = useState(false);
  const [checkQuantity, setCheckQuantity] = useState(false);

  const validateQuantity = (value: string) => {
    const regex = /^\d+$/;
    return regex.test(value);
  };

  const handleOpenModal = () => {
    const modal = document.getElementById(
      "my_modal_1"
    ) as HTMLDialogElement | null;
    if (modal) {
      modal.showModal();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const teamName = (
      form.elements.namedItem("teamName") as HTMLInputElement
    ).value.trim();
    const memberQuantity = (
      form.elements.namedItem("memberQuantity") as HTMLInputElement
    ).value.trim();

    // Reset lỗi
    setCheckName(false);
    setCheckQuantity(false);

    let valid = true;
    if (!teamName) {
      setCheckName(true);
      valid = false;
    }
    if (!memberQuantity || !validateQuantity(memberQuantity)) {
      setCheckQuantity(true);
      valid = false;
    }
    if (!valid) return;

    // Kiểm tra tên nhóm bị trùng trên frontend
    try {
      const res = await fetch("/api/teams");
      const data = await res.json();
      const existed = data.teams?.some(
        (team: { teamName: string }) =>
          team.teamName.trim().toLowerCase() === teamName.toLowerCase()
      );
      if (existed) {
        setCheckName(true);
        return;
      }
    } catch (error) {
      // Nếu lỗi khi fetch, vẫn cho phép gửi lên backend để backend kiểm tra lại
      console.error("Error checking team name:", error);
    }

    const newTeam = {
      teamName,
      memberQuantity: parseInt(memberQuantity, 10),
      memberIds: [],
      teamId: Date.now().toString(),
      createdAt: new Date().toISOString(),
      projectId: "",
    };

    fetch("/api/teams", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTeam),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          Swal.fire("Thành công!", "Tạo nhóm mới thành công.", "success");
          if (onSuccess) onSuccess();
        } else {
          Swal.fire("Lỗi!", data.message || "Tạo nhóm thất bại.", "error");
        }
      })
      .catch((error) => {
        console.error("Error creating team:", error);
        Swal.fire("Lỗi!", "Có lỗi xảy ra khi tạo nhóm.", "error");
      });

    // Reset form và đóng modal
    form.reset();
    const modal = document.getElementById(
      "my_modal_1"
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
          Tạo nhóm
        </button>
      </div>

      <dialog id="my_modal_1" className="modal">
        <div className="modal-box bg-white text-black">
          <div className="modal-heading">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Tạo nhóm mới
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
                  htmlFor="teamName"
                >
                  Tên nhóm
                </label>
                <input
                  type="text"
                  id="teamName"
                  name="teamName"
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
