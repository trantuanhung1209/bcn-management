import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
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

export default function MemberDashboard() {
  return (
    <div>
      <h1>Member Dashboard</h1>
    </div>
  );
}
