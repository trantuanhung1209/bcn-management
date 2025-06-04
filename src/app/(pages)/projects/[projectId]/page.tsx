"use client";
import React from "react";
import { ViewDetailProject } from "@/app/components/Project-management/member/ViewDetailProject";
import { useParams } from "next/navigation";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params?.projectId as string | undefined;

  if (!projectId) {
    return <div>Không tìm thấy mã dự án!</div>;
  }

  return (
    <>
      <ViewDetailProject projectId={projectId} />
    </>
  );
}
