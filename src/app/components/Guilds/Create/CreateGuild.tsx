"use client";

import { FaTimes } from "react-icons/fa";
import { Notification } from "../../Notification";
import { FaBars } from "react-icons/fa6";
import ParticlesBackground from "../../ParticlesBackground";
import { useState } from "react";
import { Sider } from "../../Sider/SiderMember";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const CLOUD_NAME = "dav7n3cu7"; // Thay bằng cloud_name của bạn
const UPLOAD_PRESET = "unsigned_guild"; // Thay bằng upload_preset của bạn

export const CreateGuild = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Lấy user hiện tại từ localStorage
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !logo) {
      Swal.fire("Lỗi", "Vui lòng nhập tên và chọn logo cho guild!", "error");
      return;
    }
    setLoading(true);

    // 1. Upload logo lên Cloudinary
    let logoUrl = "";
    if (logo) {
      const formData = new FormData();
      formData.append("file", logo);
      formData.append("upload_preset", UPLOAD_PRESET);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const uploadData = await uploadRes.json();
      if (!uploadData.secure_url) {
        setLoading(false);
        Swal.fire("Lỗi", "Upload ảnh thất bại!", "error");
        return;
      }
      logoUrl = uploadData.secure_url;
    }

    // 2. Gửi request tạo guild với logo là URL
    const res = await fetch("/api/guilds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        logo: logoUrl,
        masterId: user.userId,
      }),
    });

    setLoading(false);

    if (res.ok) {
      Swal.fire("Thành công!", "Tạo guild thành công!", "success").then(() => {
        router.push("/guilds");
      });
    } else {
      const data = await res.json();
      if (res.status === 409) {
        Swal.fire("Lỗi", "Tên guild đã tồn tại. Vui lòng chọn tên khác!", "error");
      } else {
        Swal.fire("Lỗi", data.message || "Tạo guild thất bại!", "error");
      }
    }
  };

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
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#ffb800] mb-4">Tạo Guild Mới</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Tên Guild</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded border border-gray-400 focus:outline-none"
                placeholder="Nhập tên guild"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Mô tả</label>
              <textarea
                className="w-full px-3 py-2 rounded border border-gray-400 focus:outline-none"
                placeholder="Nhập mô tả cho guild"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Logo</label>
              <input
                type="file"
                accept="image/*"
                className="w-full px-3 py-2 rounded border border-gray-400 focus:outline-none"
                onChange={(e) => setLogo(e.target.files?.[0] || null)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#ffb800] text-black px-6 py-2 rounded-full font-bold shadow-lg hover:bg-[#ffd700] transition cursor-pointer text-lg"
            >
              {loading ? "Đang tạo..." : "Tạo Guild"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
