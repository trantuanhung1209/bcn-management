
import { GuildDetailMember } from "@/app/components/Guilds/member/GuildDetail";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chi tiết Guilds",
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

export default function GuildChatPage() {
  return (
    <GuildDetailMember />
  );
}
