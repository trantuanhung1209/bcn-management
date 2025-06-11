"use client";

import { useEffect, useState } from "react";
import Loading from "../Loading";
import ParticlesBackground from "../ParticlesBackground";
import { Sider } from "../Sider/SiderMember";
import { useRouter } from "next/navigation";
import { Notification } from "../Notification";

export const HomeMember = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <ParticlesBackground />
      <div className="ml-[240px]">
        <Sider />
        <div className="inner-content flex-1 rounded-lg shadow-md">
          <div className="inner-line py-[30px] border-b border-gray-400 flex justify-end items-center pr-[20px]">
            <Notification />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Member Actions Home
          </h2>
        </div>
      </div>
    </>
  );
};
