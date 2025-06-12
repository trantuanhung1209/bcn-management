import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../../../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { guildId, memberId },
    method,
  } = req;

  const db = (await clientPromise).db("bcn_management");
  const guilds = db.collection("guilds");

  // Ép kiểu về string
  const gid = Array.isArray(guildId) ? guildId[0] : guildId;
  const mid = Array.isArray(memberId) ? memberId[0] : memberId;

  if (method === "DELETE") {
    // Xoá thành viên khỏi guild
    const result = await guilds.updateOne(
      { guildId: gid },
      {
        $pull: { members: mid, officers: mid } as any,
      }
    );
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy guild hoặc thành viên" });
    }
    return res.status(200).json({ success: true });
  }

  if (method === "PATCH") {
    // Cập nhật vai trò officer/member
    const { role } = req.body;
    if (!["officer", "member"].includes(role)) {
      return res.status(400).json({ message: "Role không hợp lệ" });
    }
    if (role === "officer") {
      // Thêm vào officers
      await guilds.updateOne(
        { guildId: gid },
        { $addToSet: { officers: mid } }
      );
    } else {
      // Xoá khỏi officers
      await guilds.updateOne(
        { guildId: gid },
        { $pull: { officers: mid } as any }
      );
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ message: "Method not allowed" });
}