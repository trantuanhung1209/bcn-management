"use client";

import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { TeamItem } from "./TeamItem";
import { CreateTeam } from "./CreateTeam";
import { JoinTeam } from "./JoinTeam";

interface Team {
  teamName: string;
  projectName?: string;
  memberQuantity: number;
  memberIds: string[];
  teamId: string;
  createdAt: string;
  deadline: string;
  userId: string;
}
export const ViewListTeam = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination trên danh sách đã lọc
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const totalPages = Math.ceil(teams.length / pageSize);

  const paginatedTeams = teams.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const user = localStorage.getItem("user");
      if (!user) {
        console.error("User not found in localStorage");
        setTeams([]);
        setLoading(false);
        return;
      }
      const userData = JSON.parse(user);
      const response = await fetch(
        `/api/teams?userId=${userData.userId.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch teams");
      }
      const data = await response.json();
      setTeams(data.teams || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReload = () => {
    fetchData();
  };

  const user = localStorage.getItem("user");
  const userData = user ? JSON.parse(user) : null;
  const userId = userData?.userId;

  return (
    <>
      <div className="inner-content p-[20px]">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Danh sách nhóm của bạn
        </h2>
        <div className="inner-wrap grid grid-cols-4 gap-[16px] p-[32px]">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-white p-[20px] rounded-lg shadow-md flex flex-col items-center justify-center"
              >
                <Skeleton height={40} width={200} className="mb-4" />
                <Skeleton height={20} width={150} className="mb-2" />
                <Skeleton height={20} width={100} className="mb-2" />
                <Skeleton height={20} width={80} />
              </div>
            ))
          ) : paginatedTeams.length > 0 ? (
            paginatedTeams.map((team) => (
              <TeamItem
                key={team.teamId}
                team={team}
                onDeleted={handleReload}
                onEdited={handleReload}
                isOwner={team.userId === userId}
              />
            ))
          ) : (
            <div className="col-span-4 text-center text-gray-500">
              Không có nhóm nào được tạo.
            </div>
          )}
        </div>

        <div className="inner-pagination mt-4 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              className={`join-item btn ${
                currentPage === idx + 1
                  ? "bg-gray-700 text-white font-bold border border-gray-700"
                  : "bg-white text-black"
              }`}
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        <div className="flex justify-end mt-[20px] gap-[30px]">
          <JoinTeam onSuccess={handleReload} />
          <CreateTeam onSuccess={handleReload} />
        </div>
      </div>
    </>
  );
};
