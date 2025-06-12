"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Loading from "../../Loading";
import ParticlesBackground from "../../ParticlesBackground";
import { Sider } from "../../Sider/SiderMember";
import { Notification } from "../../Notification";
import { FaBars, FaTimes } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa6";
import Swal from "sweetalert2";

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
  officers?: string[];
  requests?: string[];
}

export const GuildDetailMember = () => {
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [guild, setGuild] = useState<Guild | null>(null);
  const [user, setUser] = useState<{ userId: string; fullName: string } | null>(
    null
  );
  const [status, setStatus] = useState<"joined" | "pending" | "available">(
    "available"
  );
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  useEffect(() => {
    // Lấy guildId từ params
    const guildId = params?.guildId as string;
    if (!guildId) return;
    fetch(`/api/guilds/${guildId}`)
      .then((res) => res.json())
      .then(async (data) => {
        // Lấy tên chủ guild
        let masterName = "Chưa rõ";
        if (data.guild.masterId) {
          try {
            const res = await fetch(`/api/users/${data.guild.masterId}`);
            const userData = await res.json();
            masterName = userData.fullName || "Chưa rõ";
          } catch {}
        }
        setGuild({ ...data.guild, masterName });
      });
  }, [params]);

  useEffect(() => {
    if (!guild) return;
    const fetchUsers = async () => {
      const map: Record<string, string> = {};
      await Promise.all(
        guild.members.map(async (memberId) => {
          try {
            const res = await fetch(`/api/users/${memberId}`);
            const data = await res.json();
            map[memberId] = data.fullName || memberId;
          } catch {
            map[memberId] = memberId;
          }
        })
      );
      setUserMap(map);
    };
    fetchUsers();
  }, [guild]);

  useEffect(() => {
    if (guild && user) {
      if (guild.members.includes(user.userId)) setStatus("joined");
      else if (guild.requests?.includes(user.userId)) setStatus("pending");
      else setStatus("available");
    }
  }, [guild, user]);

  if (loading || !guild) {
    return <Loading />;
  }

  // Xử lý tham gia/rời guild
  const handleJoin = async () => {
    const res = await fetch(`/api/guilds/${guild.guildId}/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.userId }),
    });
    if (res.ok) {
      Swal.fire("Thành công!", "Đã gửi yêu cầu tham gia!", "success");
      router.refresh?.();
    } else {
      Swal.fire("Lỗi", "Gửi yêu cầu thất bại!", "error");
    }
  };

  const handleLeave = async () => {
    const res = await fetch(
      `/api/guilds/${guild.guildId}/members/${user?.userId}`,
      {
        method: "DELETE",
      }
    );
    if (res.ok) {
      Swal.fire("Thành công!", "Đã rời guild!", "success");
      router.refresh?.();
    } else {
      Swal.fire("Lỗi", "Rời guild thất bại!", "error");
    }
  };

  const isMaster = user && guild.masterId === user.userId;
  const isOfficer = user && guild.officers?.includes(user.userId);

  return (
    <>
      <ParticlesBackground />
      {/* Nút toggle menu */}
      <button
        className="fixed top-[30px] left-4 z-50 bg-[#232946] text-[#ffb800] p-2 rounded-full shadow-lg hover:bg-[#181c2b] transition cursor-pointer"
        onClick={() => setShowMenu((prev) => !prev)}
        aria-label={showMenu ? "Ẩn menu" : "Hiện menu"}
      >
        {showMenu ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>
      <div className="min-h-screen bg-gradient-to-br from-[#181c2b] via-[#232946] to-[#0f1021] relative">
        {/* Ẩn/hiện Sider */}
        {showMenu && <Sider />}
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
        <div className="max-w-3xl mx-auto bg-[#232946] rounded-xl shadow-lg p-8 mt-8">
          <button
            className="mb-4 flex items-center gap-2 text-[#ffb800] hover:text-[#ffd700] font-bold cursor-pointer"
            onClick={() => router.back()}
          >
            <FaArrowLeft /> Quay lại
          </button>
          <div className="flex items-center gap-6">
            <img
              src={guild.logo}
              alt={guild.name}
              className="w-24 h-24 rounded-full border-4 border-[#ffb800] object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold text-[#ffb800] mb-2">
                {guild.name}
              </h1>
              <div className="text-gray-300 mb-2">
                {guild.description || "Không có mô tả"}
              </div>
              <div className="flex gap-4 text-sm mb-2">
                <span>
                  Level: <b>{guild.level}</b>
                </span>
                <span>
                  Fame: <b>{guild.fame}</b>
                </span>
                <span>
                  👑 Chủ guild: <b>{guild.masterName}</b>
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                {status === "joined" && !isMaster && (
                  <button
                    className="bg-red-500 text-white px-4 py-1 rounded font-bold shadow hover:bg-red-700 transition cursor-pointer"
                    onClick={handleLeave}
                  >
                    Rời guild
                  </button>
                )}
                {status === "available" && (
                  <button
                    className="bg-[#ffb800] text-black px-4 py-1 rounded font-bold shadow hover:bg-[#ffd700] transition cursor-pointer"
                    onClick={handleJoin}
                  >
                    Tham gia
                  </button>
                )}
                {status === "pending" && (
                  <span className="bg-yellow-400 text-black px-3 py-1 rounded-full font-bold">
                    Đã gửi yêu cầu
                  </span>
                )}
                {(isMaster || isOfficer) && (
                  <button
                    className="bg-green-600 text-white px-4 py-1 rounded font-bold shadow hover:bg-green-800 transition cursor-pointer"
                    onClick={() =>
                      router.push(`/guilds/${guild.guildId}/manage`)
                    }
                  >
                    Quản lý guild
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="mt-8">
            <h2 className="text-xl font-bold text-[#ffb800] mb-2">
              Thành viên ({guild.members.length})
            </h2>
            <div className="flex flex-wrap gap-3">
              {guild.members.map((memberId) => (
                <span
                  key={memberId}
                  className="bg-[#181c2b] text-white px-3 py-1 rounded-full text-sm"
                >
                  {userMap[memberId] || memberId}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
