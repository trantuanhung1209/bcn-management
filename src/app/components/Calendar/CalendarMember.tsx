"use client";

import { useEffect, useState } from "react";
import Loading from "../Loading";
import ParticlesBackground from "../ParticlesBackground";
import { Sider } from "../Sider/SiderMember";
import { useRouter } from "next/navigation";
import { Notification } from "../Notification";

export const CalendarMember = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
    }
  }, [router]);

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
            Member Actions Calendar
          </h2>
        </div>
      </div>
    </>
  );
};
