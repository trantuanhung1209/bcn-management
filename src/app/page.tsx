"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "./components/Loading";
import { FirstTitle } from "./components/FirstTitle";
import ParticlesBackground from "./components/ParticlesBackground";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

        <div className="inner-login flex flex-col items-center justify-center">
          <h2 className="text-[24px] text-gray-700 mb-[32px]">Bạn cần đăng nhập để sử dụng</h2>
          <button className="py-[16px] px-[20px] bg-[#424242] text-white text-[16px] rounded-lg shadow-md hover:bg-[#1a1a1a] transition-colors duration-300 cursor-pointer transform hover:scale-105 active:scale-95 ease-in-out"
            onClick={() => {
              router.push("/login");
            }}
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </>
  );
}
