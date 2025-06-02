import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hồ sơ người dùng",
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

export default function MemberProfile() {
  return (
    <div>
      <h1>Member Profile</h1>
    </div>
  );
}
