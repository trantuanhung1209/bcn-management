import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaBell } from "react-icons/fa6";

interface Invitation {
  invitationId: string;
  teamName: string;
  inviterName: string;
  status: string;
  teamId: string;
}

export const Notification = ({ onJoined }: { onJoined?: () => void }) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [show, setShow] = useState(false); // Thêm state để ẩn/hiện bảng
  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : {};
  const userId = user.userId;

  useEffect(() => {
    if (userId) {
      fetch(`/api/invitations/notifications?userId=${userId}`)
        .then((res) => res.json())
        .then((data) => {
          // Chỉ lấy lời mời gửi tới user hiện tại
          setInvitations(data.invitations || []);
        });
    }
  }, [userId]);

  const handleAccept = async (invitationId: string, teamId: string) => {
    try {
      // Kiểm tra xem user đã là thành viên chưa
      const membersRes = await fetch(`/api/teams/${teamId}`);
      const teamData = await membersRes.json();
      const isMember = teamData.team?.members?.some(
        (member: any) => member.memberId === userId
      );

      if (isMember) {
        Swal.fire("Thông báo", "Bạn đã là thành viên của nhóm này.", "info");
        setInvitations((prev) =>
          prev.filter((i) => i.invitationId !== invitationId)
        );

        const res = await fetch("/api/invitations/notifications", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invitationId: invitationId,
            status: "accepted",
          }),
        });
        if (!res.ok) throw new Error("Cập nhật thất bại");
        return;
      }

      // Cập nhật trạng thái invitation
      const res = await fetch("/api/invitations/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId: invitationId,
          status: "accepted",
        }),
      });
      if (!res.ok) throw new Error("Cập nhật thất bại");

      // Thêm user vào nhóm
      await fetch(`/api/teams/${teamId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: userId,
          memberName: user.fullName,
          email: user.email,
        }),
      });

      setInvitations((prev) =>
        prev.filter((i) => i.invitationId !== invitationId)
      );
      Swal.fire("Thành công!", "Bạn đã tham gia nhóm.", "success");
      if (typeof onJoined === "function") onJoined();
    } catch (error) {
      console.error(error);
      Swal.fire("Lỗi!", "Không thể tham gia nhóm.", "error");
    }
  };

  const handleDecline = async (invitationId: string) => {
    try {
      await fetch("/api/invitations/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId, status: "declined" }),
      });
      setInvitations((prev) =>
        prev.filter((i) => i.invitationId !== invitationId)
      );
    } catch (error) {
      console.error(error);
      Swal.fire("Lỗi!", "Không thể từ chối lời mời.", "error");
    }
  };

  return (
    <div>
      <button
        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 transition relative cursor-pointer"
        aria-label="Thông báo lời mời tham gia nhóm"
        onClick={() => setShow((prev) => !prev)}
      >
        <FaBell />

        {invitations.length > 0 && (
          <span className="absolute top-[-10px] right-[-5px] bg-red-500 text-white text-xs rounded-full px-2 py-1">
            {invitations.length}
          </span>
        )}
      </button>
      {show && (
        <div className="p-4 bg-white shadow-lg rounded-lg absolute right-4 top-16 z-50 min-w-[400px]">
          <h2 className="text-black text-xl font-bold mb-4">
            Thông báo lời mời tham gia nhóm
          </h2>
          <table className="table-auto w-full border border-gray-300 text-left">
            <thead className="bg-gray-100 text-black text-center">
              <tr>
                <th className="px-4 py-2 border-b">Nhóm</th>
                <th className="px-4 py-2 border-b">Người mời</th>
                <th className="px-4 py-2 border-b">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-black">
              {invitations.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-400">
                    Không có lời mời nào
                  </td>
                </tr>
              ) : (
                invitations.map((inv) => (
                  <tr
                    key={inv.invitationId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-2 border-b">{inv.teamName}</td>
                    <td className="px-4 py-2 border-b">{inv.inviterName}</td>
                    <td className="px-4 py-2 border-b flex gap-2">
                      <button
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-700 transition cursor-pointer"
                        onClick={() =>
                          handleAccept(inv.invitationId, inv.teamId)
                        }
                      >
                        Tham gia
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 transition cursor-pointer"
                        onClick={() => handleDecline(inv.invitationId)}
                      >
                        Từ chối
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
