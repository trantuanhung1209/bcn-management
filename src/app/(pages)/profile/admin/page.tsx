
import { ProfileAdmin } from "@/app/components/Profile/ProfileAdmin";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hồ sơ người dùng",
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

export default function AdminProfile() {
  return (
    <>
      <ProfileAdmin />
    </>
  );
}
