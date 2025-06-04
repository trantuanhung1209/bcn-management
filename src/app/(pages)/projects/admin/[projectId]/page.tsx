import React from "react";
import { ViewDetailProject } from "@/app/components/Project-management/admin/ViewDetailProject";
import { Metadata } from "next";

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

export default async function ProjectPageAdmin({
  params,
}: {
  params: { projectId: string };
}) {
  const { projectId } = await params;
  return (
    <>
      <ViewDetailProject projectId={projectId} />
    </>
  );
}
