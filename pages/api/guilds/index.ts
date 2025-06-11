import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const db = (await clientPromise).db("bcn_management");
  const collection = db.collection("guilds");

  if (req.method === "GET") {
    // Lấy danh sách tất cả guilds
    const guilds = await collection.find({}).toArray();
    return res.status(200).json({ guilds });
  }

  if (req.method === "POST") {
    // Tạo guild mới
    const { name, logo, description, masterId } = req.body;
    if (!name || !logo || !masterId) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin bắt buộc." });
    }

    // Kiểm tra tên guild đã tồn tại chưa
    const existed = await collection.findOne({ name });
    if (existed) {
      return res
        .status(409)
        .json({ success: false, message: "Tên guild đã tồn tại." });
    }

    const newGuild = {
      guildId: new Date().getTime().toString(),
      name,
      logo,
      description: description || "",
      masterId,
      officers: [],
      members: [masterId],
      createdAt: new Date(),
      level: 1,
      fame: 0,
    };

    await collection.insertOne(newGuild);
    return res.status(201).json({ success: true, guild: newGuild });
  }

  return res.status(405).json({ message: "Method not allowed" });
}
