import { FaArrowLeftLong, FaCloudArrowDown } from "react-icons/fa6";
import ParticlesBackground from "../ParticlesBackground";
import { Sider } from "../Sider/SiderMember";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "../Loading";
import { MemberItem } from "./MemberItem";

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

interface Member {
  memberId: string;
  memberName: string;
  email: string;
  role: string;
}

interface Team {
  teamId: string;
  teamName: string;
  memberQuantity: number;
  projectId?: string;
  createdAt: string;
  members: Member[];
  userId: string;
}

export const TeamDetail = (props: { teamId: string }) => {
  const { teamId } = props;
  const [loading, setLoading] = useState(true);
  const [loadSkeleton, setLoadSkeleton] = useState(true);
  const [team, setTeam] = useState<Team | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
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

  useEffect(() => {
    const fetchProject = async () => {
      setLoadSkeleton(true);
      try {
        const teamRes = await fetch(`/api/teams/${teamId}`);
        const teamData = await teamRes.json();
        setTeam(teamData.team);
        setMembers(teamData.team.members || []);
        console.log("Team Data:", teamData);
        console.log("Members:", teamData.members);
        const projectId = teamData.team?.projectId;
        if (projectId) {
          const projectRes = await fetch(`/api/projects/${projectId}`);
          const projectData = await projectRes.json();
          setProject(projectData.project);
        } else {
          setProject(null);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        setProject(null);
        setTeam(null);
        setMembers([]);
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

  const user = localStorage.getItem("user");
  const userData = user ? JSON.parse(user) : null;
  const userId = userData?.userId;

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
          <h2 className="text-2xl font-bold mb-2">
            <strong>Tên nhóm:</strong>{" "}
            {loadSkeleton ? (
              <span className="skeleton w-[50px] h-[20px] bg-gray-300 animate-pulse"></span>
            ) : (
              <span className="text-black">{team?.teamName || ""}</span>
            )}
          </h2>
          <p className="mb-2 text-gray-500 text-[20px]">
            <strong>Số lượng tối đa:</strong>{" "}
            {loadSkeleton ? (
              <span className="skeleton w-[50px] h-[20px] bg-gray-300 animate-pulse"></span>
            ) : (
              <span className="text-black">
                {team?.memberQuantity ?? ""} thành viên
              </span>
            )}
          </p>
          <p className="inner-team mb-2 text-gray-500 text-[20px]">
            <strong>Dự án đang triển khai:</strong>{" "}
            {loadSkeleton ? (
              <span className="skeleton w-[150px] h-[20px] bg-gray-300 animate-pulse"></span>
            ) : (
              <span className="text-black">{project?.projectName || ""}</span>
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
            <strong>Danh sách thành viên đang hoạt động:</strong>{" "}
            <span className="text-black">
              {members.length} thành viên
            </span>
          </p>

          <div className="task-list mb-4">
            <div className="overflow-x-auto">
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                <table className="table text-black border border-gray-300 w-full">
                  <thead className="bg-gray-200 text-black text-center">
                    <tr>
                      <th>ID</th>
                      <th>Họ và tên</th>
                      <th>Email</th>
                      <th>Vai trò</th>
                      <th>Hành động</th>
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
                          </tr>
                        ))
                      : members.length > 0 ? (
                          members.map((member, index) => (
                            <MemberItem
                              key={index}
                              member={member}
                              teamId={teamId}
                              onDeleted={() => {
                                setMembers((prevMembers) =>
                                  prevMembers.filter((m) => m.memberId !== member.memberId)
                                );
                              }}
                              isOwner={userId === team?.userId}
                            />
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="text-center text-gray-500">
                              Không có thành viên nào trong nhóm.
                            </td>
                          </tr>
                        )}
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
