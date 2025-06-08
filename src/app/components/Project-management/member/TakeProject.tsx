import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

interface Team {
  teamId: string;
  teamName: string;
  projectId?: string;
}

export const TakeProject = (props: {
  projectId: string;
  checkTeamId: string;
}) => {
  const { projectId, checkTeamId } = props;
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Lấy userId từ localStorage nếu cần lọc theo user
    const user = localStorage.getItem("user");
    const userId = user ? JSON.parse(user).userId : null;
    fetch(`/api/teams${userId ? `?userId=${userId}` : ""}`)
      .then((res) => res.json())
      .then((data) => setTeams(data.teams || []));
  }, []);

  const handleTakeProject = () => {
    if (!selectedTeamId) {
      Swal.fire("Thông báo", "Vui lòng chọn nhóm để nhận dự án.", "warning");
      return;
    }

    // Kiểm tra team đã có projectId chưa
    const selectedTeam = teams.find((team) => team.teamId === selectedTeamId);
    if (selectedTeam && selectedTeam.projectId) {
      Swal.fire(
        "Lỗi!",
        "Nhóm này đã nhận một dự án khác. Vui lòng chọn nhóm khác.",
        "error"
      );
      return;
    }

    // Cập nhật project với teamId và projectStatus
    fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectStatus: "Đang triển khai",
        teamId: selectedTeamId,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to take project");
        }
        return res.json();
      })
      .then(() => {
        // Cập nhật team với projectId
        return fetch(`/api/teams/${selectedTeamId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ projectId }),
        });
      })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to update team with projectId");
        }
        return res.json();
      })
      .then(() => {
        Swal.fire("Thành công!", "Dự án đã được nhận thành công!", "success");
        setSelectedTeamId(""); // Reset selection
        router.push(`/team-management/${selectedTeamId}`); // Redirect to project detail
      })
      .catch((error) => {
        console.error("Error taking project:", error);
        Swal.fire(
          "Lỗi!",
          "Có lỗi xảy ra khi nhận dự án. Vui lòng thử lại sau.",
          "error"
        );
      });
  };

  return (
    <>
      {checkTeamId ? (
        " "
      ) : (
        <div className="inner-actions flex justify-end gap-[10px] p-[20px] text-black">
          <div className="relative w-[200px]">
            <select
              className="appearance-none w-full py-[14px] px-[20px] border border-[#424242] text-black text-[16px] rounded-lg shadow-md transition-colors duration-300 cursor-pointer outline-none focus:ring-2 focus:ring-[#ccc] relative line-clamp-1"
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
            >
              <option value="">Chọn nhóm</option>
              {teams.map((team) => (
                <option key={team.teamId} value={team.teamId}>
                  {team.teamName}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              <FaChevronDown className="inline-block" />
            </span>
          </div>
          <button
            className="py-[14px] px-[20px] bg-[#424242] text-white text-[16px] rounded-lg shadow-md hover:bg-[#1a1a1a] transition-colors duration-300 cursor-pointer transform hover:scale-105 active:scale-95 ease-in-out"
            onClick={handleTakeProject}
          >
            Nhận dự án
          </button>
        </div>
      )}
    </>
  );
};
