import { FaRegTrashCan } from "react-icons/fa6";
import Swal from "sweetalert2";
import { FaRegHeart, FaHeart } from "react-icons/fa6";
import { useState } from "react";

interface Member {
  memberId: string;
  memberName: string;
  email: string;
  role: string;
}

export const MemberItem = (props: {
  member: Member;
  teamId: string;
  onDeleted?: () => void;
  isOwner: boolean;
}) => {
  const { member, teamId, onDeleted, isOwner } = props;
  const [like, setLike] = useState(false);

  const handleDeleteMember = async () => {
    const result = await Swal.fire({
      title: "Bạn có chắc muốn xoá thành viên này?",
      text: "Thao tác này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
    });
    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `/api/teams/${teamId}/members/${member.memberId}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to delete member");
        }
        Swal.fire("Đã xoá!", "Thành viên đã được xoá.", "success");
        if (onDeleted) onDeleted();
      } catch (error) {
        console.error("Error deleting member:", error);
        Swal.fire("Lỗi!", "Không thể xoá thành viên.", "error");
      }
    }
  };

  return (
    <tr
      className="hover:bg-gray-100 transition-colors duration-200"
      key={member.memberId}
    >
      <td className="text-center border-b border-gray-300">
        {member.memberId}
      </td>
      <td className="text-center border-b border-gray-300">
        {member.memberName}
      </td>
      <td className="text-center border-b border-gray-300">{member.email}</td>
      <td className="text-center border-b border-gray-300">
        {member.role === "leader" ? (
          <span className="text-green-600 font-bold">Leader</span>
        ) : (
          <span className="text-blue-400 font-bold">Member</span>
        )}
      </td>
      {isOwner ? (
        <td className="text-center border-b border-gray-300">
          {member.role === "leader" ? (
            <div className="text-center ">
              <button
                className={
                  "text-2xl text-center text-gray-500 hover:text-gray-800 transition-colors duration-300 cursor-pointer" +
                  (like ? " text-red-500" : "")
                }
                title="Yêu thích"
                onClick={() => {
                  setLike(!like);
                  if (!like) {
                    Swal.fire(
                      "Yêu thích!",
                      "Bạn đã yêu thích thành viên này.",
                      "success"
                    );
                  } else {
                    Swal.fire(
                      "Bỏ yêu thích!",
                      "Bạn đã bỏ yêu thích thành viên này.",
                      "info"
                    );
                  }
                }}
              >
                {like ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>
          ) : (
            <button
              className="text-2xl text-gray-500 hover:text-gray-800 transition-colors duration-300 cursor-pointer"
              onClick={handleDeleteMember}
              title="Xóa thành viên"
            >
              <FaRegTrashCan />
            </button>
          )}
        </td>
      ) : (
        <td className="text-center border-b border-gray-300">
          <div className="text-center ">
            <button
              className={
                "text-2xl text-center text-gray-500 hover:text-gray-800 transition-colors duration-300 cursor-pointer" +
                (like ? " text-red-500" : "")
              }
              title="Yêu thích"
              onClick={() => {
                setLike(!like);
                if (!like) {
                  Swal.fire(
                    "Yêu thích!",
                    "Bạn đã yêu thích thành viên này.",
                    "success"
                  );
                } else {
                  Swal.fire(
                    "Bỏ yêu thích!",
                    "Bạn đã bỏ yêu thích thành viên này.",
                    "info"
                  );
                }
              }}
            >
              {like ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>
        </td>
      )}
    </tr>
  );
};
