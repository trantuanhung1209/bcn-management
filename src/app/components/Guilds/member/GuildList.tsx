"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import OnlineGiftBox from "./OnlineGiftBox";
import { FaGift } from "react-icons/fa6";

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

export default function GuildList() {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [showQuest, setShowQuest] = useState(false);

  // State cho tìm kiếm và lọc
  const [search, setSearch] = useState("");
  const [minMembers, setMinMembers] = useState(0);
  const [minLevel, setMinLevel] = useState(0);
  const [minFame, setMinFame] = useState(0);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "joined" | "pending" | "available"
  >("all");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
    fetchGuilds();
  }, []);

  const fetchGuilds = async () => {
    const res = await fetch("/api/guilds");
    const data = await res.json();
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
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
    fetchGuilds();
  }, []);

  // Lọc và tìm kiếm
  const filteredGuilds = guilds.filter((guild) => {
    // Tìm kiếm theo tên
    if (search && !guild.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    // Lọc số thành viên
    if (guild.members.length < minMembers) return false;
    // Lọc level
    if (guild.level < minLevel) return false;
    // Lọc fame
    if (guild.fame < minFame) return false;

    // Lọc trạng thái
    let status = "available";
    if (user && guild.members.includes(user.userId)) status = "joined";
    else if (user && guild.requests?.includes(user.userId)) status = "pending";
    if (statusFilter !== "all" && status !== statusFilter) return false;

    return true;
  });

  // Hàm xử lý tham gia guild
  const handleJoin = async (guildId: string) => {
    // Gửi yêu cầu tham gia (giả sử có API này)
    const res = await fetch(`/api/guilds/${guildId}/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.userId }),
    });
    if (res.ok) {
      Swal.fire("Thành công!", "Đã gửi yêu cầu tham gia!", "success");
      router.refresh?.();
    } else {
      Swal.fire("Lỗi", "Gửi yêu cầu tham gia thất bại!", "error");
    }
  };

  // Hàm xử lý rời guild
  const handleLeave = async (guildId: string) => {
    const confirm = await Swal.fire({
      title: "Xác nhận rời guild?",
      text: "Bạn có chắc chắn muốn rời guild này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Rời guild",
      cancelButtonText: "Huỷ",
    });
    if (!confirm.isConfirmed) return;

    const res = await fetch(`/api/guilds/${guildId}/members/${user?.userId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      Swal.fire("Thành công!", "Đã rời guild!", "success");
      fetchGuilds();
    } else {
      Swal.fire("Lỗi", "Rời guild thất bại!", "error");
    }
  };

  // Xử lý khi nhận quà thành công
  const handleClaimSuccess = () => {
    setShowQuest(false);
    fetchGuilds(); // Cập nhật lại danh sách guilds sau khi nhận quà
  };

  if (loading)
    return (
      <div className="text-center py-10 text-lg">
        Đang tải danh sách guild...
      </div>
    );

  return (
    <div className="px-[20px] py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-[#ffb800]">Danh sách Guilds</h2>
        <button
          className="bg-[#ffb800] text-black px-6 py-2 rounded-full font-bold shadow-lg hover:bg-[#ffd700] transition text-lg cursor-pointer"
          onClick={() => router.push("/guilds/create")}
        >
          + Tạo guild mới
        </button>
      </div>
      {/* Thanh tìm kiếm và lọc */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên guild..."
          className="px-3 py-2 rounded border border-gray-400 focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div>
          <label className="text-sm mr-1">Tối thiểu thành viên:</label>
          <input
            type="number"
            min={0}
            className="w-16 px-2 py-1 rounded border border-gray-400"
            value={minMembers}
            onChange={(e) => setMinMembers(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-sm mr-1">Tối thiểu level:</label>
          <input
            type="number"
            min={0}
            className="w-16 px-2 py-1 rounded border border-gray-400"
            value={minLevel}
            onChange={(e) => setMinLevel(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-sm mr-1">Tối thiểu fame:</label>
          <input
            type="number"
            min={0}
            className="w-16 px-2 py-1 rounded border border-gray-400"
            value={minFame}
            onChange={(e) => setMinFame(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-sm mr-1">Trạng thái:</label>
          <select
            className="px-2 py-1 rounded border border-gray-400"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">Tất cả</option>
            <option value="joined">Đã tham gia</option>
            <option value="pending">Đã gửi yêu cầu</option>
            <option value="available">Có thể tham gia</option>
          </select>
        </div>
      </div>
      {/* Danh sách guilds */}
      <div className="grid grid-cols-3 gap-6">
        {filteredGuilds.map((guild) => {
          let status = "available";
          if (user && guild.members.includes(user.userId)) status = "joined";
          else if (user && guild.requests?.includes(user.userId))
            status = "pending";
          const isMaster = user && guild.masterId === user.userId;
          const isOfficer = user && guild.officers?.includes(user.userId);

          return (
            <div
              key={guild.guildId}
              className="bg-[#232946] rounded-xl shadow-lg p-6 flex gap-4 items-center border-2 border-[#ffb800] hover:scale-105 transition"
            >
              <img
                src={guild.logo}
                alt={guild.name}
                className="w-20 h-20 rounded-full border-4 border-[#ffb800] object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#ffb800]">
                    {guild.name}
                  </h2>
                  <span className="ml-2 text-sm text-[#00ffea] bg-[#181c2b] px-2 py-1 rounded">
                    Level {guild.level} | Fame {guild.fame}
                  </span>
                </div>
                <div className="text-gray-300 text-sm mt-1">
                  {guild.description || "Không có mô tả"}
                </div>
                <div className="mt-2 flex gap-4 text-sm">
                  <span>
                    👥 <b>{guild.members.length}</b> thành viên
                  </span>
                  <span>
                    👑 Chủ guild: <b>{guild.masterName}</b>
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <button
                  className="bg-[#00ffea] text-black px-3 py-1 rounded font-bold shadow hover:bg-[#ffb800] transition cursor-pointer"
                  onClick={() => router.push(`/guilds/${guild.guildId}`)}
                >
                  Xem chi tiết
                </button>
                {status === "available" && (
                  <button
                    className="bg-[#ffb800] text-black px-4 py-1 rounded font-bold shadow hover:bg-[#ffd700] transition cursor-pointer"
                    onClick={() => handleJoin(guild.guildId)}
                  >
                    Tham gia
                  </button>
                )}
                {status === "joined" && !isMaster && (
                  <button
                    className="bg-red-500 text-white px-4 py-1 rounded font-bold shadow hover:bg-red-700 transition cursor-pointer"
                    onClick={() => handleLeave(guild.guildId)}
                  >
                    Rời guild
                  </button>
                )}
                {(isMaster || isOfficer) && (
                  <button
                    className="bg-green-600 text-white px-4 py-1 rounded font-bold shadow hover:bg-green-800 transition cursor-pointer"
                    onClick={() =>
                      router.push(`/guilds/${guild.guildId}/manage`)
                    }
                  >
                    Quản lý
                  </button>
                )}
                {status === "pending" && (
                  <span className="bg-yellow-400 text-black px-3 py-1 rounded-full font-bold">
                    Đã gửi yêu cầu
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {filteredGuilds.length === 0 && (
          <div className="col-span-2 text-center text-gray-400 py-8">
            Không tìm thấy guild phù hợp.
          </div>
        )}
      </div>

      {/* Icon nhiệm vụ */}
      <button
        className="fixed bottom-8 right-8 z-50 bg-[#ffb800] text-black p-4 rounded-full shadow-lg hover:bg-yellow-400 transition cursor-pointer transform hover:scale-110"
        style={{ boxShadow: "0 0 10px rgba(255, 184, 0, 0.5)" }}
        onClick={() => setShowQuest(true)}
        aria-label="Nhiệm vụ online"
      >
        <FaGift size={28} />
      </button>

      {/* Popup nhiệm vụ */}
      {showQuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black opacity-40"
            onClick={() => setShowQuest(false)}
          />
          {/* Popup nhiệm vụ */}
          <div className="bg-[#232946] rounded-xl shadow-lg p-6 relative max-w-xl w-full z-10">
            <button
              className="absolute top-2 right-2 text-white text-xl cursor-pointer hover:text-[##ffb800]"
              onClick={() => setShowQuest(false)}
              aria-label="Đóng"
            >
              ×
            </button>
            <OnlineGiftBox onClaimSuccess={handleClaimSuccess} />
          </div>
        </div>
      )}
    </div>
  );
}
