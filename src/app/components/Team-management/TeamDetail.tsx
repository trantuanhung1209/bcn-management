import { FaArrowLeftLong, FaCloudArrowDown } from "react-icons/fa6";
import ParticlesBackground from "../ParticlesBackground";
import { Sider } from "../Sider/SiderMember";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "../Loading";
import { TaskItem } from "../Project-management/member/TaskItem";

interface Task {
  id?: string;
  description: string;
  deadline: string;
  content: string;
}

interface Project {
  projectName: string;
  projectType: string;
  projectLevel: string;
  projectDeadline: string;
  projectDescription: string;
  fileName: string;
  fileUrl: string;
  tasks: Task[];
  projectStatus: string;
  projectId: string;
}

interface Team {
  teamId: string;
  teamName: string;
  memberQuantity: number;
  projectId?: string; // Thêm trường projectId để lấy thông tin dự án
}

export const TeamDetail = (props: { teamId: string }) => {
  const { teamId } = props;
  const [loading, setLoading] = useState(true);
  const [loadSkeleton, setLoadSkeleton] = useState(true);
  const [team, setTeam] = useState<Team | null>(null); // Thêm state cho team
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
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

  // Lấy team và project theo teamId
  useEffect(() => {
    const fetchProject = async () => {
      setLoadSkeleton(true);
      try {
        // Gọi API lấy team để lấy projectId và thông tin nhóm
        const teamRes = await fetch(`/api/teams/${teamId}`);
        const teamData = await teamRes.json();
        setTeam(teamData.team); // Lưu thông tin nhóm
        const projectId = teamData.team?.projectId;
        if (projectId) {
          // Gọi API lấy project theo projectId
          const projectRes = await fetch(`/api/projects/${projectId}`);
          const projectData = await projectRes.json();
          setProject(projectData.project);
          setTasks(projectData.project?.tasks || []);
        } else {
          setProject(null);
          setTasks([]);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        setProject(null);
        setTasks([]);
        setTeam(null);
      }
      setLoadSkeleton(false);
    };
    if (teamId) fetchProject();
  }, [teamId]);

  if (loading) {
    return <Loading />;
  }

  const handleComeback = () => {
    router.push("/team-management");
  };

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
          {/* Hiển thị thông tin nhóm */}
          <h2 className="text-2xl font-bold mb-2">
            {loadSkeleton ? (
              <span className="skeleton w-[200px] h-[32px] bg-gray-300 animate-pulse"></span>
            ) : (
              <>Tên nhóm: <span className="text-black">{team?.teamName}</span></>
            )}
          </h2>
          <p className="mb-2 text-gray-500 text-[20px]">
            <strong>Số lượng thành viên:</strong>{" "}
            {loadSkeleton ? (
              <span className="skeleton w-[50px] h-[20px] bg-gray-300 animate-pulse"></span>
            ) : (
              <span className="text-black">{team?.memberQuantity}</span>
            )}
          </p>
          <p className="inner-team mb-2 text-gray-500 text-[20px]">
            <strong>Dự án đang triển khai:</strong>{" "}
            {loadSkeleton ? (
              <span className="skeleton w-[150px] h-[20px] bg-gray-300 animate-pulse"></span>
            ) : (
              <span className="text-black">{project?.projectName}</span>
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
                            projectId={project?.projectId || ""}
                          />
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
