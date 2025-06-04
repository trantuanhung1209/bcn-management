"use client";

import { useEffect, useState } from "react";
import Loading from "../../Loading";
import ParticlesBackground from "../../ParticlesBackground";
import { Sider } from "../../Sider/Sider";
import { ViewListTask } from "./ViewListProjects";

export const ProjectManagementMember = () => {
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
        <div className="inner-content rounded-lg shadow-md ">
          <div className="inner-line py-[30px] border-b border-gray-400"></div>
          <ViewListTask />
        </div>
      </div>
    </>
  );
};
