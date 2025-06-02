import { HomeAdmin } from "@/app/components/Home/HomeAdmin";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trang chủ",
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

export default function AdminHome() {
  return (
    <>
      <HomeAdmin />
    </>
  );
}
