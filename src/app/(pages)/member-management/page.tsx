import { MemberManagement } from "@/app/components/Member-management/MemberManagement";


export const metadata = {
  title: "Ban Công Nghệ - Quản lý thành viên",
  keywords: [
    "Ban Công Nghệ",
    "Quản lý thành viên",
    "BCN",
    "Project Management",
    "Login",
    "Authentication",
  ],
  authors: [
    {
      name: "Ban Công Nghệ",
    },
  ],
  description: "Đăng nhập vào hệ thống quản lý dự án của Ban Công Nghệ",
};

export default function MessagePage() {
    return (
        <MemberManagement />    
    )
}
