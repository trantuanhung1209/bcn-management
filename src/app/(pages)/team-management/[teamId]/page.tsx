"use client";
import React from "react";
import { useParams } from "next/navigation";
import { TeamDetail } from "@/app/components/Team-management/TeamDetail";

export default function ProjectPage() {
  const params = useParams();
  const teamId = params?.teamId as string | undefined;

  if (!teamId) {
    return <div>Không tìm thấy mã nhóm!</div>;
  }

  return (
    <>
      <TeamDetail teamId={teamId} />
    </>
  );
}
