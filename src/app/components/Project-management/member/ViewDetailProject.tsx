"use client";

import Loading from "../../Loading";
import ParticlesBackground from "../../ParticlesBackground";
import { Sider } from "../../Sider/SiderMember";
import { useEffect, useState } from "react";
import { FaArrowLeftLong, FaCloudArrowDown } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { TaskItem } from "./TaskItem";
import { TakeProject } from "./TakeProject";

interface ViewDetailProjectProps {
  projectId: string;
}

interface Task {
  id?: string;
  description: string;
  deadline: string;
  content: string;
}
interface Project {
  projectId: string;
  projectName: string;
  projectType: string;
  projectLevel: string;
  projectDeadline: string;
  projectDescription: string;
  fileName: string;
  fileUrl: string;
  tasks: Task[];
  projectStatus: string;
  teamId: string;
}

interface Team {
  teamId: string;
  teamName: string;
  memberQuantity: number;
  createdAt: string;
  projectId?: string;
  deadline?: string;
}

export const ViewDetailProject = (props: ViewDetailProjectProps) => {
  const { projectId } = props;
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const router = useRouter();
  const [loadSkeleton, setLoadSkeleton] = useState(true);
  const [team, setTeam] = useState<Team | null>(null);

  // Kiểm tra đăng nhập
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (project?.teamId) {
      fetch(`/api/teams/${project.teamId}`)
        .then((res) => res.json())
        .then((data) => setTeam(data.team));
    }
  }, [project?.teamId]);

  useEffect(() => {
    if (projectId) {
      fetch(`/api/projects/${projectId}`)
        .then((res) => res.json())
        .then((data) => {
          setProject(data.project);
          setTasks(data.project.tasks || []);
        })
        .then(() => {
          setLoadSkeleton(false);
          setLoading(false);
        });
    }
  }, [projectId]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleComeback = () => {
    router.push("/project-management");
  };

  if (loading) {
    return <Loading />;
  }

  if (!projectId) {
    return <div>Không tìm thấy mã dự án!</div>;
  }

  return (
    <>
      <ParticlesBackground />
      <div className="ml-[240px]">
        <Sider />
        <div className="inner-content rounded-lg shadow-md ">
          <div className="inner-line py-[30px] border-b border-gray-400"></div>
        </div>

        <div className="inner-comeback p-[20px]">
          <button
            className="btn-comeback flex items-center px-4 py-2 bg-gray-200 text-black rounded-lg shadow-md hover:bg-gray-300 transition-colors duration-300 cursor-pointer"
            onClick={handleComeback}
          >
            <FaArrowLeftLong className="text-[20px] mr-2" />
            Quay lại
          </button>
        </div>

        <div className="inner-project-detail p-[20px] text-black">
          <h2 className="inner-name flex items-center gap-[20px] mb-4 font-semibold text-[32px]">
            Tên dự án:{" "}
            {loadSkeleton ? (
              <span className="skeleton w-[200px] h-[32px] bg-gray-300 animate-pulse"></span>
            ) : (
              <span className="text-black">{project?.projectName}</span>
            )}
          </h2>
          <p className="inner-team mb-2 text-gray-500 text-[20px]">
            <strong>Nhóm thực hiện:</strong>{" "}
            {loadSkeleton ? (
              <span className="skeleton w-[150px] h-[20px] bg-gray-300 animate-pulse"></span>
            ) : (
              <span className="text-black">{team?.teamName}</span>
            )}
          </p>
          <p className="inner-type mb-2 text-gray-500 text-[20px]">
            <strong>Tình trạng:</strong>{" "}
            {loadSkeleton ? (
              <span className="skeleton w-[100px] h-[20px] bg-gray-300 animate-pulse"></span>
            ) : (
              <span
                className={
                  project?.projectStatus === "Đang triển khai"
                    ? "text-[#C39500]"
                    : project?.projectStatus === "Đã hoàn thành"
                    ? "text-green-600"
                    : "text-[#E60000 ]"
                }
              >
                {project?.projectStatus}
              </span>
            )}
          </p>
          <p className="project-file flex items-center gap-[20px] text-gray-500 text-[20px] mb-4">
            <strong>Tệp đính kèm:</strong>{" "}
            {loadSkeleton ? (
              <span className="skeleton w-[150px] h-[20px] bg-gray-300 animate-pulse"></span>
            ) : (
              <>
                {project?.fileUrl ? (
                  <a
                    href={project.fileUrl}
                    className="text-black hover:underline flex items-center"
                    download={project.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {project.fileName}{" "}
                    <FaCloudArrowDown className="inline-block ml-1" />
                  </a>
                ) : (
                  <span className="text-black">Không có tệp đính kèm</span>
                )}
              </>
            )}
          </p>
          <p className="project-list text-gray-500 text-[20px] mb-4">
            <strong>Danh sách nhiệm vụ:</strong>{" "}
            <span className="text-black">{tasks.length} nhiệm vụ</span>
          </p>

          <div className="task-list mb-4">
            <div className="overflow-x-auto">
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                <table className="table text-black border border-gray-300 w-full">
                  <thead className="bg-gray-200 text-black">
                    <tr>
                      <th>ID</th>
                      <th>Mô tả </th>
                      <th>Thời hạn</th>
                      <th>Nội dung yêu cầu</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-300 text-gray-700">
                    {loadSkeleton
                      ? Array.from({ length: 5 }).map((_, index) => (
                          <tr key={index} className="animate-pulse">
                            <td>
                              <span className="skeleton w-[50px] h-[20px] bg-gray-300"></span>
                            </td>
                            <td>
                              <span className="skeleton w-[150px] h-[20px] bg-gray-300"></span>
                            </td>
                            <td>
                              <span className="skeleton w-[100px] h-[20px] bg-gray-300"></span>
                            </td>
                            <td>
                              <span className="skeleton w-[200px] h-[20px] bg-gray-300"></span>
                            </td>
                            <td>
                              <span className="skeleton w-[100px] h-[20px] bg-gray-300"></span>
                            </td>
                            <td></td>
                          </tr>
                        ))
                      : tasks.map((task, index) => (
                          <TaskItem
                            key={index}
                            task={task}
                            index={index}
                            projectId={projectId}
                          />
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <TakeProject
          projectId={projectId}
          checkTeamId={project?.teamId || ""}
        />
      </div>
    </>
  );
};
