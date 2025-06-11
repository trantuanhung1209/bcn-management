"use client";

import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const events = [
	{
		title: "Guild War Mùa Hè 2025",
		description:
			"Tham gia giải đấu liên guild toàn server, tổng giải thưởng lên tới 50.000.000 VNĐ!",
		image: "/event-trophy.png",
		time: "15/06 - 30/06/2025",
		link: "/events/summer-guild-war",
	},
	{
		title: "Đại Hội Guild Tháng 7",
		description: "Sự kiện offline lớn nhất năm dành cho các guild xuất sắc.",
		image: "/event-party.png",
		time: "20/07/2025",
		link: "/events/july-guild-party",
	},
	{
		title: "Mini Game: Đua Top Thành Viên",
		description:
			"Đua top thành viên tích cực nhận quà hấp dẫn từ BTC.",
		image: "/event-minigame.png",
		time: "01/07 - 10/07/2025",
		link: "/events/minigame-top-member",
	},
	{
		title: "Săn Boss Liên Guild",
		description:
			"Tham gia săn boss cùng các guild khác, nhận phần thưởng hiếm.",
		image: "/event-boss.png",
		time: "25/06/2025",
		link: "/events/guild-boss-hunt",
	},
	{
		title: "Workshop Lãnh Đạo Guild",
		description:
			"Học hỏi kỹ năng quản lý và phát triển cộng đồng.",
		image: "/event-workshop.png",
		time: "05/07/2025",
		link: "/events/guild-leader-workshop",
	},
];

export default function GuildEventBanner() {
	const [startIdx, setStartIdx] = useState(0);
	const maxVisible = 4;
	const canPrev = startIdx > 0;
	const canNext = startIdx + maxVisible < events.length;

	const handlePrev = () => {
		if (canPrev) setStartIdx(startIdx - 1);
	};
	const handleNext = () => {
		if (canNext) setStartIdx(startIdx + 1);
	};

	return (
		<div className="relative mb-6 px-[20px] pb-[30px]">
            <h2 className="text-3xl font-bold text-[#ffb800] py-[20px] mb-4">Sự kiện nổi bật</h2>
			<div className="flex items-center gap-2">
				<button
					className={`p-2 rounded-full bg-[#ffb800] text-[#232946] shadow-lg hover:bg-[#ffd700] transition disabled:opacity-40`}
					onClick={handlePrev}
					disabled={!canPrev}
					aria-label="Xem sự kiện trước"
				>
					<FaChevronLeft size={20} />
				</button>
				<div className="flex-1 overflow-hidden">
					<div className="grid grid-cols-4 gap-4 transition-all duration-300">
						{events
							.slice(startIdx, startIdx + maxVisible)
							.map((ev) => (
								<div
									key={ev.title}
									className="bg-gradient-to-br from-[#ffb800] via-[#ff7b00] to-[#ffb800] rounded-xl shadow-lg p-4 flex flex-col items-center animate-pulse"
								>
									<img
										src={ev.image}
										alt={ev.title}
										className="w-16 h-16 rounded-full border-4 border-white shadow-lg bg-white object-contain mb-2"
									/>
									<div className="text-lg font-bold text-[#232946] mb-1 text-center">
										{ev.title}
									</div>
									<div className="text-[#232946] text-sm text-center mb-2">
										{ev.description}
									</div>
									<div className="text-xs text-[#232946] mb-1">
										<span className="font-semibold">Thời gian:</span>{" "}
										{ev.time}
									</div>
									<a
										href={ev.link}
										className="underline text-white font-semibold text-xs"
										target="_blank"
										rel="noopener noreferrer"
									>
										Xem chi tiết
									</a>
								</div>
							))}
					</div>
				</div>
				<button
					className={`p-2 rounded-full bg-[#ffb800] text-[#232946] shadow-lg hover:bg-[#ffd700] transition disabled:opacity-40`}
					onClick={handleNext}
					disabled={!canNext}
					aria-label="Xem sự kiện tiếp"
				>
					<FaChevronRight size={20} />
				</button>
			</div>
		</div>
	);
}