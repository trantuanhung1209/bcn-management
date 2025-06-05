import { Register } from "@/app/components/Register/Register";


export const metadata = {
  title: "Ban Công Nghệ - Đăng ký",
  keywords: [
    "Ban Công Nghệ",
    "Đăng Ký",
    "BCN",
    "Project Management",
    "Register",
    "Authentication",
  ],
  authors: [
    {
      name: "Ban Công Nghệ",
    },
  ],
  description: "Đăng ký vào hệ thống quản lý dự án của Ban Công Nghệ",
};

export default function RegisterPage() {
    return (
        <Register />
    )
}
