import { CalendarMember } from "@/app/components/Calendar/CalendarMember";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lịch trình",
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

export default function MemberCalendar() {
  return (
    <CalendarMember />
  );
}
