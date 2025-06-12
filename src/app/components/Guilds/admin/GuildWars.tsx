"use client";

import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import Loading from "../../Loading";
import ParticlesBackground from "../../ParticlesBackground";
import { Sider } from "../../Sider/Sider";
import { FaBars } from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";

interface Guild {
  guildId: string;
  name: string;
  logo: string;
  description?: string;
  events?: Event[];
  [key: string]: any;
}
interface Event {
  eventId: string;
  name: string;
  date: string;
}

export const GuildWarsAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [user, setUser] = useState<any>(null);
  const [newGuild, setNewGuild] = useState({ name: "", logo: "", description: "" });
  const [newEvent, setNewEvent] = useState<{ [guildId: string]: { name: string; date: string } }>({});
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch guilds
  const fetchGuilds = async () => {
    setLoading(true);
    const res = await fetch("/api/guilds");
    const data = await res.json();
    setGuilds(data.guilds || []);
    setLoading(false);
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
    fetchGuilds();
  }, []);

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

  // Thêm guild
  const handleAddGuild = async () => {
    if (!newGuild.name || !newGuild.logo) {
      Swal.fire("Thiếu thông tin", "Vui lòng nhập tên và logo!", "warning");
      return;
    }
    const res = await fetch("/api/guilds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newGuild),
    });
    if (res.ok) {
      Swal.fire("Thành công", "Đã thêm guild!", "success");
      setNewGuild({ name: "", logo: "", description: "" });
      fetchGuilds();
    } else {
      Swal.fire("Lỗi", "Không thể thêm guild!", "error");
    }
  };

  // Xoá guild
  const handleDeleteGuild = async (guildId: string) => {
    const confirm = await Swal.fire({
      title: "Xác nhận xoá guild?",
      text: "Bạn có chắc chắn muốn xoá guild này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
    });
    if (!confirm.isConfirmed) return;
    const res = await fetch(`/api/guilds/${guildId}`, { method: "DELETE" });
    if (res.ok) {
      Swal.fire("Đã xoá guild!", "", "success");
      fetchGuilds();
    } else {
      Swal.fire("Lỗi", "Không thể xoá guild!", "error");
    }
  };

  // Thêm sự kiện cho guild
  const handleAddEvent = async (guildId: string) => {
    const event = newEvent[guildId];
    if (!event?.name || !event?.date) {
      Swal.fire("Thiếu thông tin", "Nhập tên và ngày sự kiện!", "warning");
      return;
    }
    const res = await fetch(`/api/guilds/${guildId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...event }),
    });
    if (res.ok) {
      Swal.fire("Thành công", "Đã thêm sự kiện!", "success");
      setNewEvent((prev) => ({ ...prev, [guildId]: { name: "", date: "" } }));
      fetchGuilds();
    } else {
      Swal.fire("Lỗi", "Không thể thêm sự kiện!", "error");
    }
  };

  // Xoá sự kiện
  const handleDeleteEvent = async (guildId: string, eventId: string) => {
    const confirm = await Swal.fire({
      title: "Xác nhận xoá sự kiện?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
    });
    if (!confirm.isConfirmed) return;
    const res = await fetch(`/api/guilds/${guildId}/events/${eventId}`, { method: "DELETE" });
    if (res.ok) {
      Swal.fire("Đã xoá sự kiện!", "", "success");
      fetchGuilds();
    } else {
      Swal.fire("Lỗi", "Không thể xoá sự kiện!", "error");
    }
  };

  if (loading) return <Loading />;

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
        {showMenu && (
          <div ref={menuRef} className="fixed z-50">
            <Sider />
          </div>
        )}
        <div className={`max-w-4xl mx-auto bg-[#232946] rounded-xl shadow-lg p-8 mt-8`}>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#ffb800] mb-4">Quản lý Guild</h2>
            <div className="flex gap-2 mb-4">
              <input
                className="px-2 py-1 rounded border border-gray-400"
                placeholder="Tên guild"
                value={newGuild.name}
                onChange={e => setNewGuild(g => ({ ...g, name: e.target.value }))}
              />
              <input
                className="px-2 py-1 rounded border border-gray-400"
                placeholder="Logo URL"
                value={newGuild.logo}
                onChange={e => setNewGuild(g => ({ ...g, logo: e.target.value }))}
              />
              <input
                className="px-2 py-1 rounded border border-gray-400"
                placeholder="Mô tả"
                value={newGuild.description}
                onChange={e => setNewGuild(g => ({ ...g, description: e.target.value }))}
              />
              <button
                className="bg-[#ffb800] text-black px-3 py-1 rounded font-bold"
                onClick={handleAddGuild}
              >
                Thêm Guild
              </button>
            </div>
            <div className="space-y-6">
              {guilds.map((guild) => (
                <div key={guild.guildId} className="bg-[#181c2b] rounded p-4">
                  <div className="flex items-center gap-4">
                    <img src={guild.logo} alt={guild.name} className="w-12 h-12 rounded-full border-2 border-[#ffb800]" />
                    <div>
                      <div className="font-bold text-lg text-white">{guild.name}</div>
                      <div className="text-gray-400">{guild.description}</div>
                    </div>
                    <button
                      className="ml-auto bg-red-500 text-white px-3 py-1 rounded font-bold hover:bg-red-700"
                      onClick={() => handleDeleteGuild(guild.guildId)}
                    >
                      Xoá Guild
                    </button>
                  </div>
                  {/* Quản lý sự kiện */}
                  <div className={"mt-4 pl-4" + user?.isAdmin ? "" : " opacity-50 pointer-events-none"}>
                    <div className="font-semibold text-[#ffb800] mb-2">Sự kiện</div>
                    <div className="flex gap-2 mb-2">
                      <input
                        className="px-2 py-1 rounded border border-gray-400"
                        placeholder="Tên sự kiện"
                        value={newEvent[guild.guildId]?.name || ""}
                        onChange={e =>
                          setNewEvent(prev => ({
                            ...prev,
                            [guild.guildId]: {
                              ...(prev[guild.guildId] || {}),
                              name: e.target.value,
                            },
                          }))
                        }
                      />
                      <input
                        className="px-2 py-1 rounded border border-gray-400"
                        type="date"
                        value={newEvent[guild.guildId]?.date || ""}
                        onChange={e =>
                          setNewEvent(prev => ({
                            ...prev,
                            [guild.guildId]: {
                              ...(prev[guild.guildId] || {}),
                              date: e.target.value,
                            },
                          }))
                        }
                      />
                      <button
                        className="bg-green-500 text-white px-3 py-1 rounded font-bold"
                        onClick={() => handleAddEvent(guild.guildId)}
                      >
                        Thêm sự kiện
                      </button>
                    </div>
                    <ul className="space-y-1">
                      {(guild.events || []).map((event: Event) => (
                        <li key={event.eventId} className="flex items-center gap-2">
                          <span className="text-white">{event.name}</span>
                          <span className="text-gray-400 text-xs">{event.date}</span>
                          <button
                            className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold hover:bg-red-700"
                            onClick={() => handleDeleteEvent(guild.guildId, event.eventId)}
                          >
                            Xoá
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
