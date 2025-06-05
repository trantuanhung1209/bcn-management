"use client";

import ParticlesBackground from "./ParticlesBackground";
import { useRouter } from "next/navigation";

export const Message = () => {
  const router = useRouter();

  return (
    <>
      <ParticlesBackground />
      <div className="container mx-auto text-black">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-4xl font-bold mb-4">
            Thông báo đăng ký thành công!
          </h1>
          <p className="text-base text-gray-500 mt-2">
            Cảm ơn bạn đã đăng ký tài khoản. Hệ thống sẽ xem xét và phê duyệt
            tài khoản của bạn trong thời gian sớm nhất.
          </p>
          <p className="text-base text-gray-500 mt-2">
            Vui lòng kiểm tra email để xác nhận tài khoản.
          </p>

          <div className="text-center mt-6">
            <button
              type="button"
              className="py-[14px] px-[20px] bg-[#424242] text-white text-[16px] rounded-lg shadow-md hover:bg-[#1a1a1a] transition-colors duration-300 cursor-pointer transform hover:scale-105 active:scale-95 ease-in-out"
              onClick={() => {
                router.push("/");
              }}
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
