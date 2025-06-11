"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Loading from "../../Loading";
import ParticlesBackground from "../../ParticlesBackground";
import { Sider } from "../../Sider/SiderMember";
import { Notification } from "../../Notification";
import { FaBars, FaTimes } from "react-icons/fa";
import GuildList from "./GuildList";
import GuildRanking from "./GuildRanking";
import GuildEventBanner from "./GuildEventBanner";

interface Guild {
  guildId: string;
  name: string;
  logo: string;
  description?: string;
  members: string[];
  level: number;
  fame: number;
  masterId: string;
  masterName?: string;
  requests?: string[];
  officers?: string[];
}

interface User {
  userId: string;
  fullName: string;
}

export const GuildWarsMember = () => {
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
    fetch("/api/guilds")
      .then((res) => res.json())
      .then(async (data) => {
        const guildsWithMaster = await Promise.all(
          data.guilds.map(async (g: Guild) => {
            if (g.masterId) {
              try {
                const res = await fetch(`/api/users/${g.masterId}`);
                const userData = await res.json();
                return { ...g, masterName: userData.fullName || "Chưa rõ" };
              } catch {
                return { ...g, masterName: "Chưa rõ" };
              }
            }
            return { ...g, masterName: "Chưa rõ" };
          })
        );
        setGuilds(guildsWithMaster);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
    }
  }, [router]);

  // Đóng menu khi bấm ra ngoài
  useEffect(() => {
    if (!showMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMenu]);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <ParticlesBackground />
      {/* Hiệu ứng gaming nền động */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none animate-pulse"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, #ffb800 0%, #232946 80%)",
          opacity: 0.25,
          filter: "blur(40px)",
        }}
      />
      {/* Nút toggle menu */}
      <button
        className="fixed top-[30px] left-4 z-50 bg-[#232946] text-[#ffb800] p-2 rounded-full shadow-lg hover:bg-[#181c2b] transition cursor-pointer"
        onClick={() => setShowMenu((prev) => !prev)}
        aria-label={showMenu ? "Ẩn menu" : "Hiện menu"}
      >
        {showMenu ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>
      <div className="min-h-screen bg-gradient-to-br from-[#181c2b] via-[#232946] to-[#0f1021] relative">
        {/* Truyền ref vào Sider để bắt sự kiện click ngoài */}
        {showMenu && <div ref={menuRef}><Sider /></div>}
        <div
          className={`inner-content rounded-lg shadow-md transition-all duration-300 ${
            showMenu ? "ml-[240px]" : "ml-0"
          }`}
        >
          <div className="inner-line py-[30px] border-b border-gray-400 flex justify-end items-center pr-[20px]">
            <Notification />
          </div>
        </div>

        {/* Nội dung chính */}
        <GuildRanking guilds={guilds} user={user} />
        <GuildList />
        <GuildEventBanner />
      </div>
    </>
  );
};
