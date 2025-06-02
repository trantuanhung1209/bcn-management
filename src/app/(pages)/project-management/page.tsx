import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý dự án",
  keywords: [
    "Ban Công Nghệ",
    "Dashboard",
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

export default function MemberProjectManagement() {
  return (
    <div>
      <h1>Member Project Management</h1>
    </div>
  );
}
