"use client";

import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { TeamItem } from "./TeamItem";
import { CreateTeam } from "./CreateTeam";

interface Team {
  teamName: string;
  projectName?: string;
  memberQuantity: number;
  memberIds: string[];
  teamId: string;
  createdAt: string;
  deadline: string;
}
export const ViewListTeam = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/teams");
      const data = await response.json();
      setTeams(data.teams || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReload = () => {
    fetchData();
  };

  return (
    <>
      <div className="inner-content p-[20px]">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Danh sách nhóm của bạn
        </h2>
        <div className="inner-wrap grid grid-cols-4 gap-[16px] p-[32px]">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
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
            : teams.map((team) => <TeamItem key={team.teamId} team={team} />)}
        </div>
        <CreateTeam onSuccess={handleReload} />
      </div>
    </>
  );
};
