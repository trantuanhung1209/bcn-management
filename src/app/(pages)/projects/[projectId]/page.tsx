import React from "react";
import { Metadata } from "next";
import { ViewDetailProject } from "@/app/components/Project-management/member/ViewDetailProject";

export const metadata: Metadata = {
  title: "Chi tiết dự án",
  keywords: [
    "Ban Công Nghệ",
    "Home",
    "BCN",
    "Project Management",
    "User Dashboard",
    "Member Dashboard",
  ],
  authors: [
    {
      name: "Ban Công Nghệ",
    },
  ],
  description:
    "Dashboard for members of Ban Công Nghệ project management system",
};

export default async function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { projectId } = params;
  return (
    <>
      <ViewDetailProject projectId={projectId} />
    </>
  );
}
