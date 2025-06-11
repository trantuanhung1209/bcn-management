import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { guildId },
    method,
  } = req;

  const db = (await clientPromise).db("bcn_management");
  const collection = db.collection("guilds");

  if (method === "GET") {
    const guild = await collection.findOne({ guildId: guildId });
    if (!guild) {
      return res.status(404).json({ message: "Không tìm thấy guild" });
    }
    return res.status(200).json({ guild });
  }

  // Có thể bổ sung PATCH, DELETE ở đây nếu cần

  return res.status(405).json({ message: "Method not allowed" });
}