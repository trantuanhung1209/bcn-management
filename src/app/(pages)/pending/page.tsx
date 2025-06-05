import { MemberApproval } from "@/app/components/Pending/MemberApproval";


export const metadata = {
  title: "Ban Công Nghệ - Phê duyệt thành viên",
  keywords: [
    "Ban Công Nghệ",
    "Phê duyệt thành viên",
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
        <MemberApproval />
    )
}
