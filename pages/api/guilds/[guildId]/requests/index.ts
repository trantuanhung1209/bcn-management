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
  const requests = db.collection("guild_requests");

  if (method === "GET") {
    // Lấy danh sách yêu cầu tham gia guild
    const reqs = await requests.find({ guildId: guildId, status: "pending" }).toArray();
    return res.status(200).json({ requests: reqs });
  }

  if (method === "POST") {
    // Gửi yêu cầu tham gia guild
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }
    // Kiểm tra đã gửi yêu cầu chưa
    const existed = await requests.findOne({ guildId: guildId, userId, status: "pending" });
    if (existed) {
      return res.status(409).json({ message: "Đã gửi yêu cầu trước đó" });
    }
    // Tạo request mới
    const newReq = {
      guildId: guildId,
      requestId: new Date().getTime().toString(),
      userId,
      status: "pending",
      createdAt: new Date(),
    };
    await requests.insertOne(newReq);
    return res.status(201).json({ success: true, request: newReq });
  }

  return res.status(405).json({ message: "Method not allowed" });
}