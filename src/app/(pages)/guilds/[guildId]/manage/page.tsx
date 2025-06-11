
import { ManagementGuildMember } from "@/app/components/Guilds/Management/ManagementGuild";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý guild wars",
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

export default function GuildManagementPage() {
  return (
    <ManagementGuildMember />
  );
}
