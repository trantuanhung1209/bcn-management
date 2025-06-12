"use client";

import { useEffect, useState } from "react";
import { FaCoins } from "react-icons/fa6";
import Swal from "sweetalert2";

const GIFT_BOXES = [
  { level: 1, hours: 1, coin: 1},
  { level: 2, hours: 2, coin: 2},
  { level: 3, hours: 3, coin: 3},
  { level: 4, hours: 4, coin: 4},
  { level: 5, hours: 5, coin: 5},
  { level: 6, hours: 6, coin: 6},
  { level: 7, hours: 7, coin: 7},
  { level: 8, hours: 8, coin: 8},
  { level: 9, hours: 9, coin: 9},
  { level: 10, hours: 10, coin: 10},
];

function getTodayKey() {
  const today = new Date();
  return `online_hours_${today.getFullYear()}_${
    today.getMonth() + 1
  }_${today.getDate()}`;
}
function getClaimedKey() {
  const today = new Date();
  return `claimed_boxes_${today.getFullYear()}_${
    today.getMonth() + 1
  }_${today.getDate()}`;
}

export default function OnlineGiftBox({ onClaimSuccess }: { onClaimSuccess?: () => void }) {
  const [userOnlineSeconds, setUserOnlineSeconds] = useState(0);
  const [claimedBoxes, setClaimedBoxes] = useState<number[]>([]);

  // Lấy số giây online và trạng thái nhận quà khi load
  useEffect(() => {
    const key = getTodayKey();
    const claimedKey = getClaimedKey();
    const seconds = Number(localStorage.getItem(key) || 0);
    setUserOnlineSeconds(seconds);

    const claimed = JSON.parse(localStorage.getItem(claimedKey) || "[]");
    setClaimedBoxes(claimed);

    // Cập nhật realtime mỗi giây
    const interval = setInterval(() => {
      const seconds = Number(localStorage.getItem(key) || 0);
      setUserOnlineSeconds(seconds);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Nhận quà
  const handleClaim = async (coin: number, level: number) => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userData.userId;

    // Gọi API cập nhật fame/coin
    if (userId) {
      const res = await fetch(`/api/users/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coin }),
      });

      const data = await res.json();
      if (!res.ok) {
        Swal.fire("Lỗi", data.message || "Có lỗi xảy ra!", "error");
        return;
      }
    }

    const claimedKey = getClaimedKey();
    const newClaimed = [...claimedBoxes, level];
    setClaimedBoxes(newClaimed);
    localStorage.setItem(claimedKey, JSON.stringify(newClaimed));
    Swal.fire(
      "Nhận quà thành công!",
      `Bạn nhận được ${coin} coin từ hộp quà cấp ${level}`,
      "success"
    ).then(() => {
      if (onClaimSuccess) onClaimSuccess();
    });

  };

  return (
    <div className="bg-[#232946] rounded-xl shadow-lg p-6 max-w-4xl mx-auto mt-8">
      <h2 className="text-xl font-bold text-[#ffb800] mb-4">
        Nhiệm vụ Online - Hộp Quà
      </h2>
      <div className="mb-2 text-white">
        Tổng số giờ online hôm nay:{" "}
        <b>
          {Math.floor(userOnlineSeconds / 3600)} giờ{" "}
          {Math.floor((userOnlineSeconds % 3600) / 60)} phút
        </b>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {GIFT_BOXES.map((box, idx) => {
          const requiredSeconds = box.hours * 3600;
          const claimedBox = claimedBoxes.includes(box.level);
          const prevClaimed =
            box.level === 1 || claimedBoxes.includes(box.level - 1);
          const canClaim =
            userOnlineSeconds >= requiredSeconds &&
            !claimedBox &&
            (prevClaimed || idx === 0);

          return (
            <div
              key={box.level}
              className={`min-w-[200px] p-4 rounded-lg border flex flex-col items-center ${
                claimedBox
                  ? "border-green-400 bg-green-900/30"
                  : canClaim
                  ? "border-yellow-400 bg-yellow-900/10"
                  : "border-gray-600 bg-gray-800/30"
              }`}
            >
              <div className="font-bold text-lg text-[#ffb800]">
                Hộp quà cấp {box.level}
              </div>
              <div className="text-white text-sm mb-2">
                Yêu cầu: {box.hours} giờ online
              </div>
              <div className="text-white text-sm mb-2">
                Phần thưởng:{" "}
                <b>
                  {box.coin} <FaCoins className="inline text-yellow-400" />
                </b>
              </div>
              <div className="text-white text-xs mb-1">
                Đã online: {Math.floor(userOnlineSeconds / 3600)} giờ{" "}
                {Math.floor((userOnlineSeconds % 3600) / 60)} phút / {box.hours}{" "}
                giờ
              </div>
              {claimedBox ? (
                <span className="text-green-400 font-bold">Đã nhận</span>
              ) : canClaim ? (
                <button
                  className="bg-[#ffb800] text-black px-3 py-1 rounded font-bold hover:bg-yellow-400 transition cursor-pointer"
                  onClick={() => handleClaim(box.level, box.coin)}
                >
                  Nhận quà
                </button>
              ) : (
                <span className="text-gray-400">Chưa đủ điều kiện</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
