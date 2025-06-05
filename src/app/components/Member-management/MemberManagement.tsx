"use client";

import { useEffect, useState } from "react";
import ParticlesBackground from "../ParticlesBackground";
import { Sider } from "../Sider/Sider";
import { FaArrowLeftLong } from "react-icons/fa6";
import { GiCrossMark } from "react-icons/gi";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

interface User {
  fullName: string;
  userName: string;
  email: string;
  password?: string;
  status: string;
  userId: string;
  createdAt?: string;
  isActive?: boolean;
}

export const MemberManagement = () => {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/users?role=member");
      const data = await res.json();
      setMembers(data.users || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch  users:", error);
    }
  };

  const handleReject = async (userId: string) => {
    const confirm = await Swal.fire({
      title: "Bạn có chắc muốn xoá thành viên này?",
      text: "Thao tác này sẽ xóa tài khoản khỏi hệ thống!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (confirm.isConfirmed) {
      try {
        // Đổi trạng thái sang "rejected"
        const res = await fetch("/api/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, status: "rejected" }),
        });
        if (res.ok) {
          // Xoá user khỏi database
          await fetch("/api/users", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          });
          // Cập nhật lại danh sách members
          setMembers((prev) => prev.filter((u) => u.userId !== userId));
          await fetchMembers();
          Swal.fire("Đã xóa!", "Tài khoản đã bị xóa.", "success");
        }
      } catch (error) {
        console.error("Reject failed:", error);
        Swal.fire("Lỗi!", "Có lỗi xảy ra khi xóa.", "error");
      }
    }
  };

  const handleComeback = () => {
    router.push("/home/admin");
  };

  return (
    <>
      <ParticlesBackground />
      <div className="ml-[240px]">
        <Sider />
        <div className="inner-line py-[30px] border-b border-gray-400"></div>
        <div className="inner-content flex-1 rounded-lg shadow-md">
          <div className="inner-comeback p-[20px]">
            <button
              className="btn-comeback flex items-center px-4 py-2 bg-gray-200 text-black rounded-lg shadow-md hover:bg-gray-300 transition-colors duration-300 cursor-pointer"
              onClick={handleComeback}
            >
              <FaArrowLeftLong className="text-[20px] mr-2" />
              Quay lại
            </button>
          </div>
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Danh sách thành viên chờ phê duyệt
          </h1>
          <div className="inner-list">
            <table className="min-w-full border border-gray-300 text-gray-600 text-center">
              <thead>
                <tr>
                  <th className="px-4 py-2">Họ và tên</th>
                  <th className="px-4 py-2">Tên đăng nhập</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Ngày đăng ký</th>
                  <th className="px-4 py-2">Trạng thái</th>
                  <th className="px-4 py-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5}>Đang tải...</td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={5}>Không có thành viên</td>
                  </tr>
                ) : (
                  members.map((user) => (
                    <tr key={user.userId}>
                      <td className="border border-gray-300 px-4 py-2">
                        {user.fullName}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {user.userName}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {user.email}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                          : ""}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <p
                          className={
                            "font-semibold px-2 py-1 rounded " +
                            (user.isActive
                              ? " text-green-600"
                              : " text-gray-500")
                          }
                        >
                          {user.isActive ? "Đang hoạt động" : "Chưa hoạt động"}
                        </p>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 flex justify-center items-center">
                        <button
                          className="text-red-500 hover:underline ml-4 flex items-center bg-[#f0f0f0] px-2 py-1 rounded cursor-pointer hover:bg-[#e0e0e0]"
                          onClick={() => handleReject(user.userId)}
                        >
                          <GiCrossMark className="inline mr-1" />
                          Xoá tài khoản
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};
