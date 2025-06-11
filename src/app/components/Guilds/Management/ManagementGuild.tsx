"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Loading from "../../Loading";
import ParticlesBackground from "../../ParticlesBackground";
import { Sider } from "../../Sider/SiderMember";
import { Notification } from "../../Notification";
import { FaBars, FaTimes, FaArrowLeft } from "react-icons/fa";
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

export const ManagementGuildMember = () => {
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [guild, setGuild] = useState<Guild | null>(null);
  // const [user, setUser] = useState<{ userId: string; fullName: string } | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
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
    // setUser(JSON.parse(userData));
  }, [router]);

  useEffect(() => {
    // Lấy guildId từ params
    const guildId = params?.guildId as string;
    if (!guildId) return;
    fetch(`/api/guilds/${guildId}`)
      .then((res) => res.json())
      .then(async (data) => {
        let masterName = "Chưa rõ";
        if (data.guild.masterId) {
          try {
            const res = await fetch(`/api/users/${data.guild.masterId}`);
            const userData = await res.json();
            masterName = userData.fullName || "Chưa rõ";
          } catch {}
        }
        setGuild({ ...data.guild, masterName });
        // Lấy danh sách requests (giả sử có API này)
        fetch(`/api/guilds/${guildId}/requests`)
          .then((res) => res.json())
          .then((data) => setRequests(data.requests || []));
      });
  }, [params]);

  // Duyệt yêu cầu tham gia
  const handleAccept = async (requestId: string) => {
    if (!guild?.guildId || !requestId) return;
    const guildId = guild.guildId;
    const res = await fetch(`/api/guilds/${guildId}/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "accepted" }),
    });
    if (res.ok) {
      Swal.fire("Thành công", "Đã duyệt yêu cầu!", "success");
      router.refresh?.();
    } else {
      const data = await res.json();
      Swal.fire("Lỗi", data.message || "Duyệt yêu cầu thất bại!", "error");
    }
    console.log(`Duyệt yêu cầu ${requestId} cho guild ${guildId}`);
  };

  // Từ chối yêu cầu tham gia
  const handleDecline = async (requestId: string) => {
    const guildId = guild?.guildId;
    const res = await fetch(`/api/guilds/${guildId}/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "declined" }),
    });
    if (res.ok) {
      Swal.fire("Đã từ chối yêu cầu!", "", "info");
      router.refresh?.();
    }
  };

  // Kick thành viên
  const handleKick = async (memberId: string) => {
    const guildId = guild?.guildId;
    if (!guildId) return;
    const res = await fetch(`/api/guilds/${guildId}/members/${memberId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      Swal.fire("Đã kick thành viên!", "", "success");
      router.refresh?.();
    }
  };

  // Phân quyền officer
  const handleSetOfficer = async (memberId: string, isOfficer: boolean) => {
    const guildId = guild?.guildId;
    if (!guildId) return;
    const res = await fetch(`/api/guilds/${guildId}/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: isOfficer ? "member" : "officer" }),
    });
    if (res.ok) {
      Swal.fire("Cập nhật quyền thành công!", "", "success");
      router.refresh?.();
    }
  };

  if (loading || !guild) {
    return <Loading />;
  }

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
        <div className={`inner-content rounded-lg shadow-md transition-all duration-300 ${showMenu ? "ml-[240px]" : "ml-0"}`}>
          <div className="inner-line py-[30px] border-b border-gray-400 flex justify-end items-center pr-[20px]">
            <Notification />
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="max-w-3xl mx-auto bg-[#232946] rounded-xl shadow-lg p-8 mt-8">
          <button
            className="mb-4 flex items-center gap-2 text-[#ffb800] hover:text-[#ffd700] font-bold"
            onClick={() => router.back()}
          >
            <FaArrowLeft /> Quay lại
          </button>
          <h1 className="text-2xl font-bold text-[#ffb800] mb-4">Quản lý Guild: {guild.name}</h1>
          <div className="mb-6">
            <img src={guild.logo} alt={guild.name} className="w-20 h-20 rounded-full border-4 border-[#ffb800] mb-2" />
            <div className="text-gray-300">{guild.description || "Không có mô tả"}</div>
            <div className="flex gap-4 text-sm mt-2">
              <span>Level: <b>{guild.level}</b></span>
              <span>Fame: <b>{guild.fame}</b></span>
              <span>👑 Chủ guild: <b>{guild.masterName}</b></span>
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#ffb800] mb-2">Thành viên ({guild.members.length})</h2>
            <div className="flex flex-col gap-2">
              {guild.members.map((memberId) => (
                <div key={memberId} className="flex items-center gap-3 bg-[#181c2b] px-3 py-2 rounded">
                  <span className="text-white">{memberId}</span>
                  {memberId !== guild.masterId && (
                    <>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold hover:bg-red-700"
                        onClick={() => handleKick(memberId)}
                      >
                        Kick
                      </button>
                      <button
                        className="bg-[#00ffea] text-black px-2 py-1 rounded text-xs font-bold hover:bg-[#ffb800]"
                        onClick={() =>
                          handleSetOfficer(
                            memberId,
                            guild.officers?.includes(memberId) || false
                          )
                        }
                      >
                        {guild.officers?.includes(memberId) ? "Bỏ Officer" : "Set Officer"}
                      </button>
                    </>
                  )}
                  {memberId === guild.masterId && (
                    <span className="bg-[#ffb800] text-black px-2 py-1 rounded text-xs font-bold ml-2">Master</span>
                  )}
                  {guild.officers?.includes(memberId) && memberId !== guild.masterId && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold ml-2">Officer</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#ffb800] mb-2">Yêu cầu tham gia</h2>
            <div className="flex flex-col gap-2">
              {requests.length === 0 && (
                <span className="text-gray-400">Không có yêu cầu nào.</span>
              )}
              {requests.map((req, index) => (
                <div key={req.requestId || index} className="flex items-center gap-3 bg-[#181c2b] px-3 py-2 rounded">
                  <span className="text-white">{req.userId}</span>
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold hover:bg-green-700 cursor-pointer"
                    onClick={() => handleAccept(req.requestId)}
                  >
                    Duyệt
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold hover:bg-red-700 cursor-pointer"
                    onClick={() => handleDecline(req.requestId)}
                  >
                    Từ chối
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
