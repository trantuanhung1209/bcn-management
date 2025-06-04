
import { ProjectManagementAdmin } from "@/app/components/Project-management/admin/ProjectManagementAdmin";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý dự án",
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
  description: "Dashboard for members of Ban Công Nghệ project management system",
};

export default function AdminProductManagement() {
  return (
    <>
      <ProjectManagementAdmin />
    </>
  );
}
