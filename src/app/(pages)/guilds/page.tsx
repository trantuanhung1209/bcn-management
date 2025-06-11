import { GuildWarsMember } from "@/app/components/Guilds/member/GuildWars";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guild wars",
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

export default function GuildWarsPage() {
  return (
    <GuildWarsMember />
  );
}
