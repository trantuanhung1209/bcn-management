"use client";

import { useEffect, useState } from "react";
import Loading from "../../Loading";
import ParticlesBackground from "../../ParticlesBackground";
import { Sider } from "../../Sider/Sider";
import { FormCreateProject } from "./FormCreateProject";
import { ViewListTask } from "./ViewListProjects";
import { FormEditProject } from "./FormEditProject";
import { useRouter } from "next/navigation";


export const ProjectManagementAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [showFormCreate, setShowFormCreate] = useState(false);  
  const [showTask, setShowTask] = useState(true);
  const [showFormEdit, setShowFormEdit] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const router = useRouter();

  // Kiểm tra đăng nhập
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
    }
  }, [router]);

  const handleOpenFormCreate = () => {
    setShowFormCreate(true);
    setShowTask(false);
  };

  const handleOpenTask = () => {
    setShowTask(true);
    setShowFormCreate(false);
    setShowFormEdit(false);
    setEditingProjectId(null);
  };

  const handleOpenFormEdit = (projectId: string) => {
    setEditingProjectId(projectId);
    setShowFormEdit(true);
    setShowTask(false);
    setShowFormCreate(false);
  };

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
          {showTask && <ViewListTask onCreateClick={handleOpenFormCreate} onEditClick={handleOpenFormEdit} />}
          {showFormCreate && <FormCreateProject cancelClick={handleOpenTask} />}
          {showFormEdit && <FormEditProject projectId={editingProjectId} cancelClick={handleOpenTask} />}
        </div>
      </div>
    </>
  );
};
