import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { guildId },
    method,
  } = req;

  const db = (await clientPromise).db("bcn_management");
  const guilds = db.collection("guilds");

  if (method === "GET") {
    // Lấy danh sách thành viên của guild
    const guild = await guilds.findOne({ guildId: Array.isArray(guildId) ? guildId[0] : guildId });
    if (!guild) {
      return res.status(404).json({ message: "Không tìm thấy guild" });
    }
    return res.status(200).json({ members: guild.members || [], officers: guild.officers || [] });
  }

  if (method === "POST") {
    // Thêm thành viên mới vào guild
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }
    const result = await guilds.updateOne(
      { guildId: Array.isArray(guildId) ? guildId[0] : guildId },
      { $addToSet: { members: userId } }
    );
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy guild hoặc thành viên đã tồn tại" });
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ message: "Method not allowed" });
}