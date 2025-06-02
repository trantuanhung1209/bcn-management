import { Login } from "@/app/components/Login/Login";

export const metadata = {
  title: "Ban Công Nghệ - Đăng Nhập",
  keywords: [
    "Ban Công Nghệ",
    "Đăng Nhập",
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

export default function LoginPage() {
    return (
        <Login />
    )
}
