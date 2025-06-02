
import { CalendarAdmin } from "@/app/components/Calendar/CalendarAdmin";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lịch trình",
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

export default function AdminCalendar() {
  return (
    <>
      <CalendarAdmin />
    </>
  );
}
