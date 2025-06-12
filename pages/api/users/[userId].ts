import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { userId },
    method,
  } = req;

  const db = (await clientPromise).db("bcn_management");
  const users = db.collection("users");
  const guilds = db.collection("guilds");

  if (method === "GET") {
    const user = await users.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }
    return res.status(200).json(user);
  }

  if (method === "POST") {
    const { coin } = req.body;
    if (typeof coin !== "number") {
      return res.status(400).json({ message: "Coin không hợp lệ" });
    }

    // Cộng coin cho user
    await users.updateOne({ userId }, { $inc: { coin } });

    // Tìm tất cả guilds mà user là thành viên
    const joinedGuilds = await guilds.find({ members: userId }).toArray();

    // Với mỗi guild, tính lại fame = tổng coin của tất cả members
    for (const guild of joinedGuilds) {
      const memberIds = guild.members || [];
      const result = await users
        .aggregate([
          { $match: { userId: { $in: memberIds } } },
          { $group: { _id: null, totalCoin: { $sum: "$coin" } } },
        ])
        .toArray();
      const fame = result[0]?.totalCoin || 0;
      await guilds.updateOne({ guildId: guild.guildId }, { $set: { fame } });
    }

    // Lấy user để trả về
    const user = await users.findOne({ userId });

    return res.status(200).json({
      message: "Cập nhật coin thành công",
      coin: user?.coin || 0,
    });
  }

  return res.status(405).json({ message: "Method not allowed" });
}