"use client";

import { useEffect, useState } from "react";
import Loading from "../Loading";
import ParticlesBackground from "../ParticlesBackground";
import { Sider } from "../Sider/Sider";


export const HomeAdmin = () => {

  const [loading, setLoading] = useState(true);

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
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Admin Actions Home</h2>
        </div>
      </div>
    </>
  );
};
