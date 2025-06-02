"use client";

import { useEffect, useState } from "react";
import Loading from "../Loading";
import { FirstTitle } from "../FirstTitle";
import ParticlesBackground from "../ParticlesBackground";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { useRouter } from "next/navigation";

export const Login = () => {
  const [loading, setLoading] = useState(true);
  const [passWordVisible, setPasswordVisible] = useState(false);
  const [checkName, setCheckName] = useState(false);
  const [checkPassword, setCheckPassword] = useState(false);
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passWordVisible);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    // Kiểm tra hợp lệ cho cả admin và member
    if (
      (name === "admin" && password === "admin") ||
      (name === "member" && password === "member")
    ) {
      setCheckName(false);
      setCheckPassword(false);
      form.reset();
      if (name === "admin") {
        router.push("/home/admin");
      } else {
        router.push("/home");
      }
    } else {
      setCheckName(true);
      setCheckPassword(true);
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
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Tên Đăng Nhập
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 outline-0 focus:ring-2 focus:ring-[#ccc]"
              placeholder="Nhập tên đăng nhập"
              required
            />
            <div className="text-red-500 text-sm">
              {checkName ? "Tên đăng nhập không hợp lệ" : ""}
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 outline-0 focus:ring-2 focus:ring-[#ccc]"
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
          </div>
        </form>
      </div>
    </>
  );
};
