"use client";

import { useEffect, useState } from "react";
import Loading from "../Loading";
import { FirstTitle } from "../FirstTitle";
import ParticlesBackground from "../ParticlesBackground";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { useRouter } from "next/navigation";

interface User {
  userName: string;
  email: string;
  status: string;
  userId: string;
  role: string;
  password?: string;
  createdAt?: string;
}

export const Login = () => {
  const [loading, setLoading] = useState(true);
  const [passWordVisible, setPasswordVisible] = useState(false);
  const [checkUserName, setCheckUserName] = useState(false);
  const [checkPassword, setCheckPassword] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.users || []);
    };
    fetchUsers();
  }, []);
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passWordVisible);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const userName = (
      form.elements.namedItem("userName") as HTMLInputElement
    ).value.trim();
    const password = (
      form.elements.namedItem("password") as HTMLInputElement
    ).value.trim();

    // Reset lỗi
    setCheckUserName(false);
    setCheckPassword(false);

    let valid = true;
    if (!userName) {
      setCheckUserName(true);
      valid = false;
    }
    if (!password) {
      setCheckPassword(true);
      valid = false;
    }
    if (!valid) return;

    const user = users.find(
      (user) => user.userName === userName && user.password === password
    );

    if (user) {
      if (user.status === "approved") {
        // Cập nhật isActive = true
        await fetch("/api/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.userId, status:"approved", isActive: true }),
        });

        localStorage.setItem("isLogin", "true");
        localStorage.setItem("user", JSON.stringify(user));

        if (user.role === "admin") {
          router.push("/home/admin");
        } else if (user.role === "member") {
          router.push("/home");
        }
        form.reset();
      } else {
        alert("Tài khoản của bạn chưa được phê duyệt.");
      }
    } else {
      // Kiểm tra tên đăng nhập có tồn tại không
      const existedUserName = users.some((user) => user.userName === userName);
      if (!existedUserName) {
        setCheckUserName(true);
      } else {
        setCheckPassword(true);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <ParticlesBackground />
      <div className="container mx-auto">
        <FirstTitle />

        <form
          className="mt-8 max-w-md mx-auto p-6 bg-[#ffffff] rounded-lg shadow-md"
          onSubmit={handleSubmit}
        >
          <div className="mb-4">
            <label
              htmlFor="userName"
              className="block text-sm font-medium text-gray-700"
            >
              Tên Đăng Nhập
            </label>
            <input
              type="text"
              id="userName"
              name="userName"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 outline-0 focus:ring-2 focus:ring-[#ccc] text-black"
              placeholder="Nhập tên đăng nhập"
              required
            />
            <div className="text-red-500 text-sm">
              {checkUserName ? "Tên đăng nhập không hợp lệ" : ""}
            </div>
          </div>
          <div className="mb-4 relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Mật Khẩu
            </label>
            <input
              type={passWordVisible ? "text" : "password"}
              id="password"
              name="password"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 outline-0 focus:ring-2 focus:ring-[#ccc] text-black"
              placeholder="Nhập mật khẩu"
              required
            />
            <div className="text-red-500 text-sm">
              {checkPassword ? "Mật khẩu không hợp lệ" : ""}
            </div>
            <div className="absolute right-3 top-[38px] cursor-pointer">
              <FaEye
                className={`text-gray-500 ${passWordVisible ? "hidden" : ""}`}
                onClick={togglePasswordVisibility}
              />
              <FaEyeSlash
                className={`text-gray-500 ${passWordVisible ? "" : "hidden"}`}
                onClick={togglePasswordVisibility}
              />
            </div>
          </div>
          <div className="text-center">
            <button
              type="submit"
              className="py-[14px] px-[20px] bg-[#424242] text-white text-[16px] rounded-lg shadow-md hover:bg-[#1a1a1a] transition-colors duration-300 cursor-pointer transform hover:scale-105 active:scale-95 ease-in-out"
            >
              Đăng Nhập
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản? Liên hệ{" "}
              <span className="text-[#FF0000]">Trưởng Ban</span>
            </p>
            <p className="text-sm text-gray-600">Hoặc</p>
            <div className="inner-register">
              <p
                className="text-sm text-gray-600 cursor-pointer underline hover:text-[#171717]"
                onClick={() => {
                  router.push("/register");
                }}
              >
                Đăng ký tài khoản thành viên.
              </p>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};
