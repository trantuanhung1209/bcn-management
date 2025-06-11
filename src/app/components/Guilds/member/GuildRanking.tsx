"use client";

interface Guild {
  guildId: string;
  name: string;
  logo: string;
  fame: number;
  level: number;
  members: string[];
}

interface User {
  userId: string;
  fullName: string;
}

export default function GuildRanking({ guilds, user }: { guilds: Guild[]; user: User | null }) {
  // Top 5 guilds theo fame
  const topGuilds = [...guilds].sort((a, b) => b.fame - a.fame).slice(0, 5);

  return (
    <div className="relative mb-8 px-[20px]">
      {/* Hiệu ứng gaming: ánh sáng, border động, glow, ... */}
      <div className="absolute inset-0 blur-2xl opacity-60 pointer-events-none animate-pulse"
        style={{
          background: "radial-gradient(circle at 50% 0%, #ffb800 0%, #232946 80%)"
        }}
      />
      <div className="relative z-10">
        <h2 className="text-3xl font-bold text-[#ffb800] py-[20px] mb-4 flex items-center gap-2">
          <span className="animate-bounce">🏆</span> Bảng xếp hạng Guilds
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[#181c2b] rounded-xl shadow-xl text-white">
            <thead>
              <tr className="text-[#ffb800] text-lg">
                <th className="py-2 px-4 text-left">#</th>
                <th className="py-2 px-4 text-left">Logo</th>
                <th className="py-2 px-4 text-left">Tên Guild</th>
                <th className="py-2 px-4 text-left">Fame</th>
                <th className="py-2 px-4 text-left">Level</th>
                <th className="py-2 px-4 text-left">Thành viên</th>
              </tr>
            </thead>
            <tbody>
              {topGuilds.map((guild, idx) => (
                <tr
                  key={guild.guildId}
                  className={`transition-all ${
                    idx === 0
                      ? "bg-[#232946] font-bold animate-glow"
                      : "hover:bg-[#232946]"
                  }`}
                  style={{
                    boxShadow:
                      idx === 0
                        ? "0 0 24px 8px #ffb800, 0 0 8px 2px #fff"
                        : undefined,
                  }}
                >
                  <td className="py-2 px-4 text-[#ffb800] text-xl">{idx + 1}</td>
                  <td className="py-2 px-4">
                    <img
                      src={guild.logo}
                      title={user?.fullName}
                      alt={guild.name}
                      className="w-10 h-10 rounded-full border-2 border-[#ffb800] object-cover shadow"
                      style={{
                        filter: idx === 0 ? "drop-shadow(0 0 8px #ffb800)" : undefined,
                      }}
                    />
                  </td>
                  <td className="py-2 px-4">{guild.name}</td>
                  <td className="py-2 px-4 text-[#00ffea] font-mono">{guild.fame}</td>
                  <td className="py-2 px-4 text-[#ffb800] font-mono">{guild.level}</td>
                  <td className="py-2 px-4">{guild.members.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* CSS hiệu ứng glow cho top 1 */}
      <style>{`
        .animate-glow {
          animation: glow 1.5s infinite alternate;
        }
        @keyframes glow {
          from { box-shadow: 0 0 24px 8px #ffb800, 0 0 8px 2px #fff; }
          to { box-shadow: 0 0 40px 16px #ffb800, 0 0 16px 4px #fff; }
        }
      `}</style>
    </div>
  );
}