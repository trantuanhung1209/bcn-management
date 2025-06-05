"use client";

import { useEffect, useState } from "react";
import Loading from "../Loading";
import ParticlesBackground from "../ParticlesBackground";
import { Sider } from "../Sider/Sider";
import { useRouter } from "next/navigation";

interface User {
  fullName: string;
  userName: string;
  role: string;
  password?: string;
  email: string;
  status: string;
  userId: string;
  createdAt?: string;
}

export const HomeAdmin = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [members, setMembers] = useState<User[]>([]);

  // Kiểm tra đăng nhập
  useEffect(() => {
    const isLogin = localStorage.getItem("isLogin");
    if (isLogin !== "true") {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      const res = await fetch("/api/users");
      const data = await res.json();
      setMembers(data.users || []);
    };
    fetchMembers();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <ParticlesBackground />
      <div className="ml-[240px]">
        <Sider />
        <div className="inner-line py-[30px] border-b border-gray-400"></div>
        <div className="inner-content flex-1 rounded-lg shadow-md">
          <div className="inner-wrap grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[20px] p-[20px] text-black ">
            <div className="inner-items bg-[#ffffff] p-[20px] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer">
              <h3 className="text-[20px] font-bold">
                Tổng dự án đang hoạt động
              </h3>
              <p className="quantity text-[24px] font-bold">10</p>
            </div>
            <div className="inner-items bg-[#ffffff] p-[20px] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => {
                router.push("/member-management");
              }}
            >
              <h3 className="text-[20px] font-bold">Tổng số thành viên</h3>
              <p className="quantity text-[24px] font-bold text-green-700">
                {members.filter((member) => member.role === "member").length}
              </p>
            </div>
            <div className="inner-items bg-[#ffffff] p-[20px] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer">
              <h3 className="text-[20px] font-bold">
                Tổng số dự án đã hoàn thành
              </h3>
              <p className="quantity text-[24px] font-bold">10</p>
            </div>
            <div
              className="inner-items bg-[#ffffff] p-[20px] rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300"
              onClick={() => {
                router.push("/pending");
              }}
            >
              <h3 className="text-[20px] font-bold">
                Thành viên chờ phê duyệt
              </h3>
              <p className="quantity text-[24px] font-bold text-[#E60000]">
                {members.filter((member) => member.status === "pending").length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
