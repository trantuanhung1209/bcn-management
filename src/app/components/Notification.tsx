import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { FaBell } from "react-icons/fa6";

interface Invitation {
  invitationId: string;
  teamName: string;
  inviterName: string;
  status: string;
  teamId: string;
  type: string;
  message: string;
  createdAt: string;
  notificationId: string;
  inviterId: string;
  inviteeId: string;
}

export const Notification = ({ onJoined }: { onJoined?: () => void }) => {
  const [notifications, setNotifications] = useState<Invitation[]>([]);
  const [show, setShow] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Ẩn popup khi click ra ngoài
  useEffect(() => {
    if (!show) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show]);

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : {};
  const userId = user.userId;

  useEffect(() => {
    if (userId) {
      fetch(`/api/notifications`)
        .then((res) => res.json())
        .then((data) => {
          const filtered = (data.notifications || []).filter(
            (noti: any) =>
              noti.inviteeId === userId && noti.inviterId !== userId
          );
          setNotifications(filtered);
          console.log("Notifications:", data);
        });
    }
  }, [userId]);

  // user xác nhận lời mời tham gia nhóm
  const handleAccept = async (
    notificationId: string,
    teamId: string,
  ) => {
    try {
      // Kiểm tra xem user đã là thành viên chưa
      const membersRes = await fetch(`/api/teams/${teamId}`);
      const teamData = await membersRes.json();
      const isMember = teamData.team?.members?.some(
        (member: any) => member.memberId === userId
      );

      if (isMember) {
        Swal.fire("Thông báo", "Bạn đã là thành viên của nhóm này.", "info");
        setNotifications((prev) =>
          prev.filter((i) => i.notificationId !== notificationId)
        );

        const res = await fetch("/api/notifications", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notificationId: notificationId,
            status: "accepted",
          }),
        });
        if (!res.ok) throw new Error("Cập nhật thất bại");
        return;
      }

      // Cập nhật trạng thái invitation
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationId: notificationId,
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

      setNotifications((prev) =>
        prev.filter((i) => i.notificationId !== notificationId)
      );
      Swal.fire("Thành công!", "Bạn đã tham gia nhóm.", "success");
      if (typeof onJoined === "function") onJoined();

      // gửi thông báo đến người mời
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationId: new Date().getTime().toString(),
          type: "join-request-accepted",
          teamName: teamData.team.teamName,
          teamId: teamId,
          inviterId: userId,
          inviterName: user.fullName,
          inviteeId: teamData.team.userId, // Người mời là chủ sở hữu nhóm
          message: `đã xác nhận tham gia nhóm`,
        }),
      });
    } catch (error) {
      console.error(error);
      Swal.fire("Lỗi!", "Không thể tham gia nhóm.", "error");
    }
  };

  // leader xác nhận user tham gia nhóm
  const handleConfirm = async (
    notificationId: string,
    teamId: string,
    memberId: string,
    teamName: string
  ) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, status: "confirmed" }),
      });
      setNotifications((prev) =>
        prev.filter((i) => i.notificationId !== notificationId)
      );
    } catch (error) {
      console.error(error);
      Swal.fire("Lỗi!", "Không thể xác nhận lời mời.", "error");
    }

    // Thêm user vào nhóm
    await fetch(`/api/teams/${teamId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId: memberId,
        memberName: user.fullName,
        email: user.email,
      }),
    });
    Swal.fire(
      "Thành công!",
      "Bạn đã xác nhận thành viên tham gia nhóm.",
      "success"
    );
    if (typeof onJoined === "function") onJoined();
    setShow(false);
    setNotifications((prev) =>
      prev.filter((i: any) => i.notificationId !== notificationId)
    );

    // gửi thông báo đến người mời
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notificationId: new Date().getTime().toString(),
        type: "join-request-confirmed",
        teamName: teamName,
        teamId: teamId,
        inviterId: userId,
        inviterName: user.fullName,
        inviteeId: memberId, // Người mời là người gửi yêu cầu
        message: `đã phê duyệt yêu cầu tham gia nhóm`,
      }),
    });
  };

  // user từ chối lời mời tham gia nhóm
  const handleDecline = async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, status: "cancelled" }),
      });
      setNotifications((prev) =>
        prev.filter((i: any) => i.notificationId !== notificationId)
      );
    } catch (error) {
      console.error(error);
      Swal.fire("Lỗi!", "Không thể từ chối lời mời.", "error");
    }
  };

  return (
    <div>
      <button
        ref={bellRef}
        className={
          "bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 transition relative cursor-pointer" +
          (show ? " bg-gray-700" : "")
        }
        aria-label="Thông báo lời mời tham gia nhóm"
        onClick={() => setShow((prev) => !prev)}
      >
        <FaBell />

        {notifications.length > 0 && (
          <span className="absolute top-[-10px] right-[-5px] bg-red-500 text-white text-xs rounded-full px-2 py-1">
            {notifications.length}
          </span>
        )}
      </button>
      {show && (
        <div
          ref={popupRef}
          className="p-4 bg-white shadow-lg rounded-lg absolute right-4 top-16 z-50 min-w-[400px]"
        >
          <h2 className="text-black text-xl font-bold mb-4">Thông báo</h2>
          <table className="table-auto w-full text-left">
            <tbody className="text-black">
              {notifications.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-400">
                    Không có thông báo nào
                  </td>
                </tr>
              ) : (
                [...notifications].reverse().map((noti, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-100 transition-colors"
                  >
                    <td className="px-4 py-[10px] rounded-[12px] max-w-[500px] border-b border-gray-300 max-h-[400px] overflow-y-auto">
                      <div className="text-gray-800 w-full mb-[10px]">
                        <strong>{noti.inviterName}</strong> {noti.message}{" "}
                        <strong>{noti.teamName}</strong>
                      </div>
                      <div className="inner-noti-actions flex gap-2 items-center">
                        {noti.type === "team-invitation" && (
                          <>
                            <button
                              className="py-[3px] px-[10px] bg-[#2d2d2d] text-white text-[16px] rounded-lg shadow-md hover:bg-[#1a1a1a] transition-colors duration-300 cursor-pointer transform hover:scale-105 active:scale-95 ease-in-out"
                              onClick={() =>
                                handleAccept(
                                  noti.notificationId,
                                  noti.teamId,
                                )
                              }
                            >
                              Tham gia
                            </button>
                            <button
                              className="py-[3px] px-[10px] bg-[#807f7f] text-white text-[16px] rounded-lg shadow-md hover:bg-[#717171] transition-colors duration-300 cursor-pointer transform hover:scale-105 active:scale-95 ease-in-out"
                              onClick={() => handleDecline(noti.notificationId)}
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                        {noti.type === "join-request" && (
                          <>
                            <button
                              className="py-[3px] px-[10px] bg-[#2d2d2d] text-white text-[16px] rounded-lg shadow-md hover:bg-[#1a1a1a] transition-colors duration-300 cursor-pointer transform hover:scale-105 active:scale-95 ease-in-out"
                              onClick={() =>
                                handleConfirm(
                                  noti.notificationId,
                                  noti.teamId,
                                  noti.inviterId,
                                  noti.teamName
                                )
                              }
                            >
                              Xác nhận
                            </button>
                            <button
                              className="py-[3px] px-[10px] bg-[#807f7f] text-white text-[16px] rounded-lg shadow-md hover:bg-[#717171] transition-colors duration-300 cursor-pointer transform hover:scale-105 active:scale-95 ease-in-out"
                              onClick={() => handleDecline(noti.notificationId)}
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                        {/* {noti.type === "join-request-accepted" && (
                          <div className="text-gray-800 w-full mb-[10px]">
                            <strong>{noti.inviterName}</strong> {noti.message}{" "}
                            <strong>{noti.teamName}</strong>
                          </div>
                        )} */}
                        {/* {noti.type === "join-request-confirmed" && (
                          <div className="text-gray-800 w-full mb-[10px]">
                            <strong>{noti.inviterName}</strong> {noti.message}{" "}
                            <strong>{noti.teamName}</strong>
                          </div>
                        )} */}
                      </div>
                    </td>
                  </tr>
                ))
              )}
              <tr className="mt-2">
                <td colSpan={3} className="text-gray-500 text-center py-[10px] text-[12px] hover:text-gray-700 cursor-pointer">
                  Xem tất cả thông báo
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
