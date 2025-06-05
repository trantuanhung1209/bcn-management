"use client";

import { useEffect, useState } from "react";
import Loading from "../Loading";
import { FirstTitle } from "../FirstTitle";
import ParticlesBackground from "../ParticlesBackground";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { useRouter } from "next/navigation";

export const Register = () => {
  const [loading, setLoading] = useState(true);
  const [passWordVisible, setPasswordVisible] = useState(false);
  const [checkUserName, setCheckUserName] = useState(false);
  const [checkPassword, setCheckPassword] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [checkFullName, setCheckFullName] = useState(false);
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passWordVisible);
  };

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validateUserName = (userName: string) => {
    const userNamePattern = /^[a-zA-Z0-9_]{3,}$/; 
    return userNamePattern.test(userName);
  };

  const validatePassword = (password: string) => {
    // Mật khẩu phải từ 6 ký tự trở lên
    return password.length >= 3;
  };

  const validateFullName = (fullName: string) => {
    const fullNamePattern = /^[\p{L}\s]{2,}$/u;
    return fullNamePattern.test(fullName);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fullName = (
      form.elements.namedItem("fullName") as HTMLInputElement
    ).value.trim();
    const userName = (
      form.elements.namedItem("userName") as HTMLInputElement
    ).value.trim();
    const email = (
      form.elements.namedItem("email") as HTMLInputElement
    ).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;
    const rePassword = (
      form.elements.namedItem("re-password") as HTMLInputElement
    ).value;

    let valid = true;

    // Reset lỗi
    setCheckFullName(false);
    setCheckUserName(false);
    setCheckEmail(false);
    setCheckPassword(false);

    // Validate từng trường
    if (!validateFullName(fullName)) {
      setCheckFullName(true);
      valid = false;
    }
    if (!validateUserName(userName)) {
      setCheckUserName(true);
      valid = false;
    }
    if (!validateEmail(email)) {
      setCheckEmail(true);
      valid = false;
    }
    if (!validatePassword(password) || password !== rePassword) {
      setCheckPassword(true);
      valid = false;
    }

    if (!valid) return;

    const userData = {
      fullName,
      userName,
      email,
      password,
      status: "pending",
      role: "member",
      userId: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isActive: "offline",
    };

    fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          form.reset();
          setTimeout(() => {
            router.push("/message");
          }, 1000);
        } else if (data.message === "Email đã tồn tại") {
          setCheckEmail(true);
        } else if (data.message === "Tên đăng nhập đã tồn tại") {
          setCheckUserName(true);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
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
          className="mt-[20px] max-w-md mx-auto p-6 bg-[#ffffff] rounded-lg shadow-md"
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Đăng Ký Tài Khoản
          </h2>

          <div className="mb-4">
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700"
            >
              Họ và Tên
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 outline-0 focus:ring-2 focus:ring-[#ccc] text-black"
              placeholder="Nhập họ và tên"
            />
          </div>
          <div className="text-red-500 text-sm">
            {checkFullName ? "Họ và tên chỉ chứa chữ cái và khoảng trắng" : ""}
          </div>

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
              {checkUserName
                ? "Tên đăng nhập phải từ 3 ký tự trở lên, chỉ chứa chữ cái, số và dấu gạch dưới"
                : ""}
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 outline-0 focus:ring-2 focus:ring-[#ccc] text-black"
              placeholder="Nhập email"
              required
            />
            <div className="text-red-500 text-sm">
              {checkEmail ? "Email đã tồn tại hoặc không hợp lệ" : ""}
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
              {checkPassword
                ? "Mật khẩu phải từ 3 ký tự hoặc không hợp lệ"
                : ""}
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

          <div className="mb-4 relative">
            <label
              htmlFor="re-password"
              className="block text-sm font-medium text-gray-700"
            >
              Xác Nhận Mật Khẩu
            </label>
            <input
              type={passWordVisible ? "text" : "password"}
              id="re-password"
              name="re-password"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 outline-0 focus:ring-2 focus:ring-[#ccc] text-black"
              placeholder="Nhập lại mật khẩu"
              required
            />
            <div className="text-red-500 text-sm">
              {checkPassword
                ? "Mật khẩu phải từ 3 ký tự hoặc không hợp lệ"
                : ""}
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
              Đăng Ký
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản? Liên hệ{" "}
              <span className="text-[#FF0000]">Trưởng Ban</span>
            </p>
            <p className="text-sm text-gray-600">Hoặc</p>
            <div className="inner-register">
              <p className="text-sm text-gray-600 cursor-pointer underline hover:text-[#171717]">
                Đăng ký tài khoản thành viên.
              </p>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};
