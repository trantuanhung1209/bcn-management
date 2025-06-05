"use client";

import { useEffect, useState } from "react";
import Loading from "../Loading";
import ParticlesBackground from "../ParticlesBackground";
import { Sider } from "../Sider/SiderMember";
import { useRouter } from "next/navigation";


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
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Member Actions Home</h2>
        </div>
      </div>
    </>
  );
};
