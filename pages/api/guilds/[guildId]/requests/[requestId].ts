import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { guildId, requestId },
    method,
  } = req;

  if (method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const db = (await clientPromise).db("bcn_management");
  const requests = db.collection("guild_requests");
  const guilds = db.collection("guilds");

  const { status } = req.body;
  if (!status || !["accepted", "declined"].includes(status)) {
    return res.status(400).json({ message: "Trạng thái không hợp lệ" });
  }

  // Tìm và cập nhật trạng thái request theo requestId
  const request = await requests.findOneAndUpdate(
    { requestId: requestId },
    { $set: { status } },
    { returnDocument: "after" }
  );

  if (!request) {
    return res.status(404).json({ message: "Không tìm thấy request" });
  }

  // Nếu duyệt thì thêm user vào members của guild
  if (status === "accepted") {
    await guilds.updateOne(
      { guildId: Array.isArray(guildId) ? guildId[0] : guildId },
      { $addToSet: { members: request.userId } }
    );
  }

  return res.status(200).json({ success: true, request });
}