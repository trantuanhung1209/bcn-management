"use client";
import { useEffect, useState } from "react";
import ParticlesBackground from "../ParticlesBackground";
import { Sider } from "../Sider/SiderMember";
import { ViewListTeam } from "./ViewListTeam";
import { useRouter } from "next/navigation";
import Loading from "../Loading";
import { Notification } from "../Notification";

export const TeamManagementMember = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Kiểm tra đăng nhập
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleReload = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

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
            <Notification onJoined={handleReload} />
          </div>
          <ViewListTeam />
        </div>
      </div>
    </>
  );
};
